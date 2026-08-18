import requests
import re
from typing import List, Dict, Optional
import time

class EmailService:
    @staticmethod
    def get_publicly_exposed_emails(domain: str) -> List[str]:
        """
        Attempts to find emails by checking common security files and public patterns.
        In a real scenario, this would use Hunter.io, Skymem, or similar.
        """
        emails = set()
        
        # Check common security files that often contain contact emails
        common_files = ['/.well-known/security.txt', '/security.txt', '/robots.txt']
        for file in common_files:
            try:
                url = f"https://{domain}{file}"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    # Regex for emails
                    found = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', response.text)
                    for email in found:
                        if domain in email:
                            emails.add(email)
            except:
                continue

        # If no emails found, provide common corporate patterns for demonstration
        if not emails:
            common_prefixes = ['admin', 'info', 'support', 'contact', 'hr', 'sales', 'billing', 'it']
            for p in common_prefixes[:4]:
                emails.add(f"{p}@{domain}")

        return list(emails)

    @staticmethod
    def get_breach_data(domain: str) -> List[Dict]:
        """
        Fetches all breaches from HIBP to filter for domain relevance.
        Note: Specific email checks require API keys.
        """
        try:
            url = "https://haveibeenpwned.com/api/v3/breaches"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                all_breaches = response.json()
                # Filtering breaches related to the domain or just returning some for demo
                # In a real tool, we would search for the domain in the breach description or name
                related_breaches = []
                for breach in all_breaches:
                    if domain.lower() in breach['Domain'].lower() or domain.lower() in breach['Name'].lower():
                        related_breaches.append({
                            "name": breach['Name'],
                            "title": breach['Title'],
                            "domain": breach['Domain'],
                            "breach_date": breach['BreachDate'],
                            "pwn_count": breach['PwnCount'],
                            "description": breach['Description'],
                            "data_classes": breach['DataClasses']
                        })
                return related_breaches
        except Exception as e:
            print(f"Error fetching breach data: {e}")
            
        return []

    @staticmethod
    def get_email_breach_summary(emails: List[str]) -> List[Dict]:
        """
        Summarizes breach exposure for a list of emails.
        Mocking since specific checks require HIBP key.
        """
        # Mock data for demonstration
        results = []
        for email in emails:
            # Randomly assign some breaches for demonstration
            if "admin" in email:
                results.append({
                    "email": email,
                    "breaches": ["LinkedIn", "Adobe", "Canva"],
                    "exposed_data": ["Email addresses", "Passwords", "Job titles"],
                    "severity": "High"
                })
            elif "info" in email:
                results.append({
                    "email": email,
                    "breaches": ["MailChimp"],
                    "exposed_data": ["Email addresses", "Names"],
                    "severity": "Medium"
                })
            else:
                results.append({
                    "email": email,
                    "breaches": [],
                    "exposed_data": [],
                    "severity": "Low"
                })
        return results
