from functions.get_images import GetImages
import os
import subprocess
import sys

def main():
    """
    Define the initial values
    """
    directory = os.getcwd()
    num_args = len(sys.argv)
    tune_job_name = sys.argv[1] if num_args > 2 else "MyTuneJob"
    classname = sys.argv[2] if num_args > 3 else "man"
    folder_name = sys.argv[-1]
    command_list = ["python", "functions/astria.py",
                    "tune", tune_job_name, classname]

    """
    Get the images from the folder
    """
    images = (
        GetImages(
            folder_name=folder_name,
            directory=directory
            )
        .process()
        .get()
    )

    command_list.extend(images)

    """
    Call astria.py file that is in the functions folder
    """
    subprocess.run(command_list)

if __name__ == "__main__":
    main()