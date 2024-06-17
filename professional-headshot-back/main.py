from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from functions.run_training import RunTraining
import os

app = FastAPI()

# Allow CORS for all origins (for simplicity)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("templates/index.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

@app.post("/submit-strings")
async def submit_strings(
    api_key: str = Form(...),
    job_name: str = Form(...),
    classname: str = Form(...),
    folder_path: str = Form(...)
):
    os.environ['ASTRIA_API_TOKEN'] = api_key

    (
        RunTraining(
            job_name=job_name,
            classname=classname
        )
        .process()
        .get()
    )

    return {"message": "Success!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
