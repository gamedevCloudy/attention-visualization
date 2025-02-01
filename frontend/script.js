// run on load
document.addEventListener("DOMContentLoaded", () => {
  // get submit button and on click send post request
  const submitButton = document.getElementById("submitButton");
  submitButton.addEventListener("click", () => {
    const text = document.getElementById("inputText").value;

    fetch("http://127.0.0.1:5000/get_attention", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
      .then((response) => response.json())
      .then((data) => {
        // For simplicity, display raw JSON data; later, replace with a proper visualization.
        document.getElementById("visualization").innerText = JSON.stringify(
          data,
          null,
          2
        );
      })
      .catch((error) => console.error("Error:", error));
  });
});
