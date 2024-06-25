from dataclasses import dataclass
import boto3
import botocore
from botocore import UNSIGNED
from botocore.config import Config


@dataclass
class CountImages():
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
            items = []
            for item in my_bucket.objects.filter(Prefix=self.PATH):
                split_key = item.key.split('/')
                final_list = ''.join(split_key[:2])
                items.append(final_list)
            items = set(items)
            self.id = len(items)
            # print(items)
            # print(len(items))

        except botocore.exceptions.ClientError as e: 
            if e.response['Error']['Code'] == "404":
                print("The object does not exist.")
            else:
                raise
        return self

    def get(self) -> int:
        return self.id
