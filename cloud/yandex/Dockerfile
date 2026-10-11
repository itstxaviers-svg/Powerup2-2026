FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8080

WORKDIR /app

COPY requirements.txt requirements-vm.txt ./
RUN pip install --no-cache-dir -r requirements-vm.txt

COPY index.py server.py ./

EXPOSE 8080
CMD ["python", "server.py"]
