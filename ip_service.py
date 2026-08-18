import requests
import socket
from typing import Dict, List, Optional

class IPService:
    @staticmethod
    def get_ip_info(ip: str) -> Dict:
        """
        Fetches IP info from ipinfo.io
        """
        try:
            url = f"https://ipinfo.io/{ip}/json"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Error fetching IP info: {e}")
        return {}

    @staticmethod
    def resolve_domain_to_ip(domain: str) -> Optional[str]:
        try:
            return socket.gethostbyname(domain)
        except socket.gaierror:
            return None

    @staticmethod
    def check_ports(ip: str, ports: List[int] = [80, 443, 21, 22, 25, 53, 3306, 8080]) -> List[Dict]:
        """
        Checks common ports for visibility
        """
        open_ports = []
        for port in ports:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            result = sock.connect_ex((ip, port))
            if result == 0:
                service = "Unknown"
                try:
                    service = socket.getservbyport(port)
                except:
                    pass
                open_ports.append({"port": port, "status": "open", "service": service})
            sock.close()
        return open_ports
