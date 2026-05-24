from fastapi import FastAPI
from pydantic import BaseModel
import os, shutil

MODEL_NAME = "BAAI/bge-large-zh-v1.5"
HF_HOME = os.environ.get("HF_HOME", "/app/.cache/huggingface")
MODEL_DIR = os.path.join(HF_HOME, "hub", "models--BAAI--bge-large-zh-v1.5")

app = FastAPI(title="Resource Center Embedding Service")

print(f"Downloading {MODEL_NAME} from ModelScope...")
from modelscope import snapshot_download
local_path = snapshot_download(MODEL_NAME, cache_dir=HF_HOME)
print(f"Model downloaded to: {local_path}")

# Switch HF endpoint to local so SentenceTransformer reads from disk
os.environ["HF_ENDPOINT"] = ""
from sentence_transformers import SentenceTransformer

print(f"Loading {MODEL_NAME} from local cache...")
model = SentenceTransformer(local_path, local_files_only=True)
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
