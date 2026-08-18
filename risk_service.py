from typing import Dict, List, Optional

class RiskService:
    @staticmethod
    def calculate_risk(findings: Dict) -> Dict:
        """
        Calculates a risk score (Low/Medium/High) based on OSINT findings.
        """
        score = 0
        reasons = []
        
        # Email & Breach Analysis
        emails = findings.get('emails', [])
        email_breaches = findings.get('email_breaches', [])
        
        if len(emails) > 5:
            score += 10
            reasons.append(f"Multiple publicly exposed email addresses ({len(emails)}) found.")
            
        for eb in email_breaches:
            if eb['severity'] == "High":
                score += 30
                reasons.append(f"Critical breach found for {eb['email']}: {', '.join(eb['breaches'])}.")
            elif eb['severity'] == "Medium":
                score += 15
                reasons.append(f"Moderate breach found for {eb['email']}: {', '.join(eb['breaches'])}.")
                
        # Infrastructure
        open_ports = findings.get('open_ports', [])
        for p in open_ports:
            if p['port'] in [21, 23, 3306, 5432]: # Insecure or database ports
                score += 20
                reasons.append(f"Insecure or sensitive port {p['port']} ({p['service']}) is open.")
            elif p['port'] in [22, 80]:
                score += 5
                reasons.append(f"Common management or web port {p['port']} ({p['service']}) is open.")
                
        # Subdomains
        subdomains = findings.get('subdomains', [])
        if len(subdomains) > 10:
            score += 10
            reasons.append(f"Large attack surface: {len(subdomains)} subdomains discovered.")
            
        # Public Leaks & Pastes
        public_leaks = findings.get('public_leaks', [])
        for leak in public_leaks:
            if leak['severity'] == "High":
                score += 25
                reasons.append(f"Critical data leak found on {leak['source']}: {leak['title']}.")
            elif leak['severity'] == "Medium":
                score += 15
                reasons.append(f"Potential data leak found on {leak['source']}: {leak['title']}.")
            else:
                score += 5
                reasons.append(f"Public reference found on {leak['source']}: {leak['title']}.")

        # Determine level
        if score >= 60:
            level = "High"
        elif score >= 30:
            level = "Medium"
        else:
            level = "Low"
            
        if not reasons:
            reasons.append("No significant public exposure detected.")
            
        return {
            "score": min(score, 100),
            "level": level,
            "reasons": reasons
        }
