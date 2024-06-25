from dataclasses import (
    dataclass,
    field
)
import os
import glob


@dataclass()
class GetImages():
    """
    Function to get all the images paths within a folder. The API
    needs to every photo to be provided via the CLI; e.g.

    python astria.py tune testtune man image1.png \
        image2.jpeg image3.jpeg image4.jpeg image5.jpeg \
        image6.jpeg image7.jpeg image8.jpeg image9.jpeg \
        image10.jpeg image11.jpeg

    So one must obtain all the images paths one by one.

    Variables:

    folder name -> Name of the folder where the images are saved. It must be living
                   in the same path as the code.
    image_extensions -> Most common image suffixes.
    images_path -> List with all the paths from the images.
    directory -> Current working directory.
    """

    folder_name: str
    directory: str
    # image_extensions: list[str] = field(
    #     default_factory=lambda: ['*.j*', '*.png', '*.gif', '*.bmp', '*.tiff', '*.heic'])
    image_extensions: list[str] = field(
        default_factory=lambda: ['.jpg', '.png', '.gif', '.bmp', '.tiff', '.heic', 'jpeg'])
    images_path: list[str] = field(default_factory=list)

    def process(self):
        self.directory += '/' + self.folder_name
        print(self.directory)
        # for extension in self.image_extensions:
        #     self.images_path.extend(
        #         glob.glob(
        #             os.path.join(
        #                 self.directory, extension)))
        for extension in self.image_extensions:
            for root, dirs, files in os.walk(self.directory):
                for file in files:
                    if file.endswith(extension):
                        self.images_path.append(os.path.join(root, file))
        return self

    def get(self):
        return self.images_path
