from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

class FarmerChatbot:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
        self.model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
        self.chat_history_ids = None
        self.initial_prompt = (
            "You are AgriBot, a helpful farming assistant. You answer farmers' queries "
            "about crops, weather, fertilizers, pesticides, irrigation, and modern techniques in a simple, friendly way.\n"
            "Farmer: Hello\n"
            "AgriBot: Hello! I'm AgriBot, your smart farming assistant. How can I help you today?\n"
        )

    def get_response(self, user_input):
        # Prepend prompt
        full_input = self.initial_prompt + f"Farmer: {user_input}\nAgriBot:"
        new_input_ids = self.tokenizer.encode(full_input, return_tensors="pt")

        output_ids = self.model.generate(
            new_input_ids,
            max_length=500,
            pad_token_id=self.tokenizer.eos_token_id,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            temperature=0.7,
            num_return_sequences=1
        )

        output_text = self.tokenizer.decode(output_ids[:, new_input_ids.shape[-1]:][0], skip_special_tokens=True)

        return output_text.strip()





