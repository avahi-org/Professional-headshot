# Backend

## Training

To simplify the call of the Astria's API, the main.py receives 3 parameters, the first 2 being optional:

tune_job_name: First parameter from CLI. Defines the name of the training job. Defaults to 'MyTuneJob'
classname: Second parameter from CLI. Style that the model is being used for. Defaults to 'man'
folder_name: Last parameter from CLI. Name of the holder that contains the images, must be in the same working directory as the main.py. Defaults to 'Headshots'

Example:

python main.py Test man Headshots

## Get Tune jobs

For getting the tune job ids, needed for the inference, simply run the file get_tunes.py providing the users API key as follows

python get_tunes.py ASTRIA_API_KEY

## Inference

To run the inference, simply run astria.py as follows

python astria.py gen --seed 1345 --steps 80 --download TUNE_JOB_ID "sks [CLASSNAME] headshot of a banking professional wearing a nice suit with an office in the background"

--seed and --steps are optional, --seed defaults to a random number and --steps to 50. --download allows to save the inference in the current working directory