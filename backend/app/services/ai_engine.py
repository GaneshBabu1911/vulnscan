"""Abstracted AI Recommendation Engine - supports OpenAI, Ollama, or local fallback."""

import json
import requests
from flask import current_app


class AIRecommendationEngine:
    def __init__(self):
        self.provider = current_app.config.get("AI_PROVIDER", "local")

    def generate_recommendations(self, vulnerabilities):
        if self.provider == "openai" and current_app.config.get("OPENAI_API_KEY"):
            return self._generate_openai(vulnerabilities)
        if self.provider == "ollama":
            return self._generate_ollama(vulnerabilities)
        return self._generate_local(vulnerabilities)

    def _generate_local(self, vulnerabilities):
        recommendations = []
        for vuln in vulnerabilities:
            rec = {
                "title": f"Fix: {vuln.get('name', 'Unknown Vulnerability')}",
                "explanation": self._explain_vulnerability(vuln),
                "impact": self._assess_impact(vuln),
                "fix_steps": self._generate_fix_steps(vuln),
                "best_practices": self._get_best_practices(vuln),
                "preventive_measures": self._get_preventive_measures(vuln),
                "priority": vuln.get("severity", "medium"),
                "vulnerability_name": vuln.get("name"),
            }
            recommendations.append(rec)
        return recommendations

    def _explain_vulnerability(self, vuln):
        name = vuln.get("name", "")
        category = vuln.get("category", "General")
        explanations = {
            "SQL Injection": "This vulnerability occurs when user input is directly concatenated into SQL queries without proper sanitization, allowing attackers to manipulate database queries.",
            "Cross Site Scripting": "XSS vulnerabilities arise when applications include untrusted data in web pages without proper encoding, enabling attackers to inject malicious scripts.",
            "CSRF": "Cross-Site Request Forgery exploits the trust a website has in the user's browser, tricking authenticated users into performing unintended actions.",
            "Command Injection": "Command injection occurs when an application passes unsafe user input to system shell commands, allowing arbitrary command execution.",
            "Broken Authentication": "Authentication flaws allow attackers to compromise passwords, keys, or session tokens, or exploit implementation flaws to assume other users' identities.",
            "Security Misconfiguration": "Security misconfigurations occur when security settings are defined, implemented, or maintained improperly, leaving the application vulnerable.",
            "Sensitive Data Exposure": "Applications that do not adequately protect sensitive data such as financial, healthcare, or personal information are vulnerable to data breaches.",
        }
        for key, explanation in explanations.items():
            if key.lower() in name.lower() or key.lower() in category.lower():
                return explanation
        return vuln.get("description") or f"The vulnerability '{name}' was detected during automated scanning and requires remediation."

    def _assess_impact(self, vuln):
        severity = vuln.get("severity", "medium")
        impacts = {
            "critical": "Critical impact: Complete system compromise, data breach, or service disruption possible. Immediate remediation required.",
            "high": "High impact: Significant data exposure or unauthorized access possible. Remediation should be prioritized.",
            "medium": "Medium impact: Limited data exposure or partial system compromise possible. Should be addressed in next release cycle.",
            "low": "Low impact: Minimal risk to confidentiality, integrity, or availability. Address during regular maintenance.",
            "info": "Informational: No direct security impact but indicates areas for security improvement.",
        }
        return impacts.get(severity, impacts["medium"])

    def _generate_fix_steps(self, vuln):
        name = vuln.get("name", "").lower()
        solution = vuln.get("solution", "")
        if solution:
            return solution

        fixes = {
            "sql injection": "1. Use parameterized queries/prepared statements\n2. Implement input validation and sanitization\n3. Apply least privilege to database accounts\n4. Use ORM frameworks with built-in protection",
            "cross site scripting": "1. Encode all user input before rendering\n2. Implement Content Security Policy (CSP)\n3. Use HTTPOnly and Secure cookie flags\n4. Validate input on both client and server side",
            "csrf": "1. Implement anti-CSRF tokens\n2. Use SameSite cookie attribute\n3. Verify Origin/Referer headers\n4. Require re-authentication for sensitive actions",
            "command injection": "1. Avoid system calls with user input\n2. Use allowlists for permitted commands\n3. Sanitize and validate all input\n4. Run with minimum required privileges",
            "clickjacking": "1. Set X-Frame-Options header to DENY or SAMEORIGIN\n2. Implement Content Security Policy frame-ancestors\n3. Use JavaScript frame-busting as defense-in-depth",
            "ssl": "1. Upgrade to TLS 1.2 or higher\n2. Disable weak cipher suites\n3. Implement HSTS\n4. Renew certificates before expiry",
            "header": "1. Configure all recommended security headers\n2. Implement Content Security Policy\n3. Enable HSTS with appropriate max-age\n4. Set X-Content-Type-Options to nosniff",
        }
        for key, fix in fixes.items():
            if key in name:
                return fix
        return "1. Review the vulnerability details\n2. Apply the recommended solution from the scanner\n3. Test the fix in a staging environment\n4. Deploy and re-scan to verify remediation"

    def _get_best_practices(self, vuln):
        return (
            "Follow OWASP Secure Coding Guidelines. "
            "Implement defense-in-depth strategies. "
            "Conduct regular security code reviews. "
            "Keep all dependencies and frameworks updated. "
            "Use automated security testing in CI/CD pipelines."
        )

    def _get_preventive_measures(self, vuln):
        return (
            "Implement Web Application Firewall (WAF). "
            "Enable continuous security monitoring. "
            "Conduct regular penetration testing. "
            "Provide security awareness training for developers. "
            "Maintain an inventory of all web assets and their security posture."
        )

    def _generate_openai(self, vulnerabilities):
        try:
            headers = {
                "Authorization": f"Bearer {current_app.config['OPENAI_API_KEY']}",
                "Content-Type": "application/json",
            }
            prompt = f"Generate security recommendations for these vulnerabilities: {json.dumps(vulnerabilities[:10])}"
            payload = {
                "model": "gpt-4",
                "messages": [
                    {"role": "system", "content": "You are a cybersecurity expert. Provide actionable remediation advice."},
                    {"role": "user", "content": prompt},
                ],
            }
            resp = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60,
            )
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                return [{"title": "AI Analysis", "explanation": content, "priority": "high"}]
        except Exception as e:
            current_app.logger.warning(f"OpenAI recommendation failed: {e}")
        return self._generate_local(vulnerabilities)

    def _generate_ollama(self, vulnerabilities):
        try:
            url = f"{current_app.config['OLLAMA_URL']}/api/generate"
            prompt = f"Provide security fix recommendations for: {json.dumps(vulnerabilities[:5])}"
            payload = {"model": current_app.config["OLLAMA_MODEL"], "prompt": prompt, "stream": False}
            resp = requests.post(url, json=payload, timeout=120)
            if resp.status_code == 200:
                content = resp.json().get("response", "")
                return [{"title": "AI Analysis (Ollama)", "explanation": content, "priority": "high"}]
        except Exception as e:
            current_app.logger.warning(f"Ollama recommendation failed: {e}")
        return self._generate_local(vulnerabilities)
