from dataclasses import dataclass
import boto3
from botocore import UNSIGNED
from botocore.config import Config


@dataclass
class UploadModelInfo:
    response_json: dict
    bucket: str
    object_prefix: str

    def process(self):
        s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))
        key = f'{self.object_prefix}{self.response_json["title"]}/{str(self.response_json["id"])}.txt'
        # s3.Bucket(self.bucket).upload_file(self.response_json["id"], object_name)
        s3.Object(bucket, key).put(Body='')
        # s3.Bucket(self.bucket).upload_file(self.response_json["id"], object_name)
        return self

    def get(self) -> None:
        return None

response_json = {'id': 5678, 'title': 'Modelo-Abel-2'}
bucket = 'backend-professional-headshot-test-avahi'
object_prefix = 'AbelModel' + '/model-info/'

(
    UploadModelInfo(
        response_json=response_json,
        bucket=bucket,
        object_prefix=object_prefix
    )
    .process()
    .get()
)
