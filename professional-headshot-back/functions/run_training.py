from dataclasses import dataclass
from functions.get_images import GetImages
from functions.download_images import DownloadImages
from functions.get_info import GetInfo
import subprocess
import os


@dataclass
class RunTraining:
    """
    Class for running astria.py for training
    """

    job_name: str =  "MyTuneJob"
    classname: str = "man"
    bucket_name: str = "backend-professional-headshot-test-avahi"

    def process(self):

        """
        Define the initial values
        """
        directory = os.getcwd()
        folder_path = ""
        command_list = ["python", "functions/astria.py",
                        "tune", self.job_name, self.classname]

        """
        Download the images from the given S3 bucket
        """
        (
            DownloadImages(
                BUCKET_NAME=self.bucket_name,
                PATH='images/'
            )
            .process()
            .get()
        )

        """
        Get the images from the folder
        """

        images = (
            GetImages(
                folder_name=folder_path,
                directory=directory
                )
            .process()
            .get()
        )

        command_list.extend(images)

        """
        Call astria.py file that is in the functions folder. Save the stdout in the variable
        'command_output' to retrieve necessary information
        """
        process = subprocess.Popen(command_list, stdout=subprocess.PIPE, text=True)
        command_output = process.stdout.read()

        """
        Obtain the important info (id, title and eta) from the training response
        """
        self.training_response = (
            GetInfo(training_json=command_output)
            .process()
            .get()
        )

        return self

    def get(self) -> dict:
        return self.training_response
