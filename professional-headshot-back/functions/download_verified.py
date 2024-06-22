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
        print(f"""--------------------------------------------------------------
These are the verified images:
{self.verified_images}
--------------------------------------------------------------""")
        s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))
        try:
            print(f'********Bucket Name: {self.BUCKET_NAME}')
            print(f'********Path: {self.PATH}')
            my_bucket = s3.Bucket(self.BUCKET_NAME)
            for image in self.verified_images:
                splitted = image.split('/')
                name = image.split('/')[-1]
                print(f'********Image: {splitted}')
                print(f'********Image: {name}')
                print(f'********Full path: {self.PATH + name}')
                my_bucket.download_file(self.PATH + name, name)
        except botocore.exceptions.ClientError as e: 
            if e.response['Error']['Code'] == "404":
                print("The object does not exist.")
            else:
                raise
        return self

    def get(self) -> None:
        return None