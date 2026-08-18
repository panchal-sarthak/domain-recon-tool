import requests
from typing import List, Dict
import random

class LeakService:
    @staticmethod
    def search_leaks(domain: str) -> List[Dict]:
        """
        Searches for domain mentions in public paste sites and leak databases.
        In a real scenario, this would use APIs like Psbdmp.ws, Intelligence X, or specialized scrapers.
        For this tool, we simulate the search across common OSINT sources.
        """
        leaks = []
        
        # Simulated OSINT sources
        sources = [
            {"name": "Pastebin", "url": "https://pastebin.com/search?q="},
            {"name": "Ghostbin", "url": "https://ghostbin.co/search?q="},
            {"name": "Github Gists", "url": "https://gist.github.com/search?q="}
        ]
        
        # Simulate finding some references for certain domains to show the feature
        # In a real tool, this would be an actual API call or scraping
        if random.random() > 0.3:  # 70% chance to find something for demo
            leaks.append({
                "source": "Pastebin",
                "title": f"Internal Config - {domain}",
                "date": "2024-01-15",
                "snippet": f"...db_host: db.{domain}, db_user: admin_readonly...",
                "url": f"https://pastebin.com/example1",
                "severity": "Medium"
            })
            
        if random.random() > 0.7:
            leaks.append({
                "source": "Github Gists",
                "title": f"Employee script - {domain}",
                "date": "2023-11-20",
                "snippet": f"...API_ENDPOINT = 'api.{domain}/v1'...",
                "url": f"https://gist.github.com/example2",
                "severity": "Low"
            })

        return leaks
