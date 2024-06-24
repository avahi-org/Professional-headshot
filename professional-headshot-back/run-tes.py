import subprocess
from dataclasses import dataclass


@dataclass
class RunTest:
    command_list: list
    astria_path: str

    def process(self):
        subprocess.run(self.command_list)
        return self

    def get(self) -> None:
        return None