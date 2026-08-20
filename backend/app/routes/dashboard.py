from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from app.models import ActivityLog, Scan, Vulnerability
from app.utils.decorators import active_user_required

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/stats", methods=["GET"])
@jwt_required()
@active_user_required()
def dashboard_stats():
    user_id = int(get_jwt_identity())

    total_scans = Scan.query.filter_by(user_id=user_id).count()
    completed_scans = Scan.query.filter_by(user_id=user_id, status="completed").count()

    vuln_query = (
        Vulnerability.query.join(Scan)
        .filter(Scan.user_id == user_id)
    )

    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for severity in severity_counts:
        severity_counts[severity] = vuln_query.filter(Vulnerability.severity == severity).count()

    avg_risk = (
        Scan.query.filter_by(user_id=user_id, status="completed")
        .with_entities(func.avg(Scan.risk_score))
        .scalar()
    ) or 0

    recent_scans = (
        Scan.query.filter_by(user_id=user_id)
        .order_by(Scan.created_at.desc())
        .limit(5)
        .all()
    )

    recent_activity = (
        ActivityLog.query.filter_by(user_id=user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
        .all()
    )

    open_ports_count = 0
    for scan in Scan.query.filter_by(user_id=user_id, status="completed").all():
        port_vulns = Vulnerability.query.filter(
            Vulnerability.scan_id == scan.id,
            Vulnerability.source == "nmap",
        ).count()
        open_ports_count += port_vulns

    return jsonify({
        "total_scans": total_scans,
        "completed_scans": completed_scans,
        "severity_counts": severity_counts,
        "avg_risk_score": round(float(avg_risk), 1),
        "open_ports": open_ports_count,
        "recent_scans": [s.to_dict() for s in recent_scans],
        "recent_activity": [a.to_dict() for a in recent_activity],
    })


@dashboard_bp.route("/analytics", methods=["GET"])
@jwt_required()
@active_user_required()
def analytics():
    user_id = int(get_jwt_identity())

    severity_distribution = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    vulns = (
        Vulnerability.query.join(Scan)
        .filter(Scan.user_id == user_id)
        .all()
    )
    for v in vulns:
        if v.severity in severity_distribution:
            severity_distribution[v.severity] += 1

    monthly_scans = {}
    scans = Scan.query.filter_by(user_id=user_id).order_by(Scan.created_at.desc()).all()
    for scan in scans:
        if scan.created_at:
            month_key = scan.created_at.strftime("%Y-%m")
            monthly_scans[month_key] = monthly_scans.get(month_key, 0) + 1

    timeline = []
    for scan in scans[:20]:
        timeline.append({
            "id": scan.id,
            "target": scan.target.url if scan.target else "N/A",
            "risk_score": scan.risk_score,
            "severity": scan.overall_severity,
            "date": scan.created_at.isoformat() if scan.created_at else None,
        })

    risk_trend = []
    completed = Scan.query.filter_by(user_id=user_id, status="completed").order_by(Scan.created_at).all()
    for scan in completed:
        risk_trend.append({
            "date": scan.created_at.strftime("%Y-%m-%d") if scan.created_at else "",
            "score": scan.risk_score,
        })

    return jsonify({
        "severity_distribution": severity_distribution,
        "monthly_scans": monthly_scans,
        "timeline": timeline,
        "risk_trend": risk_trend,
    })
