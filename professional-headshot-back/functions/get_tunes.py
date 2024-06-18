import requests
from dataclasses import (
    dataclass,
    field
)


@dataclass
class Astria():
    apikey: str

    def get(self, url : str):
        return requests.get(url, headers={"Authorization":"Bearer "+self.apikey})

    def listtune(self):
        """List the tunes in the account
 
        Returns:
            Json : The results
        """
        return self.get('https://api.astria.ai/tunes/')

@dataclass
class GetTunes:
    astria_api_key: str
    response_dict: dict = field(default_factory=lambda: {
        'available_models': {},
    })

    def process(self):
        astria = Astria(apikey=self.astria_api_key)
        all_tune_jobs = astria.listtune().json()
        for tunejob in all_tune_jobs:
            self.response_dict['available_models'][tunejob['title']] = tunejob['id']

        return self
    
    def get(self) -> dict:
        return self.response_dict
