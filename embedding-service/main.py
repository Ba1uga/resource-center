from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Resource Center Embedding Service")

print("Loading BGE-large-zh-v1.5 model (first load downloads ~2GB)...")
model = SentenceTransformer("BAAI/bge-large-zh-v1.5")
print(f"Model loaded. Dimension: {model.get_sentence_embedding_dimension()}")


class EmbedRequest(BaseModel):
    texts: list[str]


class EmbedResponse(BaseModel):
    embeddings: list[list[float]]
    dimensions: int


@app.post("/embed", response_model=EmbedResponse)
async def embed(request: EmbedRequest):
    embeddings = model.encode(
        request.texts,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return EmbedResponse(
        embeddings=embeddings.tolist(),
        dimensions=embeddings.shape[1],
    )


@app.get("/health")
async def health():
    return {"status": "ok", "model": "bge-large-zh-v1.5"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
