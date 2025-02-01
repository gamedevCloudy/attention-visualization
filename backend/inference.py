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
    if text in attention_cache: 
        print("return cached..")
        return attention_cache[text]
    
    outputs, tokenizer, inputs = run_inference(text)
    attention_cache[text] = outputs.attentions
    return outputs.attentions

if __name__ == "__main__":

    sample_text = "Caching attention for this sample."
    attentions = run_inference(sample_text)
    print(attentions)
    attentions = run_inference_with_cache(sample_text)
    print(attentions)
    print("Cached attention layers retrieved.")