from fastapi import FastAPI, UploadFile, File
from retriever.vector_store import ask_question, build_vector_store
from starlette.middleware.cors import CORSMiddleware
import uuid, os
from transcriber.audio_utils import extract_audio
from transcriber.transcribe import transcribe_audio


app = FastAPI()
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/summarize/")
async def summarize(file: UploadFile = File(...)):
    return {"filename": file.filename, "content_type": file.content_type, "message": "File received successfully. Backend processing will handle the file later."}

@app.post("/query/")
async def query(query: str, file: str = None):
    """
    Endpoint to handle user queries.
    If a file is provided, it will be used to answer the query.
    If no file is provided, it will use the vector store to answer the query.
    It retrieves relevant documents and generates a response using the LLM + vector store.
    """
    result = ask_question(query, file)  # returns dict with 'answer' and 'sources'

    return {
        "query": query,
        "response": result["answer"], 
        "sources": result["sources"]
    }
    
@app.post("/build_vector_store/")
async def build_vector_store_endpoint():
    """
    Endpoint to trigger the vector store build process.
    This is useful for re-indexing documents.
    """
    try:
        build_vector_store(force=True)  # Force rebuild of the vector store
        return {"message": "Vector store built successfully"}
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/add_document/")
async def add_document(file: UploadFile = File(...)):
    """
    Endpoint to add a new document to the vector store.
    This is useful for adding new documents dynamically.
    """
    try:
        # Save the uploaded file temporarily
        contents = await file.read()
        with open(f"data/temp_{file.filename}", "wb") as f:
            f.write(contents)
        
        # Here you would typically process the file and add it to the vector store
        # For simplicity, we assume the file is a text document
        build_vector_store(force=True)  # Rebuild vector store
        
        return {"message": f"Document {file.filename} added successfully"}
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/transcript_and_add_to_vector_store/")
async def transcript_and_add_to_vector_store(file: UploadFile = File(...)):
    """
    Endpoint to transcribe an audio or video file and add the transcript to the vector store.
    """
    try:
        # Ensure temp directory exists
        os.makedirs("temp", exist_ok=True)

        # Save uploaded file temporarily
        temp_input = f"temp/{uuid.uuid4().hex}_{file.filename}"
        with open(temp_input, "wb") as f:
            f.write(await file.read())

        # Extract audio (for mp4/mp3/etc.)
        audio_path = extract_audio(temp_input)

        # Transcribe
        transcript = transcribe_audio(audio_path)

        # Save transcript as a .txt file in `data/`
        os.makedirs("data", exist_ok=True)
        transcript_file = f"data/{os.path.splitext(file.filename)[0]}.txt"
        with open(transcript_file, "w", encoding="utf-8") as f:
            f.write(transcript)

        # Rebuild vector store using all files in /data
        build_vector_store(force=True)

        # Cleanup
        os.remove(temp_input)
        os.remove(audio_path)

        return {
            "message": f"Transcript of {file.filename} added successfully",
            "transcript": transcript
        }

    except Exception as e:
        return {"error": str(e)}
    
@app.get("/document_list/")
async def document_list():
    """
    Endpoint to list all documents in the data folder.
    """
    try:
        files = os.listdir("data")
        return {"documents": files}
    except Exception as e:
        return {"error": str(e)}