import io
import os 
import base64
import json
import secrets
from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from PIL import Image
from werkzeug.security import check_password_hash, generate_password_hash

import timm
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms

# ─── App Config ──────────────────────────────────────────────

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + str(
    Path(__file__).resolve().parent / "deepfake_lab.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_EXPIRY_HOURS"] = 24

CORS(app, supports_credentials=True)
db = SQLAlchemy(app)

# ─── Database Models ─────────────────────────────────────────


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    reset_token = db.Column(db.String(256), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    predictions = db.relationship("Prediction", backref="user", lazy=True)


class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    image_base64 = db.Column(db.Text, nullable=False)
    label = db.Column(db.String(10), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    probabilities_json = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


# ─── JWT Helpers ─────────────────────────────────────────────


def create_token(user):
    payload = {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "exp": datetime.now(timezone.utc)
        + timedelta(hours=app.config["JWT_EXPIRY_HOURS"]),
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(
                token, app.config["SECRET_KEY"], algorithms=["HS256"]
            )
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        user = db.session.get(User, payload["user_id"])
        if user is None:
            return jsonify({"error": "User not found"}), 401
        return f(user, *args, **kwargs)

    return decorated


# ─── Auth Routes ─────────────────────────────────────────────


@app.post("/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "Username, email and password are required"}), 400

    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if "@" not in email or "." not in email:
        return jsonify({"error": "Invalid email address"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()

    token = create_token(user)
    return (
        jsonify(
            {
                "token": token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            }
        ),
        201,
    )


@app.post("/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_token(user)
    return jsonify(
        {
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        }
    )


@app.post("/auth/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Don't reveal whether user exists, but still return a token area
        return jsonify(
            {"message": "If this email exists, a reset token has been generated."}
        )

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(minutes=30)
    db.session.commit()

    # In production, you'd send this via email.
    # For development, we return it in the response.
    return jsonify(
        {
            "message": "Reset token generated. Use it within 30 minutes.",
            "reset_token": token,
        }
    )


@app.post("/auth/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()
    new_password = data.get("new_password") or ""

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({"error": "Invalid reset token"}), 400

    if user.reset_token_expiry and user.reset_token_expiry.replace(
        tzinfo=timezone.utc
    ) < datetime.now(timezone.utc):
        return jsonify({"error": "Reset token has expired"}), 400

    user.password_hash = generate_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()

    return jsonify({"message": "Password reset successfully. You can now log in."})


@app.get("/auth/me")
@token_required
def get_me(current_user):
    prediction_count = Prediction.query.filter_by(user_id=current_user.id).count()
    return jsonify(
        {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "created_at": current_user.created_at.isoformat()
            if current_user.created_at
            else None,
            "prediction_count": prediction_count,
        }
    )


@app.put("/auth/profile")
@token_required
def update_profile(current_user):
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()

    if not username and not email:
        return jsonify({"error": "Nothing to update"}), 400

    if username:
        if len(username) < 3:
            return jsonify({"error": "Username must be at least 3 characters"}), 400
        if username != current_user.username:
            if User.query.filter_by(username=username).first():
                return jsonify({"error": "Username already taken"}), 409
            current_user.username = username

    if email:
        if "@" not in email or "." not in email:
            return jsonify({"error": "Invalid email address"}), 400
        if email != current_user.email:
            if User.query.filter_by(email=email).first():
                return jsonify({"error": "Email already registered"}), 409
            current_user.email = email

    db.session.commit()

    token = create_token(current_user)
    return jsonify(
        {
            "message": "Profile updated successfully",
            "token": token,
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "email": current_user.email,
            },
        }
    )


@app.put("/auth/change-password")
@token_required
def change_password(current_user):
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if not current_password or not new_password:
        return (
            jsonify({"error": "Current password and new password are required"}),
            400,
        )

    if not check_password_hash(current_user.password_hash, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    current_user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"})


# ─── ML Model ───────────────────────────────────────────────

class_names = ["Fake", "Real"]
MODEL_PATH = Path(__file__).resolve().parent / "best_model_epoch_3.pt"


class HybridDeepfakeModel(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        self.backbone1 = timm.create_model(
            "efficientformer_l1", pretrained=False, num_classes=0
        )
        self.backbone2 = timm.create_model(
            "convnext_tiny", pretrained=False, num_classes=0
        )
        self.classifier = nn.Sequential(
            nn.Linear(448 + 768, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        f1 = self.backbone1(x)
        f2 = self.backbone2(x)
        fused = torch.cat((f1, f2), dim=1)
        return self.classifier(fused)


def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model checkpoint not found at {MODEL_PATH}")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = HybridDeepfakeModel(num_classes=len(class_names))
    state_dict = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model, device


transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

ml_model, device = load_model()

# ─── API Routes ──────────────────────────────────────────────


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.post("/predict")
@token_required
def predict(current_user):
    if "file" not in request.files:
        return jsonify({"error": "Missing file field"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    try:
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return jsonify({"error": "Invalid image"}), 400

    # Convert image to base64 for storage
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    # Determine MIME type from first bytes
    if image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif image_bytes[:2] == b"\xff\xd8":
        mime = "image/jpeg"
    elif image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
        mime = "image/webp"
    else:
        mime = "image/jpeg"

    image_data_url = f"data:{mime};base64,{image_b64}"

    # Run inference
    input_tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = ml_model(input_tensor)
        probabilities = F.softmax(output, dim=1)[0]

    predicted_class = torch.argmax(probabilities).item()
    confidence = probabilities[predicted_class].item()
    probs_dict = {
        class_names[i]: probabilities[i].item() for i in range(len(class_names))
    }

    # Save prediction to database
    prediction = Prediction(
        user_id=current_user.id,
        image_base64=image_data_url,
        label=class_names[predicted_class],
        confidence=confidence,
        probabilities_json=json.dumps(probs_dict),
    )
    db.session.add(prediction)
    db.session.commit()

    return jsonify(
        {
            "id": prediction.id,
            "label": class_names[predicted_class],
            "confidence": confidence,
            "probabilities": probs_dict,
        }
    )


@app.get("/predictions")
@token_required
def get_predictions(current_user):
    predictions = (
        Prediction.query.filter_by(user_id=current_user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    return jsonify(
        [
            {
                "id": p.id,
                "image_base64": p.image_base64,
                "label": p.label,
                "confidence": p.confidence,
                "probabilities": json.loads(p.probabilities_json),
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in predictions
        ]
    )


# ─── Init DB & Run ───────────────────────────────────────────

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
