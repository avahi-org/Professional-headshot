from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import os
import json
import threading
import re
from flask_cors import CORS
from functions.run_training import RunTraining
from functions.generate_images import GenerateImages
from functions.get_model_info import GetModelInfo
from functions.get_images import GetImages
from functions.upload_images import UploadImages
from functions.delete_images import DeleteImages
from functions.upload_model_info import UploadModelInfo


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})  # Allow requests from your frontend origin
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins="*")

generated_images = []
verified_images = []
images_event = threading.Event()

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
    # e_mail = re.sub('@*', '', data.get('userEmail'))
    # phone = data.get('phoneNumber')
    # object_prefix = f"{str(data.get('userID'))}-{e_mail}/generated-images/"
    # bucket_name = 'backend-professional-headshot-test-avahi'

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

    
    global generated_images, verified_images
    generated_images = images
    verified_images = []
    images_event.clear()
    
    socketio.emit('new_images', {'images': images})
    
    # Wait for verification
    images_event.wait()
    
    # Proceed with verified images
    return jsonify(
        {'message':
         'Image Generation and Verification is completed', 'verifiedImages': verified_images}), 200

    # plot_request_queue.put(True)
    # selected_images = plot_worker()

    # (
    #     UploadImages(
    #         images=selected_images,
    #         bucket=bucket_name,
    #         object_prefix=object_prefix)
    #     .process()
    #     .get()
    # )

    # (
    #     DeleteImages(images=images)
    #     .process()
    #     .get()
    # )

    # link_to_images = f"https://{bucket_name}.s3.amazonaws.com/{object_prefix}"


# Verify the images

@app.route('/api/verify-images', methods=['POST'])
def verify_images():
    data = request.json
    # images = data.get('allImages')
    e_mail = re.sub('@*', '', data.get('userEmail'))
    object_prefix = f"{str(data.get('userID'))}-{e_mail}/generated-images/"
    bucket_name = 'backend-professional-headshot-test-avahi'

    valid_images = data.get('validImages')
    
    global verified_images
    verified_images = valid_images
    images_event.set()

    (
        UploadImages(
            images=verified_images,
            bucket=bucket_name,
            object_prefix=object_prefix)
        .process()
        .get()
    )

    (
        DeleteImages(images=generated_images)
        .process()
        .get()
    )

    link_to_images = f"https://{bucket_name}.s3.amazonaws.com/{object_prefix}"

    return jsonify(
        {
            'message': 'Image Generation is completed',
            'link_to_images': link_to_images
        }
    ), 200

if __name__ == '__main__':

    app.run(debug=True, port=5000)
