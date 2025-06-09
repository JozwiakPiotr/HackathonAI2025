import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain.chains import RetrievalQA
from langchain_community.llms import Ollama
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate


# Load HuggingFace embedding model
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
POLISH_PROMPT = PromptTemplate(
    template=(
        "Odpowiadaj zawsze po polsku, jasno i precyzyjnie.\n"
        "Na podstawie poniższych dokumentów:\n\n"
        "{context}\n\n"
        "Pytanie: {question}\n"
        "Odpowiedź:"
    ),
    input_variables=["question"]
)

def load_docs_from_dir(dir_path, chunk_size=1000, overlap=200):
    docs = []
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=overlap)

    for fname in os.listdir(dir_path):
        fpath = os.path.join(dir_path, fname)

        # PDF support
        if fname.lower().endswith(".pdf"):
            loader = PyPDFLoader(fpath)
            pages = loader.load()
            chunks = splitter.split_documents(pages)
            for chunk in chunks:
                chunk.metadata["source"] = fname
            docs.extend(chunks)

        # TXT and MD files
        elif fname.lower().endswith((".txt", ".md")):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read().strip()
            chunks = splitter.split_text(content)
            for chunk in chunks:
                docs.append(Document(page_content=chunk, metadata={"source": fname}))

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

def ask_question(query):
    try:
        db = FAISS.load_local("faiss_index", embedding_model)
    except Exception:
        db = build_vector_store()

    qa_chain = RetrievalQA.from_chain_type(
        llm=Ollama(model="llama3"),
        retriever=db.as_retriever(search_kwargs={"k": 5}),
        return_source_documents=True,
        chain_type="stuff",
        chain_type_kwargs={"prompt": POLISH_PROMPT}
    )
    result = qa_chain.invoke(query)
    return {
        "answer": result["result"],
        "sources": [doc.metadata["source"] for doc in result["source_documents"]],
    }