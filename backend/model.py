from transformers import DistilBertModel, DistilBertTokenizer

def load_model(): 
    tokenizer = DistilBertTokenizer.from_pretrained(
        "distilbert-base-uncased", 
    )

    model = DistilBertModel.from_pretrained(
        "distilbert-base-uncased",
        output_attentions=True, 
        attn_implementation="eager"
    )

    model.eval()

    return tokenizer, model

if __name__ == "__main__":
    tokenizer, model = load_model()
    print("Model and tokenizer loaded successfully.")