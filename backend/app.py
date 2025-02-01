from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import run_inference_with_cache

app = Flask(__name__)

# Enable CORS for the specified origin, methods, and headers.
CORS(
    app,
    origins=["http://127.0.0.1:5500"],
    methods=["GET", "POST", "OPTIONS"],
    allow_headers="*"
)

# Alternatively, you can also add an after-request hook to ensure headers are always present:
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/get_attention', methods=['POST', 'OPTIONS'])
def get_attention():
    # Handle preflight OPTIONS request:
    if request.method == 'OPTIONS':
        # Respond with an empty JSON and status 200
        response = jsonify({})
        response.status_code = 200
        return response

    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Call your inference function
    attentions = run_inference_with_cache(text)
    # Convert tensor data to lists for JSON serialization
    attentions_list = [attn.tolist() for attn in attentions]
    return jsonify({"attentions": attentions_list})

if __name__ == '__main__':
    app.run(debug=True)
