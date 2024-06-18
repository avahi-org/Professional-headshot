from dataclasses import dataclass
import subprocess
import os


@dataclass
class GenerateImages:
    api_key: str
    prompt: str = 'sks man headshot of a banking professional wearing a nice suit'
    job_id: str = '1371459'
    steps: str = '80'

    def process(self):
        # Set API KEY
        os.environ['ASTRIA_API_TOKEN'] = self.api_key

        command_list = ["python", "astria.py", "gen",
                        "--steps", self.steps, "--download",
                        self.job_id, self.prompt]
        
        subprocess.run(command_list)

        return self

    def get(self) -> None:
        return None
