from dataclasses import dataclass
import subprocess


@dataclass
class DeleteImages:
    # images: list
    folder: str

    def process(self):
        command_list = ['rm', '-r']
        # command_list.extend(self.images)
        command_list.append(self.folder)

        subprocess.run(command_list)

        return self

    def get(self) -> None:
        return self
