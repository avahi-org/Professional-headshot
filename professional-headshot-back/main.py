from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from functions.get_images import GetImages
import os
import subprocess
import boto3
import botocore
from botocore import UNSIGNED
from botocore.config import Config

app = FastAPI()

def test(
        job_name: str =  "MyTuneJob",
        classname: str = "man",
        folder_path: str = "Headshots"):
    """
    Define the initial values
    """
    directory = os.getcwd()
    folder_path = ""
    command_list = ["python", "functions/astria.py",
                    "tune", job_name, classname]

    """
    Get the images from the folder
    """

    get_paths()

    images = (
        GetImages(
            folder_name=folder_path,
            directory=directory
            )
        .process()
        .get()
    )

    command_list.extend(images)

    """
    Call astria.py file that is in the functions folder
    """
    subprocess.run(command_list)

def get_paths():

    BUCKET_NAME = 'backend-professional-headshot-test-avahi' 
    PATH = 'images/' 

    s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))

    try:
        my_bucket = s3.Bucket(BUCKET_NAME)
        for item in my_bucket.objects.filter(Prefix=PATH):
            split_object = item.key.split('/')
            if split_object[-1] != '':
                file = item.key.split(PATH)[1]
                print(file)
                s3.Bucket(BUCKET_NAME).download_file(PATH, file)
    except botocore.exceptions.ClientError as e: 
        if e.response['Error']['Code'] == "404":
            print("The object does not exist.")
        else:
            raise

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
    print(f"This is the API KEY: {api_key}")
    os.environ['ASTRIA_API_TOKEN'] = api_key
    print(f"This is the Job Name: {job_name}")
    print(f"This is the Classname: {classname}")
    print(f"This is the Folder Path: {folder_path}")
    test(job_name=job_name,
         classname=classname,
         folder_path=folder_path)
    return {"message": "Success!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
