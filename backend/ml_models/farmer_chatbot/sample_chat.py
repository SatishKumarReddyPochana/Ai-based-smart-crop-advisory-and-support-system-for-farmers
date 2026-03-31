from chatbot_model import FarmerChatbot

if __name__ == '__main__':
    bot = FarmerChatbot()

    print("Farmer Chatbot is ready! Type 'exit' to end the chat.")
    while True:
        user_msg = input("You: ")
        if user_msg.lower() in ['exit', 'quit']:
            print("Chatbot: Goodbye! 👋")
            break
        reply = bot.get_response(user_msg)
        print("Chatbot:", reply)
