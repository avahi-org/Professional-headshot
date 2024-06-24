import subprocess
import os
from random import randint
from dataclasses import dataclass


@dataclass
class TestDownload:
    astria_path: str
    new_folder: str
    seed: str = str(randint(1, 15000))
    steps: str = '80'
    job_id: int = 1394931
    prompt: str = 'sks man headshot of a corporate businessperson wearing a nice suit with an office in the background'


    def process(self):
        directory = os.getcwd()
        py_path = f"{directory}/{self.astria_path}"
        create_folder_command_list = ['mkdir', self.new_folder]
        subprocess.run(create_folder_command_list)
        # subprocess.run(['cd', self.new_folder])
        command_list = ["python", py_path, "gen",
                        "--seed", self.seed,"--steps", self.steps,
                        "--download", str(self.job_id), self.prompt]
        # subprocess.run(['cp', 'run-tes.py', f'{self.new_folder}/run-tes.py'])
        subprocess.run(command_list, cwd=f"{directory}/{self.new_folder}")
        return self

    def get(self) -> None:
        return None

astria_path = 'functions/astria.py'
new_folder = 'testFolder'

(
    TestDownload(astria_path=astria_path, new_folder=new_folder).process().get()
)