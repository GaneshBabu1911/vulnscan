"""CVSS v3.1 Risk Scoring Engine."""

SEVERITY_THRESHOLDS = {
    "critical": 9.0,
    "high": 7.0,
    "medium": 4.0,
    "low": 0.1,
    "info": 0.0,
}

ZAP_RISK_MAP = {
    "High": {"base_score": 8.5, "severity": "high"},
    "Medium": {"base_score": 5.5, "severity": "medium"},
    "Low": {"base_score": 2.5, "severity": "low"},
    "Informational": {"base_score": 0.0, "severity": "info"},
}

OWASP_CATEGORY_MAP = {
    "SQL Injection": {"base_score": 9.8, "severity": "critical", "cwe": "CWE-89"},
    "Cross Site Scripting": {"base_score": 6.1, "severity": "medium", "cwe": "CWE-79"},
    "Cross-Site Scripting": {"base_score": 6.1, "severity": "medium", "cwe": "CWE-79"},
    "CSRF": {"base_score": 6.5, "severity": "medium", "cwe": "CWE-352"},
    "Command Injection": {"base_score": 9.8, "severity": "critical", "cwe": "CWE-78"},
    "Broken Authentication": {"base_score": 9.1, "severity": "critical", "cwe": "CWE-287"},
    "Directory Traversal": {"base_score": 7.5, "severity": "high", "cwe": "CWE-22"},
    "Remote File Inclusion": {"base_score": 9.0, "severity": "critical", "cwe": "CWE-98"},
    "Local File Inclusion": {"base_score": 8.5, "severity": "high", "cwe": "CWE-73"},
    "Security Misconfiguration": {"base_score": 5.3, "severity": "medium", "cwe": "CWE-16"},
    "Sensitive Data Exposure": {"base_score": 7.5, "severity": "high", "cwe": "CWE-200"},
    "Open Redirect": {"base_score": 4.7, "severity": "medium", "cwe": "CWE-601"},
    "Clickjacking": {"base_score": 4.3, "severity": "medium", "cwe": "CWE-1021"},
}


def score_to_severity(score):
    if score >= SEVERITY_THRESHOLDS["critical"]:
        return "critical"
    if score >= SEVERITY_THRESHOLDS["high"]:
        return "high"
    if score >= SEVERITY_THRESHOLDS["medium"]:
        return "medium"
    if score >= SEVERITY_THRESHOLDS["low"]:
        return "low"
    return "info"


def calculate_cvss_vector(severity, attack_vector="N", attack_complexity="L"):
    """Generate a simplified CVSS v3.1 vector string."""
    av_map = {"N": "AV:N", "A": "AV:A", "L": "AV:L", "P": "AV:P"}
    ac_map = {"L": "AC:L", "H": "AC:H"}
    impact = "C" if severity in ("critical", "high") else "L"
    return f"CVSS:3.1/{av_map.get(attack_vector, 'AV:N')}/{ac_map.get(attack_complexity, 'AC:L')}/PR:N/UI:N/C:{impact}/I:{impact}/A:{impact}"


def score_zap_alert(alert):
    risk = alert.get("risk", alert.get("riskdesc", "Informational"))
    if isinstance(risk, str) and "(" in risk:
        risk = risk.split("(")[0].strip()
    mapping = ZAP_RISK_MAP.get(risk, ZAP_RISK_MAP["Informational"])
    score = mapping["base_score"]
    return {
        "cvss_score": score,
        "severity": score_to_severity(score) if score > 0 else mapping["severity"],
        "cvss_vector": calculate_cvss_vector(mapping["severity"]),
    }


def score_vulnerability(name, source="zap", raw_risk=None):
    for category, data in OWASP_CATEGORY_MAP.items():
        if category.lower() in name.lower():
            return {
                "cvss_score": data["base_score"],
                "severity": data["severity"],
                "cvss_vector": calculate_cvss_vector(data["severity"]),
                "cwe_id": data["cwe"],
                "category": category,
            }

    if raw_risk:
        mapping = ZAP_RISK_MAP.get(raw_risk, ZAP_RISK_MAP["Informational"])
        score = mapping["base_score"]
        return {
            "cvss_score": score,
            "severity": score_to_severity(score) if score > 0 else mapping["severity"],
            "cvss_vector": calculate_cvss_vector(mapping["severity"]),
            "category": "General",
        }

    return {
        "cvss_score": 0.0,
        "severity": "info",
        "cvss_vector": calculate_cvss_vector("info"),
        "category": "General",
    }


def calculate_overall_risk(vulnerabilities):
    if not vulnerabilities:
        return 0.0, "info"

    scores = [v.get("cvss_score", 0) for v in vulnerabilities]
    weights = {"critical": 4, "high": 3, "medium": 2, "low": 1, "info": 0}

    weighted_sum = 0
    total_weight = 0
    for v in vulnerabilities:
        w = weights.get(v.get("severity", "info"), 0)
        weighted_sum += v.get("cvss_score", 0) * (w + 1)
        total_weight += w + 1

    overall = weighted_sum / total_weight if total_weight else 0
    max_score = max(scores) if scores else 0
    final_score = round(min(10.0, (overall * 0.6 + max_score * 0.4)), 1)

    return final_score, score_to_severity(final_score)


def count_by_severity(vulnerabilities):
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for v in vulnerabilities:
        sev = v.get("severity", "info")
        if sev in counts:
            counts[sev] += 1
    return counts
