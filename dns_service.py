import dns.resolver
import requests
import re
from typing import List, Dict

class DNSService:
    @staticmethod
    def get_dns_records(domain: str) -> Dict[str, List[str]]:
        records = {}
        record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME']
        
        for rtype in record_types:
            try:
                answers = dns.resolver.resolve(domain, rtype)
                records[rtype] = [str(rdata) for rdata in answers]
            except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers, dns.exception.Timeout):
                records[rtype] = []
        return records

    @staticmethod
    def get_subdomains(domain: str) -> List[str]:
        """
        Fetches subdomains from crt.sh
        """
        subdomains = set()
        try:
            url = f"https://crt.sh/?q=%.{domain}&output=json"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for entry in data:
                    name = entry['name_value']
                    # crt.sh can return multiple names in one entry separated by \n
                    for sub in name.split('\n'):
                        if sub.endswith(domain) and sub != domain:
                            # Remove wildcards
                            sub = sub.replace('*.', '')
                            subdomains.add(sub)
        except Exception as e:
            print(f"Error fetching subdomains from crt.sh: {e}")
            
        return sorted(list(subdomains))

    @staticmethod
    def get_mx_info(domain: str) -> List[str]:
        try:
            answers = dns.resolver.resolve(domain, 'MX')
            return [str(rdata.exchange).rstrip('.') for rdata in answers]
        except:
            return []
