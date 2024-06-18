from dataclasses import dataclass
import subprocess


@dataclass
class DeleteImages:
    images: list

    def process(self):
        command_list = ['rm', '-r']
        command_list.extend(self.images)

        subprocess.run(command_list)

        return self

    def get(self) -> None:
        return self
