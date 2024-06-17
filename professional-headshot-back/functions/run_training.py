from dataclasses import dataclass
from functions.get_images import GetImages
from functions.download_images import DownloadImages
import subprocess
import os
import sys
from io import StringIO
import re


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
        Call astria.py file that is in the functions folder
        """
        # write_stdout = StringIO()
        # sys.stdout = write_stdout
        process = subprocess.Popen(command_list, stdout=subprocess.PIPE, text=True)
        command_output = process.stdout.read()
        print(command_output)
        print("-------------")
        for i in range(10):
            print(command_output[i])

        # expression = r'(id)|(title)|(eta)|(created)'
        # test2 = ''.join(write_stdout.getvalue())
        # lista = test2.split("\n")
        # for i in lista:
        #     if bool(re.search(expression, i)):
        #         print(i)
        #         result = re.search(r'\d[^"]*', i)
        #         if result:
        #             print(result.group(0))

        return self

    def get(self) -> None:
        return None
