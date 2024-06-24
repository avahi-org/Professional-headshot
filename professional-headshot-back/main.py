from flask import Flask, request, jsonify, Response
import os
import json
import threading
import secrets
import re
from flask_cors import CORS
from functions.run_training import RunTraining
from functions.generate_images import GenerateImages
from functions.get_model_info import GetModelInfo
from functions.get_images import GetImages
from functions.upload_images import UploadImages
from functions.delete_images import DeleteImages
from functions.upload_model_info import UploadModelInfo
from functions.get_preview_images import GetPreviewImages

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
CORS(app)#, resources={r"/api/*": {"origins": "*"}})  # Allow requests from your frontend origin
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
generated_images = []
verified_images = []
local_images = []
verification_details = {}
images_event = threading.Event()
verification_event = threading.Event()

def reset_globals():
    global generated_images, verified_images, verification_details, local_images
    generated_images = []
    verified_images = []
    verification_details = {}
    local_images = []

# Train the model

@app.route('/api/start-training', methods=['POST'])
def start_training():
    data = request.json
    api_key = data.get('apiKey')
    job_name = data.get('jobName')
    classname = data.get('classname')
    path = data.get('imagesInBucketPath') + '/'
    bucket_name = 'backend-professional-headshot-test-avahi'
    e_mail = re.sub('@*', '', data.get('userEmail'))
    phone = data.get('phoneNumber')
    object_prefix = f"{str(data.get('userID'))}-{e_mail}/model-info/"

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

    (
        UploadModelInfo(
            response_json=response_json,
            bucket=bucket_name,
            object_prefix=object_prefix
        )
        .process()
        .get()
    )

    return jsonify(response_json), 200

# Return available models

@app.route('/api/get-ids', methods=['POST'])
async def get_ids():
    data = request.json
    bucket = 'backend-professional-headshot-test-avahi'
    e_mail = re.sub('@*', '', data.get('userEmail'))
    path = f"{str(data.get('userID'))}-{e_mail}/model-info/"

    response_dict = (
        GetModelInfo(
            bucket=bucket,
            path=path
        )
        .process()
        .get()
    )

    return jsonify({'available_models': response_dict}), 200

# Generate images

@app.route('/api/generate-images', methods=['POST'])
def generate_images():
    data = request.json
    api_key = data.get('apiKey')
    prompt = data.get('prompt')
    job_id = data.get('jobID')
    classname = data.get('classname')
    e_mail = re.sub('@*', '', data.get('userEmail'))
    user_id = str(data.get('userID'))


    bucket_name = 'backend-professional-headshot-test-avahi'
    object_prefix = f"{user_id}-{e_mail}/generated-images/"
    prompt = f"sks {classname} "  + prompt
    temp_folder = f"{user_id}{e_mail}"
    GenerateImages(
        api_key=api_key,
        prompt=prompt,
        job_id=job_id,
        working_dir=temp_folder
    ).process().get()

    """
    Get the path for the generated images
    """
    directory = os.getcwd()

    folder_path = f"{temp_folder}/"
    images = GetImages(
        folder_name=folder_path,
        directory=directory
    ).process().get()

    with open(os.path.join(UPLOAD_FOLDER, 'output.json'), 'w') as f:
        json.dump(images, f)

    print("Training complete")

    """
    Upload the obtained images to a temporary S3 object
    """
    UploadImages(
        images=images,
        bucket=bucket_name,
        object_prefix=object_prefix
    ).process().get()

    DeleteImages(folder=temp_folder).process().get()

    link_to_images = f"https://{bucket_name}.s3.amazonaws.com/{object_prefix}"
    print("Image generation and upload is complete")

    response = jsonify({'message': 'Image Generation and Verification is completed', 'link_to_images': link_to_images})
    reset_globals()  # Reset global variables

    return response, 200

# Verify the images

@app.route('/api/verify-images', methods=['POST'])
def verify_images():
    data = request.json
    valid_images = data.get('validImages')
    global verified_images
    verified_images = valid_images
    verification_event.set()
    return jsonify({'message': 'Image verification completed'}), 200

# SSE for image updates

@app.route('/api/image-updates')
def image_updates():
    def generate():
        while True:
            images_event.wait()
            yield f"data: {json.dumps({'images': generated_images, 'details': verification_details})}\n\n"
            images_event.clear()
    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(host='0.0.0.0')
