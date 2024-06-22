from dataclasses import dataclass
import boto3
import botocore
from botocore import UNSIGNED
from botocore.config import Config


@dataclass
class DownloadVerified():
    """
    Class for downloading the images from a given S3 bucket
    """

    BUCKET_NAME: str
    PATH: str
    verified_images: list

    def process(self):
        s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))
        try:
            my_bucket = s3.Bucket(self.BUCKET_NAME)
            for image in self.verified_images:
                name = image.split('/')[-1]
                my_bucket.download_file(self.PATH + name, name)
        except botocore.exceptions.ClientError as e: 
            if e.response['Error']['Code'] == "404":
                print("The object does not exist.")
            else:
                raise
        return self

    def get(self) -> None:
        return None