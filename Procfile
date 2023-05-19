web: gunicorn app:app
worker: celery -A celery_app.celery_app worker --loglevel=info