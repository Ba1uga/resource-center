FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple \
    sentence-transformers>=3.0.0 \
    fastapi>=0.110.0 \
    uvicorn[standard]>=0.29.0 \
    modelscope>=1.27.0
COPY main.py .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
