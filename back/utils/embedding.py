from sentence_transformers import SentenceTransformer

# Shared embedding model for use outside Chroma
embed_model = SentenceTransformer("all-MiniLM-L6-v2")