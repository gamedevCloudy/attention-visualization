from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import run_inference_with_cache

app = Flask(__name__)

# Enable CORS for your frontend origin.
CORS(app, origins=["http://127.0.0.1:5500"], methods=["GET", "POST", "OPTIONS"], allow_headers="*")

@app.after_request
def add_cors_headers(response):
    # Double-check that the headers are added to every response.
    response.headers.add('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/get_attention', methods=['POST', 'OPTIONS'])
def get_attention():
    if request.method == 'OPTIONS':
        # Respond to preflight request.
        return jsonify({}), 200

    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    attentions = run_inference_with_cache(text)
    attentions_list = [attn.tolist() for attn in attentions]
    return jsonify({"attentions": attentions_list})

if __name__ == '__main__':
    app.run(debug=True)
