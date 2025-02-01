# backend/app.py
from flask import Flask, request, jsonify
from inference import run_inference_with_cache

app = Flask(__name__)

@app.route('/get_attention', methods=['POST'])
def get_attention():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    attentions = run_inference_with_cache(text)
    # Convert tensor to list for JSON serialization
    attentions_list = [attn.tolist() for attn in attentions]
    return jsonify({"attentions": attentions_list})

if __name__ == '__main__':
    app.run(debug=True)
