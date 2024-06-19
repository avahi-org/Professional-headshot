from dataclasses import (
    dataclass,
    field
)
import boto3
from botocore import UNSIGNED
from botocore.config import Config


@dataclass
class GetModelInfo:
    bucket: str
    path: str
    model_info: dict = field(default_factory=dict)

    def process(self):
        s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))
        my_bucket = s3.Bucket(self.bucket)

        for item in my_bucket.objects.filter(Prefix=self.path):
            split_object = item.key.split('/')

            if split_object[-1] != '':
                file = split_object[-1].replace('.txt', '')
                self.model_info[split_object[-2]] = file

        return self

    def get(self) -> dict:
        return self.model_info
