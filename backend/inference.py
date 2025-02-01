# backend/inference.py
from model import load_model
import torch

def run_inference(text):
    tokenizer, model = load_model()
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs, tokenizer, inputs


# backend/inference.py (continued)
attention_cache = {}

def run_inference_with_cache(text):
    if text in attention_cache:
        print("Returning cached attention.")
        return attention_cache[text]
    outputs, tokenizer, inputs = run_inference(text)
    attention_cache[text] = outputs.attentions
    return outputs.attentions



if __name__ == "__main__":
    sample_text = "This is a sample sentence for attention visualization."
    outputs, tokenizer, inputs = run_inference(sample_text)
    # Print shapes of attention layers to verify
    for i, attn in enumerate(outputs.attentions):
        print(f"Layer {i} attention shape: {attn.shape}")
    

    sample_text = "Caching attention for this sample."
    attentions = run_inference_with_cache(sample_text)
    print("Cached attention layers retrieved.")

