from model import load_model
import torch

def run_inference(text):
    tokenizer, model = load_model()
    inputs = tokenizer(text, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    return outputs, tokenizer, inputs

attention_cache = {}

def run_inference_with_cache(text):
    # If text is cached, return the tuple (attentions, tokens)
    if text in attention_cache:
        print("Returning cached attention.")
        return attention_cache[text]
    
    outputs, tokenizer, inputs = run_inference(text)
    
    # Extract tokens using the tokenizer -> used for visualization
    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    
    # Cache the tuple (outputs.attentions, tokens)
    attention_cache[text] = (outputs.attentions, tokens)
    
    return outputs.attentions, tokens

if __name__ == "__main__":
    sample_text = "This is a sample sentence for attention visualization."
    attentions, tokens = run_inference_with_cache(sample_text)
    print("Tokens:", tokens)
    for i, attn in enumerate(attentions):
        print(f"Layer {i} attention shape: {attn.shape}")
