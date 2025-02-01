from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import run_inference_with_cache

app = Flask(__name__)


CORS(app, origins=["http://127.0.0.1:5500"], methods=["GET", "POST", "OPTIONS"], allow_headers="*")


@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/get_attention', methods=['POST', 'OPTIONS'])
def get_attention():
    if request.method == 'OPTIONS':
        # Return an empty response with proper headers for preflight
        return jsonify({}), 200

    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    attentions, tokens = run_inference_with_cache(text)
    attentions_list = [attn.tolist() for attn in attentions]
    return jsonify({"attentions": attentions_list, "tokens": tokens})
