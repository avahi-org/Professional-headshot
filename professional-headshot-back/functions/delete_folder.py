from dataclasses import dataclass
import subprocess


@dataclass
class DeleteFolder:
    folder: str

    def process(self):
        command_list = ['rm', '-r']
        command_list.append(self.folder)

        subprocess.run(command_list)

        return self

    def get(self) -> None:
        return self
