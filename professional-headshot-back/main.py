from flask import Flask, request, jsonify
import os
import json
from flask_cors import CORS
from functions.run_training import RunTraining
from functions.generate_images import GenerateImages
from functions.get_tunes import GetTunes
from functions.get_images import GetImages
from functions.upload_images import UploadImages
from functions.delete_images import DeleteImages


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})  # Allow requests from your frontend origin
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Generate images

@app.route('/api/generate-images', methods=['POST'])
def generate_images():
    data = request.json
    api_key = data.get('apiKey')
    prompt = data.get('prompt')
    job_id = data.get('jobID')
    classname = data.get('classname')
    bucket_name = 'backend-professional-headshot-test-avahi'
    object_prefix = 'images-test'

    def generate_thread(
            api_key: str,
            prompt: str,
            job_id: str):

        """
        Generate images
        """

        prompt = f"sks {classname} "  + prompt

        (
            GenerateImages(
                api_key=api_key,
                prompt=prompt,
                job_id=job_id
            )
            .process()
            .get()
        )

        """
        Get the path for the generated images
        """

        folder_path = ''
        directory = os.getcwd()
        images = (
            GetImages(
                folder_name=folder_path,
                directory=directory
                )
            .process()
            .get()
        )

        with open(os.path.join(UPLOAD_FOLDER, 'output.json'), 'w') as f:
            json.dump(images, f)
        print("Training complete")
        return images

    images = generate_thread(
        api_key=api_key,
        prompt=prompt,
        job_id=job_id
    )

    (
        UploadImages(
            images=images,
            object_prefix=object_prefix + '/')
        .process()
        .get()
    )

    (
        DeleteImages(images=images)
        .process()
        .get()
    )

    link_to_images = f"https://{bucket_name}.s3.amazonaws.com/{object_prefix}/"

    return jsonify(
        {'message': 'Image Generation is completed'}, link_to_images), 200

# Train the model

@app.route('/api/start-training', methods=['POST'])
def start_training():
    data = request.json
    api_key = data.get('apiKey')
    job_name = data.get('jobName')
    classname = data.get('classname')
    path = data.get('imagesInBucketPath') + '/'
 
    # Set API KEY
    os.environ['ASTRIA_API_TOKEN'] = api_key

    response_json = (
        RunTraining(
            job_name=job_name,
            classname=classname,
            path=path
        )
        .process()
        .get()
    )

    return jsonify(response_json), 200

# Return available models

@app.route('/api/get-ids', methods=['POST']) 
async def get_ids():
    data = request.json
    api_key = data.get('apiKey')
    response_dict = (
        GetTunes(astria_api_key=api_key)
        .process()
        .get()
    )
    return jsonify(response_dict), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
