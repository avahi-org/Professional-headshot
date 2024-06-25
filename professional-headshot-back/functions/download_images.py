from dataclasses import dataclass
import boto3
import botocore
from botocore import UNSIGNED
from botocore.config import Config


@dataclass
class DownloadImages():
    """
    Class for downloading the images from a given S3 bucket
    """

    BUCKET_NAME: str
    PATH: str
    temp_folder: str

    def process(self):
        s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))
        try:
            my_bucket = s3.Bucket(self.BUCKET_NAME)
            for item in my_bucket.objects.filter(Prefix=self.PATH):
                split_object = item.key.split('/')
                if split_object[-1] != '':
                    file = item.key.split(self.PATH)[1]
                    print(file)
                    my_bucket.download_file(self.PATH + file, f'{self.temp_folder}/{file}')

        except botocore.exceptions.ClientError as e: 
            if e.response['Error']['Code'] == "404":
                print("The object does not exist.")
            else:
                raise
        return self

    def get(self) -> None:
        return None