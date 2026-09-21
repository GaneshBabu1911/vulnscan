"""
Activity Service – centralised user activity logging with FIFO rolling limit.

Each user retains ONLY the latest MAX_ACTIVITIES records.
Older records are automatically purged using FIFO logic.
Records belonging to other users are NEVER deleted.
"""

from datetime import datetime, timezone

from app.database import db
from app.models import ActivityLog

# Maximum number of activity records to retain per user
MAX_ACTIVITIES = 15


def _utcnow():
    return datetime.now(timezone.utc)


def log_user_activity(user_id: int, activity: str, module: str, description: str = ""):
    """
    Insert a new activity record for the given user and enforce the
    rolling MAX_ACTIVITIES limit using FIFO deletion.

    Workflow:
      1. Insert new ActivityLog record into MySQL.
      2. Count all records for this user.
      3. If count exceeds MAX_ACTIVITIES:
           Delete only the OLDEST (count - MAX_ACTIVITIES) records of THIS user.
      4. Always keep the newest MAX_ACTIVITIES records.

    Args:
        user_id    – integer user PK
        activity   – human-readable event label (e.g. "Login", "Started Scan")
        module     – feature area (e.g. "Auth", "Scanner", "Reports")
        description – optional detail string (e.g. "Scan started for https://example.com")
    """
    if not user_id:
        return

    # ── Step 1: Insert new record ─────────────────────────────────────────────
    new_log = ActivityLog(
        user_id=user_id,
        activity=activity,
        module=module,
        description=description or "",
        created_at=_utcnow(),
    )
    db.session.add(new_log)
    db.session.flush()   # assign PK without committing so count is accurate

    # ── Step 2: Count records for this user ───────────────────────────────────
    total = (
        db.session.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .count()
    )

    # ── Step 3: FIFO deletion if over limit ───────────────────────────────────
    if total > MAX_ACTIVITIES:
        excess = total - MAX_ACTIVITIES
        # Fetch the IDs of the oldest excess records (ONLY this user's)
        oldest_ids = (
            db.session.query(ActivityLog.id)
            .filter(ActivityLog.user_id == user_id)
            .order_by(ActivityLog.created_at.asc())
            .limit(excess)
            .all()
        )
        ids_to_delete = [row[0] for row in oldest_ids]
        if ids_to_delete:
            db.session.query(ActivityLog).filter(
                ActivityLog.id.in_(ids_to_delete)
            ).delete(synchronize_session=False)

    # ── Step 4: Commit the insert (and any deletes) ───────────────────────────
    db.session.commit()


def get_user_activity(user_id: int, limit: int = MAX_ACTIVITIES):
    """
    Return the latest `limit` activity records for the given user,
    ordered newest → oldest.

    Args:
        user_id – integer user PK
        limit   – number of records to return (default 15)

    Returns:
        List of ActivityLog instances
    """
    return (
        db.session.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )

