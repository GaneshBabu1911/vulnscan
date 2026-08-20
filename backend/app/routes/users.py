from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.models import User
from app.utils.decorators import active_user_required

users_bp = Blueprint("users", __name__)


@users_bp.route("/", methods=["GET"])
@jwt_required()
@active_user_required()
def list_users():
    users = User.query.filter_by(is_active=True).all()
    return jsonify({"users": [u.to_dict(include_email=False) for u in users]})
