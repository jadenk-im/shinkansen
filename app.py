from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from celery_app import celery_app

app = Flask(__name__)
app.config['TIMEOUT'] = 360
CORS(app, origins=[
    "http://metro.herokuapp.com",
    "https://metro.herokuapp.com",
    "http://localhost:5000",
    "https://localhost:5000",
    "http://127.0.0.1:5000",
    "https://127.0.0.1:5000"
], supports_credentials=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    prompt = request.form.get("prompt")
    if not prompt:
        return jsonify(message="Prompt is required"), 400

    result = celery_app.send_task("tasks.generate_response", args=(prompt,))
    # Return task id
    return jsonify({"task_id": str(result.id)}), 202

@app.route("/result/<task_id>", methods=["GET"])
def get_result(task_id):
    task = celery_app.AsyncResult(task_id)
    if task.state == "PENDING":
        response = {
            "state": task.state,
            "status": "Task is currently running."
        }
    elif task.state != "FAILURE":
        response = {
            "state": task.state,
            "result": task.result
        }
    else:
        # something went wrong in the background job
        response = {
            "state": task.state,
            "status": str(task.info)
        }
    return jsonify(response)

if __name__ == "__main__":
    app.run()
