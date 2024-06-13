import requests
import sys

class Astria():
    def __init__(self, apikey):
        self.apikey = apikey

    def get(self, url : str):
        return requests.get(url, headers={"Authorization":"Bearer "+self.apikey})

    def listtune(self):
        """List the tunes in the account
 
        Returns:
            Json : The results
        """
        return self.get('https://api.astria.ai/tunes/')

astria = Astria(apikey=sys.argv[-1])
all_tune_jobs = astria.listtune().json()
for tunejob in all_tune_jobs:
    print(f"""The ID for the tuned job: {tunejob['title']} is: {tunejob['id']}""")
