from dataclasses import (
    dataclass,
    field
)
import boto3
import botocore
from botocore import UNSIGNED
from botocore.config import Config


@dataclass
class GetPreviewImages():
    """
    Class for downloading the images from a given S3 bucket
    """

    BUCKET_NAME: str
    PATH: str
    images_path: list = field(default_factory=list)

    def process(self):
        s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))
        try:
            my_bucket = s3.Bucket(self.BUCKET_NAME)
            for item in my_bucket.objects.filter(Prefix=self.PATH):
                split_object = item.key.split('/')
                if split_object[-1] != '':
                    file = item.key.split(self.PATH)[1]
                    self.images_path.append(f'https://{self.BUCKET_NAME}.s3.amazonaws.com/{self.PATH}{file}')
        except botocore.exceptions.ClientError as e: 
            if e.response['Error']['Code'] == "404":
                print("The object does not exist.")
            else:
                raise
        return self

    def get(self) -> list:
        return self.images_path
