from celery import Celery
from dotenv import load_dotenv
import os

load_dotenv()

broker_url = os.getenv("REDIS_URL")
result_backend = os.getenv("REDIS_URL")

celery_app = Celery(
    "celery_app",
    broker=broker_url,
    backend=result_backend,
    include=["tasks"],
)
