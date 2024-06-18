from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from functions.run_training import RunTraining
from functions.generate_images import GenerateImages
from functions.get_tunes import GetTunes
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

# Set API KEY

@app.post("/set-key")
async def set_key(
    api_key: str = Form(...),
):
    global astria_api_key

    astria_api_key = api_key

    return {"message": "Success!"}

# Run Training

@app.post("/submit-strings")
async def submit_strings(
    api_key: str = Form(...),
    job_name: str = Form(...),
    classname: str = Form(...),
    folder_path: str = Form(...)
):
    os.environ['ASTRIA_API_TOKEN'] = astria_api_key

    response_json = (
        RunTraining(
            job_name=job_name,
            classname=classname
        )
        .process()
        .get()
    )

    print(response_json)

    return {"message": "Success!"}

# Get job ids

@app.post("/get-ids")
async def get_ids():
    response_dict = (
        GetTunes(astria_api_key=astria_api_key)
        .process()
        .get()
    )

    print(response_dict)

    return {"message": "Success!"}

# Generate images

@app.post("/generate-images")
async def generate_images(
    prompt: str = Form(...),
    job_id: str = Form(...)
):
    prompt = "sks man " + prompt

    (
        GenerateImages(
            prompt=prompt,
            job_id=job_id
        )
        .process()
        .get()
    )

    return {"message": "Success!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
