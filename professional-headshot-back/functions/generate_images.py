from dataclasses import dataclass
import subprocess
import os
from random import randint


@dataclass
class GenerateImages:
    api_key: str
    job_id: int
    working_dir: str
    seed: str
    prompt: str = 'sks man headshot of a banking professional wearing a nice suit'
    steps: str = '80'

    def process(self):
        # Set API KEY
        job_id = str(self.job_id)
        create_folder_command_list = ['mkdir', self.working_dir]
        subprocess.run(create_folder_command_list)
        print(f"This was the command for creating the folder: {create_folder_command_list}")
        os.environ['ASTRIA_API_TOKEN'] = self.api_key
        directory = os.getcwd()

        command_list = ["python", f"{directory}/functions/astria.py", "gen",
                        "--seed", self.seed,"--steps", self.steps,
                        "--download", job_id, self.prompt]
        
        # print('command list',command_list)
        subprocess.run(command_list, cwd=f'{directory}/{self.working_dir}')

        return self

    def get(self) -> None:
        return None
