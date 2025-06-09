import ollama

def query_ollama(prompt, model="llama3"):
    response = ollama.chat(model=model, messages=[{"role": "user", "content": prompt}])
    # response is a generator or iterator of chat events
    # get the final message content
    return response["message"]["content"] 