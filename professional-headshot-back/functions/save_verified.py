from dataclasses import dataclass
import os
import boto3
from botocore import UNSIGNED
from botocore.config import Config
from functions.download_verified import DownloadVerified
from functions.get_images import GetImages
from functions.upload_images import UploadImages
from functions.delete_images import DeleteImages


@dataclass
class SaveVerified:
    bucket_name: str
    user_key: str
    images: list

    def process(self):
        generated_path = 'generated-images'
        preview_path = 'preview-images'
        (
            DownloadVerified(BUCKET_NAME=self.bucket_name,
                       PATH=f'{self.user_key}/{preview_path}/',
                       verified_images=self.images)
                       .process()
                       .get()
        )
        print('Downloaded verified images')

        directory = os.getcwd()
        folder_path = ''
        images = GetImages(
            folder_name=folder_path,
            directory=directory
        ).process().get()
        print(images)

        (
            UploadImages(
                images=images,
                bucket=self.bucket_name,
                object_prefix=f'{self.user_key}/{generated_path}/'
            )
            .process()
            .get()
        )

        DeleteImages(images=images).process().get()

        s3 = boto3.resource('s3', config=Config(signature_version=UNSIGNED))
        bucket = s3.Bucket(self.bucket_name)
        bucket.objects.filter(Prefix=f'{self.user_key}/{preview_path}/').delete()

        return self

    def get(self) -> None:
        return None
