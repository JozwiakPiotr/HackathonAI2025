import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain.chains import RetrievalQA
from langchain_community.llms import Ollama

# Load HuggingFace embedding model
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def load_docs_from_dir(dir_path, chunk_size=500, overlap=50):
    docs = []
    for fname in os.listdir(dir_path):
        if not fname.lower().endswith((".txt", ".md")):
            continue
        fpath = os.path.join(dir_path, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read().strip()
        # chunk text
        start = 0
        while start < len(content):
            end = start + chunk_size
            chunk = content[start:end].strip()
            if chunk:
                metadata = {"source": fname}
                docs.append(Document(page_content=chunk, metadata=metadata))
            start = end - overlap
    return docs

def build_vector_store(dir_path="data/", force=False):
    if force and os.path.exists("faiss_index"):
        import shutil
        shutil.rmtree("faiss_index")

    docs = load_docs_from_dir(dir_path)
    if not docs:
        raise ValueError("No valid documents found in directory")

    vectordb = FAISS.from_documents(docs, embedding_model)
    vectordb.save_local("faiss_index")
    return vectordb

try:
    db = FAISS.load_local("faiss_index", embedding_model)
except Exception:
    db = build_vector_store()

qa_chain = RetrievalQA.from_chain_type(
    llm=Ollama(model="llama3"),
    retriever=db.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
)

def retrieve_docs(query):
    result = qa_chain(query)
    return {
        "answer": result["result"],
        "sources": [doc.metadata["source"] for doc in result["source_documents"]],
    }