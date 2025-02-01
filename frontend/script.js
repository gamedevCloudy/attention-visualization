// frontend/script.js

document.addEventListener("DOMContentLoaded", () => {
  const submitButton = document.getElementById("submitButton");
  const inputText = document.getElementById("inputText");
  const visualizationDiv = document.getElementById("visualization");

  submitButton.addEventListener("click", () => {
    const text = inputText.value;
    if (!text) {
      visualizationDiv.innerText = "Please enter some text.";
      return;
    }

    fetch("http://127.0.0.1:5000/get_attention", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Received data:", data);
        if (!data.attentions || data.attentions.length === 0) {
          visualizationDiv.innerText = "No attention data returned.";
          return;
        }

        // Extract the first layer and first head.
        // Expected shape: [batch, num_heads, seq_length, seq_length]
        const firstLayer = data.attentions[0];
        const firstHead = firstLayer[0];
        console.log("First head matrix:", firstHead);

        // Determine matrix dimensions.
        const numRows = firstHead.length;
        const numCols = firstHead[0].length; // assuming rectangular matrix

        // Generate dummy token labels for rows.
        const tokens = Array.from({ length: numRows }, (_, i) => "Token " + i);

        // Clear previous visualization.
        visualizationDiv.innerHTML = "";

        // Draw the heatmap using the alternative data join approach.
        drawHeatmapUsingDataJoin(firstHead, tokens);
      })
      .catch((error) => {
        console.error("Error fetching attention data:", error);
        visualizationDiv.innerText =
          "Error fetching attention data. See console for details.";
      });
  });
});

/**
 * Converts a 2D matrix into an array of cell objects where each object represents a cell.
 * If the cell value is an array, extracts the first element.
 * @param {Array} matrix - A 2D array (rows x cols)
 * @returns {Array} - Array of cell objects: {row, col, value}
 */
function getCellsFromMatrix(matrix) {
  const cells = [];
  matrix.forEach((rowData, i) => {
    rowData.forEach((val, j) => {
      // If val is an array, take its first element; otherwise, use val directly.
      let numericVal = Array.isArray(val) ? val[0] : val;
      cells.push({ row: i, col: j, value: numericVal });
    });
  });
  return cells;
}

/**
 * Draws a heatmap using D3.js and the data join pattern.
 * Adds tooltips and a simple legend.
 * @param {Array} matrix - 2D array (rows x cols) of attention scores.
 * @param {Array} tokens - Array of token strings for labeling rows.
 */
function drawHeatmapUsingDataJoin(matrix, tokens) {
  console.log("Drawing heatmap using data join approach...");

  // Convert the matrix to an array of cell objects.
  const cells = getCellsFromMatrix(matrix);
  console.log("Cells data:", cells);

  // Determine dimensions.
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const cellSize = 25;
  const width = cellSize * numCols;
  const height = cellSize * numRows;

  // Compute dynamic domain for the color scale.
  const flatValues = cells.map((d) => d.value);
  let minValue = d3.min(flatValues);
  let maxValue = d3.max(flatValues);
  if (minValue === maxValue) {
    maxValue = minValue + 0.001;
  }
  console.log("Color scale domain:", minValue, maxValue);

  // Create a color scale.
  const colorScale = d3
    .scaleSequential()
    .domain([minValue, maxValue])
    .interpolator(d3.interpolateBlues);

  // Remove any previous SVG.
  d3.select("#visualization").select("svg").remove();

  // Append an SVG element with extra margin for labels.
  const svg = d3
    .select("#visualization")
    .append("svg")
    .attr("width", width + 100) // extra space for labels
    .attr("height", height + 100)
    .append("g")
    .attr("transform", "translate(50,50)"); // leave margin for labels

  // Create a tooltip div (if not already created)
  let tooltip = d3.select("body").select(".tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("class", "tooltip");
  }

  // Bind data and create rectangles for each cell.
  svg
    .selectAll("rect")
    .data(cells)
    .enter()
    .append("rect")
    .attr("x", (d) => d.col * cellSize)
    .attr("y", (d) => d.row * cellSize)
    .attr("width", cellSize)
    .attr("height", cellSize)
    .style("fill", (d) => colorScale(d.value))
    .style("stroke", "#ccc")
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `Row: ${d.row} <br> Col: ${d.col} <br> Value: ${d.value.toFixed(3)}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Add row labels.
  svg
    .selectAll(".rowLabel")
    .data(tokens)
    .enter()
    .append("text")
    .text((d) => d)
    .attr("x", -5)
    .attr("y", (d, i) => i * cellSize + cellSize / 1.5)
    .style("text-anchor", "end")
    .style("font-size", "10px");

  // Add column labels.
  const colLabels = Array.from({ length: numCols }, (_, i) => "Col " + i);
  svg
    .selectAll(".colLabel")
    .data(colLabels)
    .enter()
    .append("text")
    .text((d) => d)
    .attr("x", (d, i) => i * cellSize + cellSize / 2)
    .attr("y", -5)
    .style("text-anchor", "middle")
    .style("font-size", "10px");

  // Add a simple legend.
  addLegend(d3.select("#visualization"), colorScale, minValue, maxValue);
}

/**
 * Adds a simple legend for the color scale.
 * @param {Object} container - The D3 selection for the visualization container.
 * @param {Function} colorScale - The D3 color scale.
 * @param {number} minValue - The minimum value in the scale.
 * @param {number} maxValue - The maximum value in the scale.
 */
function addLegend(container, colorScale, minValue, maxValue) {
  // Remove any existing legend.
  container.select(".legend").remove();

  // Append a legend container.
  const legendWidth = 200,
    legendHeight = 20;
  const legend = container
    .append("svg")
    .attr("class", "legend")
    .attr("width", legendWidth)
    .attr("height", legendHeight + 30)
    .style("margin-top", "20px");

  // Create a gradient for the legend.
  const gradient = legend
    .append("defs")
    .append("linearGradient")
    .attr("id", "legend-gradient");

  gradient
    .selectAll("stop")
    .data(d3.range(0, 1.01, 0.01))
    .enter()
    .append("stop")
    .attr("offset", (d) => d)
    .attr("stop-color", (d) =>
      colorScale(minValue + d * (maxValue - minValue))
    );

  // Append a rect using the gradient.
  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 10)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  // Add min and max labels.
  legend
    .append("text")
    .attr("x", 0)
    .attr("y", legendHeight + 25)
    .style("font-size", "10px")
    .text(minValue.toFixed(3));

  legend
    .append("text")
    .attr("x", legendWidth)
    .attr("y", legendHeight + 25)
    .style("font-size", "10px")
    .style("text-anchor", "end")
    .text(maxValue.toFixed(3));
}
