from celery_app import celery_app
from dotenv import load_dotenv
import openai
import os

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
model_id = "gpt-4"

@celery_app.task(bind=True)
def generate_response(self, prompt):
    messages = [{"role": "user", "content": prompt}]
    openai.api_key = openai_api_key

    model_response = openai.ChatCompletion.create(
        model=model_id,
        messages=messages,
        temperature=1.0,
    )

    if model_response.choices:
        response_text = model_response.choices[0].message["content"].strip()
        return response_text
    else:
        return ""
