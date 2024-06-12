# Professional-headshot
Repository for creating professional headshots

# API

The Astria API is being used in this repository. To train a model, please provide at least 10 images to train the model.

## Training

python astria.py tune [Name of the tuned job] [Classname: this indicates the type of training style, for this use please use either 'man' or 'woman' with no quotation marks] [Images. List of the images to use for training]

Example:

python astria.py tune testtune man image1.png image2.jpeg image3.jpeg image4.jpeg image5.jpeg image6.jpeg image7.jpeg image8.jpeg image9.jpeg image10.jpeg image11.jpeg

The response is a json that contains the id of the model as well as other metadata.

Example:

<pre>
{
    "id": 1372126,
    "title": "testtune",
    "name": "man",
    "is_api": true,
    "token": "sks",
    "eta": "2024-06-12T22:59:50.895Z",
    "callback": null,
    "trained_at": null,
    "started_training_at": null,
    "expires_at": null,
    "created_at": "2024-06-12T22:49:20.098Z",
    "model_type": null,
    "updated_at": "2024-06-12T22:49:20.140Z",
    "base_tune_id": null,
    "branch": "sd15",
    "args": null,
    "steps": null,
    "face_crop": true,
    "ckpt_url": null,
    "ckpt_urls": [],
    "url": "https://api.astria.ai/tunes/1372126.json",
    "orig_images": [
        "https://sdbooth2-production.s3.amazonaws.com/k7l8w7f6ht47qzxbreif820vn50h",
        "https://sdbooth2-production.s3.amazonaws.com/bflyi2cu3pp3yoyvsy6qhw4coytp",
        "https://sdbooth2-production.s3.amazonaws.com/9ws6aoeuhbb6bhgkjv6lsjwxy0x2",
        "https://sdbooth2-production.s3.amazonaws.com/kg5csfi3tk4uj6kqz5unozsmvai5",
        "https://sdbooth2-production.s3.amazonaws.com/xxi31543veaq7593u8qlurxw0ty5",
        "https://sdbooth2-production.s3.amazonaws.com/pmnx7zyi967qlsd4cc7lsn8w33c4",
        "https://sdbooth2-production.s3.amazonaws.com/scmt0kwpzw3xj7jlm6l4bx78wlhc",
        "https://sdbooth2-production.s3.amazonaws.com/jm6dkd5wpa0tpj4zw5fq0idlnv2u",
        "https://sdbooth2-production.s3.amazonaws.com/8woiizcaklth7eb7az08ifpv8auf",
        "https://sdbooth2-production.s3.amazonaws.com/dq0v8q030anln1kvbxpqwdnnb7mk",
        "https://sdbooth2-production.s3.amazonaws.com/6uw86pcerfch6fr13jyrohckoql6"
    ]
}
</pre>

IMPORTANT. 'sks' is the token that is needed for training and it needs to be included in the inference call.

## Inference

Inference can be performed with the following command

python astria.py gen --seed [INT] --steps [INT] --download [TUNEID] "[TOKEN] [CLASSNAME] [PROMPT]"

Optional values:

--seed: Assigns a seed for test purposes. Defaults to a random value
--steps: Defaults to 50. Denoising steps for the model. Best results have been noticed to be between 60-90 with a slight tendency to be 80. More denoising steps increases price.

With --download, you save the images in the current directory.

Example:

python astria.py gen --steps 80 --download 1372126 "sks man headshot of a banking professional wearing a nice suit with an office in the background"

As a response, you get a json file with metadata

<pre>
{
    "id": 17036803,
    "callback": "",
    "trained_at": null,
    "started_training_at": null,
    "created_at": "2024-06-12T21:58:37.696Z",
    "updated_at": "2024-06-12T21:58:37.696Z",
    "tune_id": 1372126,
    "text": "sks man headshot of a banking professional wearing a nice suit with an office in the background",
    "negative_prompt": "",
    "cfg_scale": null,
    "steps": 80,
    "super_resolution": false,
    "ar": "1:1",
    "num_images": 8,
    "seed": 9225,
    "controlnet_conditioning_scale": null,
    "controlnet_txt2img": false,
    "denoising_strength": null,
    "url": "https://api.astria.ai/tunes/1371459/prompts/17036833.json",
    "images": []
}
DOWNLOADING  17036833:sks man headshot of a banking professional wearing a nice suit with an office in the background

................
INFO:root:1372126_17036833_2945_0.jpg DONE
INFO:root:1372126_17036833_2945_1.jpg DONE
INFO:root:1372126_17036833_2945_2.jpg DONE
INFO:root:1372126_17036833_2945_3.jpg DONE
INFO:root:1372126_17036833_2945_4.jpg DONE
INFO:root:1372126_17036833_2945_5.jpg DONE
INFO:root:1372126_17036833_2945_6.jpg DONE
INFO:root:1372126_17036833_2945_7.jpg DONE
</pre>