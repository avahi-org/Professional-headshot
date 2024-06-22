from dataclasses import dataclass
import boto3
from botocore import UNSIGNED
from botocore.config import Config


@dataclass
class DeletePreview:
    bucket_name: str
    s3_object: str

    def process(self):
        s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))
        bucket = s3.Bucket(self.bucket_name)
        bucket.objects.filter(Prefix=self.s3_object).delete()
        return self

    def get(self) -> None:
        return None
