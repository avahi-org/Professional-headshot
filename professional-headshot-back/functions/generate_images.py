from dataclasses import dataclass
import subprocess
import os
from random import randint


@dataclass
class GenerateImages:
    api_key: str
    prompt: str = 'sks man headshot of a banking professional wearing a nice suit'
    job_id: str = '1371459'
    steps: str = '80'
    seed: str = str(randint(1, 15000))

    def process(self):
        # Set API KEY
        os.environ['ASTRIA_API_TOKEN'] = self.api_key

        command_list = ["python", "functions/astria.py", "gen",
                        "--steps", self.steps, "--seed", self.seed,
                        "--download", str(self.job_id), self.prompt]
        
        print('command list',command_list)

        subprocess.run(command_list)

        return self

    def get(self) -> None:
        return None
