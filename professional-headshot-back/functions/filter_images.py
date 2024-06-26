import os
from PIL import Image
import matplotlib.pyplot as plt
from matplotlib.widgets import Button
from dataclasses import dataclass


@dataclass
class FilterImages:
    folder_path: str

    def process(self):
        images = self.load_images(self.folder_path)
        if images:
            self.selected_images = []
            self.display_images(images, self.selected_images)
            print("You have selected the following images:")
            for img in self.selected_images:
                print(img)
        else:
            print("No images found in the specified folder.")
        return self


    def load_images(self, folder_path):
        images = []
        for file in os.listdir(folder_path):
            if file.lower().endswith(('png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'heic')):
                image_path = os.path.join(folder_path, file)
                image = Image.open(image_path)
                images.append((image_path, image))
        return images

    def on_click(self, event, images, fig, selected_images):
        if event.inaxes:
            for i, ax in enumerate(fig.axes):
                if ax == event.inaxes:
                    if images[i][0] in selected_images:
                        selected_images.remove(images[i][0])
                        ax.set_title(os.path.basename(images[i][0]), color='black')
                    else:
                        selected_images.append(images[i][0])
                        ax.set_title(f"Selected: {os.path.basename(images[i][0])}", color='red')
                    fig.canvas.draw()
                    break
        return None

    def finish_selection(self, event, fig):
        plt.close(fig)
        return None

    def display_images(self, images, selected_images):
        sizes = len(images)//4 + 1
        fig, axes = plt.subplots(sizes, 4, figsize=(35, 15))
        axes = axes.flatten()
        if len(images) == 1:
            axes = [axes]  # Ensure axes is iterable when there's only one image
        for (image_path, image), ax in zip(images, axes):
            ax.imshow(image)
        fig.canvas.mpl_connect('button_press_event', lambda event: self.on_click(event, images, fig, selected_images))
        
        finish_ax = plt.axes([0.81, 0.01, 0.1, 0.075])
        finish_button = Button(finish_ax, 'Finish Selection')
        finish_button.on_clicked(lambda event: self.finish_selection(event, fig))

        plt.show()

        return selected_images

    def get(self) -> None:
        return self.selected_images    
