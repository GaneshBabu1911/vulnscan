from datetime import datetime, timezone
from app.database import db
from app.models import ActivityLog

def log_user_activity(user_id: int, activity: str, module: str, description: str = ""):
    if not user_id:
        return

    new_log = ActivityLog(
        user_id=user_id,
        activity=activity,
        module=module,
        description=description or "",
        created_at=datetime.now(timezone.utc),
    )
    db.session.add(new_log)
    db.session.flush()

    total = db.session.query(ActivityLog).filter(ActivityLog.user_id == user_id).count()

    if total > 15:
        subq = (
            db.session.query(ActivityLog.id)
            .filter(ActivityLog.user_id == user_id)
            .order_by(ActivityLog.created_at.asc())
            .limit(total - 15)
            .subquery()
        )
        db.session.query(ActivityLog).filter(ActivityLog.id.in_(subq)).delete(synchronize_session=False)

    db.session.commit()

def get_user_activity(user_id: int, limit: int = 15):
    return (
        db.session.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
