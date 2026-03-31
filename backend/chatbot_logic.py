import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load CSV data
data = pd.read_csv('datasets/chatbot_data.csv')

# Preprocess and vectorize
vectorizer = TfidfVectorizer()
tfidf = vectorizer.fit_transform(data['question'])

def get_bot_response(user_input):
    user_tfidf = vectorizer.transform([user_input])
    similarities = cosine_similarity(user_tfidf, tfidf)
    max_sim_index = similarities.argmax()
    max_score = similarities[0][max_sim_index]

    if max_score < 0.3:
        return "I'm sorry, I couldn't understand your question. Can you rephrase it?"
    return data['answer'].iloc[max_sim_index]
if __name__ == '__main__':
    while True:
        query = input("Ask something (or type 'exit' to quit): ")
        if query.lower() == 'exit':
            break
        answer = get_bot_response(query)
        print("Bot:", answer)
