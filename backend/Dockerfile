FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--workers=2", "--bind=0.0.0.0:8000", "config.wsgi:application"]