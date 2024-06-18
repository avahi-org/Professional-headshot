from dataclasses import (
    dataclass,
    field
)
import re
from datetime import datetime


@dataclass
class GetInfo:
    """
    Class for obtaining the important information from the API training response.

    training_json -> The complete JSON obtained from the training response saved as a string.
    info_regex -> The important fields that we need to obtain from the 'training_json' var.
    timestampe_list -> Array for storing both ETA and created time for training job. Because
    'training_json' has the info as a complete timestamp, a subtraction is needed to get the real ETA.
    values_dict -> JSON for sending the response of the important values.

    """
    training_json: str
    info_regex: str = r'("id")|(title)|(eta)|(created)'
    timestamp_list: list = field(default_factory=list)
    values_dict: dict = field(default_factory=lambda: {
        "id": '',
        "title": ''}
    )

    def process(self):
        training_json_list = self.training_json.split("\n")
        for line in training_json_list:
            """
            Look for the important fields marked by the info_regex parameter
            """
            key = re.search(self.info_regex, line)
            if key:
                search_group = key.group(0).replace('"', '')
                value = re.search(r': "*\d*[^"]*', line)
                clean_value = re.sub(r'[" :]', '', value.group(0))

                """
                Save 'id' and 'title' values
                """
                if search_group in self.values_dict:
                    self.values_dict[search_group] = clean_value

                """
                Obtain both parameters to find real ETA ('eta' and 'created_at')
                """
                if len(clean_value) > 21:
                    self.timestamp_list.append(
                        datetime.strptime(clean_value, "%Y-%m-%dT%H%M%S.%fZ"))
        
        real_eta = self.timestamp_list[0] - self.timestamp_list[1]
        self.values_dict['eta'] = '10 min'
        return self

    def get(self) -> dict:
        return self.values_dict
