import os
from PIL import Image
import matplotlib.pyplot as plt
from matplotlib.widgets import Button

def load_images(folder_path):
    images = []
    for file in os.listdir(folder_path):
        if file.lower().endswith(('png', 'jpg', 'jpeg', 'gif', 'bmp')):
            image_path = os.path.join(folder_path, file)
            image = Image.open(image_path)
            images.append((image_path, image))
    return images

def on_click(event, images, fig, selected_images):
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

def finish_selection(event, fig):
    plt.close(fig)

def display_images(images, selected_images):
    sizes = len(images)//4 + 1
    fig, axes = plt.subplots(sizes, 4, figsize=(35, 15))
    axes = axes.flatten()
    if len(images) == 1:
        axes = [axes]  # Ensure axes is iterable when there's only one image
    for (image_path, image), ax in zip(images, axes):
        ax.imshow(image)
    fig.canvas.mpl_connect('button_press_event', lambda event: on_click(event, images, fig, selected_images))
    
    finish_ax = plt.axes([0.81, 0.01, 0.1, 0.075])
    finish_button = Button(finish_ax, 'Finish Selection')
    finish_button.on_clicked(lambda event: finish_selection(event, fig))

    plt.show()

if __name__ == "__main__":
    folder_path = '/Users/abelcotoneto/Downloads/New Folder With Items'
    if not os.path.isdir(folder_path):
        print("Invalid folder path. Please try again.")
    else:
        images = load_images(folder_path)
        if images:
            selected_images = []
            display_images(images, selected_images)
            print("You have selected the following images:")
            for img in selected_images:
                print(img)
        else:
            print("No images found in the specified folder.")
