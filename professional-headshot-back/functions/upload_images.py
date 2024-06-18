from dataclasses import dataclass
import boto3
from botocore import UNSIGNED
from botocore.config import Config


@dataclass
class UploadImages:

    images: list
    bucket: str = "backend-professional-headshot-test-avahi"
    object_prefix: str = 'images/'

    def process(self):
        s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))

        for image in self.images:
            image_name = image.split('/')[-1]
            object_name = self.object_prefix + image_name
            s3.Bucket(self.bucket).upload_file(image, object_name)

        return self

    def get(self) -> None:
        return None
