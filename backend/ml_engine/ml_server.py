import os
import sys
import json
import numpy as np

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from flask import Flask, request, jsonify
import joblib
from train_model import train_and_save_models, MODEL_DIR

app = Flask(__name__)

# Load trained models
METRICS_PATH = os.path.join(MODEL_DIR, "model_metrics.json")
CLS_PATH = os.path.join(MODEL_DIR, "disengagement_classifier.joblib")
REG_PATH = os.path.join(MODEL_DIR, "score_regressor.joblib")
KMEANS_PATH = os.path.join(MODEL_DIR, "student_kmeans.joblib")

def load_models():
    clf = joblib.load(CLS_PATH) if os.path.exists(CLS_PATH) else None
    reg = joblib.load(REG_PATH) if os.path.exists(REG_PATH) else None
    kmeans = joblib.load(KMEANS_PATH) if os.path.exists(KMEANS_PATH) else None
    metrics = {}
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
    return clf, reg, kmeans, metrics

clf, reg, kmeans, metrics = load_models()


def _logical_disengagement(accuracy, consistency, focus_scaled, trend, streak):
    """Deterministic, interpretable disengagement heuristic.

    Anchors the final probability to the student's REAL metrics so a high
    accuracy + high consistency always maps to a low risk, and a broken streak
    / low accuracy / negative trend maps to a high risk.
    """
    score = 0.5  # neutral prior

    if accuracy >= 0.85:
        score -= 0.30
    elif accuracy >= 0.75:
        score -= 0.15
    elif accuracy >= 0.60:
        score += 0.05
    else:
        score += 0.35

    if streak >= 7 or consistency >= 0.60:
        score -= 0.25
    elif streak <= 1 or consistency < 0.25:
        score += 0.30

    if trend > 0.05:
        score -= 0.10
    elif trend < -0.05:
        score += 0.15

    if focus_scaled < 0.20:
        score += 0.10
    elif focus_scaled > 0.60:
        score -= 0.05

    return float(np.clip(score, 0.05, 0.95))


def _logical_score(accuracy, consistency, trend, streak):
    """Deterministic predicted next score (0-100) from real learning metrics.

    High accuracy + high consistency + positive trend always yields a high
    score, matching how a human teacher would estimate the student.
    """
    return float(np.clip(
        accuracy * 70.0 +
        consistency * 18.0 +
        np.clip(trend, -0.20, 0.20) * 12.0 +
        min(1.0, streak / 14.0) * 4.0,
        30.0, 98.0
    ))


def _map_flow_state(disengagement_prob, predicted_score, accuracy, streak, total_lessons):
    """Refined Flow-State mapping based on calibrated risk / score / ability."""
    if disengagement_prob >= 0.65:
        if accuracy < 0.60 or predicted_score < 60:
            return ("High", "Anxiety (High Risk)",
                    "You're at risk of falling behind. Try a quick 5-minute refresher lesson or start a Pomodoro focus session to rebuild your momentum!")
        return ("High", "Disengaged (Inactive)",
                "Your active streak has dropped recently. Jump back in with a short daily quest to rebuild your learning habit!")

    if disengagement_prob >= 0.35:
        if accuracy < 0.70 or predicted_score < 68:
            return ("Medium", "Anxiety (Over-challenged)",
                    "Quizzes are feeling challenging. We recommend reviewing slide explanations before taking your next quiz.")
        return ("Medium", "Steady Flow",
                "You're making steady progress. Keep up your daily study sessions!")

    # Low risk - now aligned with the calibrated high-achiever definition
    if accuracy >= 0.88 and streak >= 7 and total_lessons >= 3 and predicted_score >= 82:
        return ("Low", "Boredom (Under-challenged)",
                "You're mastering this topic easily! Take on advanced chapters or attempt bonus daily quests for extra XP.")
    if accuracy < 0.60 or predicted_score < 60:
        return ("Low", "Anxiety (Over-challenged)",
                "Quizzes feel a bit difficult. Try reviewing slide explanations or starting a Pomodoro focus session.")
    return ("Low", "Flow State (Optimal)",
            "Great learning balance! Keep progressing steadily through your active curriculum.")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Academia.io Python ML Microservice",
        "models_loaded": bool(clf and reg and kmeans)
    })

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json or {}
        accuracy = float(data.get("accuracy", 0.65))
        consistency = float(data.get("consistency", 0.50))
        focus_scaled = float(data.get("focusScaled", 0.40))
        trend = float(data.get("trend", 0.0))
        streak = float(data.get("streak", 1.0))
        badges_count = float(data.get("badgesCount", 1.0))
        total_lessons = int(data.get("totalLessons", 0))

        X_cls = np.array([[accuracy, consistency, focus_scaled, trend, streak]])
        X_reg = np.array([[accuracy, consistency, focus_scaled, streak, badges_count]])

        # Deterministic logical baseline - always aligned with accuracy & streak
        logical_score = _logical_score(accuracy, consistency, trend, streak)
        logical_disengagement = _logical_disengagement(accuracy, consistency, focus_scaled, trend, streak)

        if clf and reg:
            probs = clf.predict_proba(X_cls)[0]
            model_disengagement = float(probs[1]) if len(probs) > 1 else float(probs[0])
            model_score = float(reg.predict(X_reg)[0])
        else:
            model_disengagement = 1.0 / (1.0 + np.exp(1.2 - 2.8*accuracy - 2.2*consistency - 0.8*focus_scaled - 1.2*trend))
            model_score = logical_score

        # Blend the learned model nuance with the logical baseline (50/50) so
        # the numbers stay accurate AND intuitive.
        disengagement_prob = float(np.clip(0.5 * model_disengagement + 0.5 * logical_disengagement, 0.05, 0.95))
        predicted_score = float(np.clip(0.5 * model_score + 0.5 * logical_score, 35.0, 99.0))

        # ── STRICT LOGICAL GUARANTEES ─────────────────────────────
        # A clearly strong student can never look at risk or under-predicted.
        if accuracy >= 0.85 and consistency >= 0.60 and streak >= 5:
            disengagement_prob = min(disengagement_prob, 0.20)
            predicted_score = max(predicted_score, 78.0)
        # A clearly struggling student can never look safe or over-predicted.
        if accuracy < 0.60 or (streak <= 1 and consistency < 0.30):
            disengagement_prob = max(disengagement_prob, 0.55)
            predicted_score = min(predicted_score, 62.0)

        risk, flow_state, recommendation = _map_flow_state(
            disengagement_prob, predicted_score, accuracy, streak, total_lessons
        )

        return jsonify({
            "disengagementRisk": risk,
            "disengagementProb": int(round(disengagement_prob * 100)),
            "predictedNextScore": round(predicted_score, 1),
            "successProbability": int(round(predicted_score)),
            "flowState": flow_state,
            "recommendation": recommendation,
            "engine": "Python Scikit-Learn ML Engine (calibrated)",
            "featuresUsed": {
                "accuracy": round(accuracy, 2),
                "consistency": round(consistency, 2),
                "focusScaled": round(focus_scaled, 2),
                "trend": round(trend, 2),
                "streak": streak
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/cluster", methods=["POST"])
def cluster():
    try:
        data = request.json or {}
        students = data.get("students", [])
        if not students:
            return jsonify([])

        results = []
        for s in students:
            acc = float(s.get("accuracy", 65)) / 100.0
            cons = float(s.get("consistency", 50)) / 100.0
            f_scale = float(s.get("focusScaled", 40)) / 100.0

            if kmeans:
                X = np.array([[acc, cons, f_scale]])
                cluster_id = int(kmeans.predict(X)[0])
            else:
                if acc >= 0.80:
                    cluster_id = 0
                elif acc >= 0.60:
                    cluster_id = 1
                else:
                    cluster_id = 2

            cluster_labels = {
                0: "High-Achieving Explorers",
                1: "Steady Learners",
                2: "Struggling / At Risk"
            }

            results.append({
                "id": s.get("id"),
                "name": s.get("name"),
                "avatar": s.get("avatar"),
                "clusterId": cluster_id,
                "clusterLabel": cluster_labels.get(cluster_id, "Steady Learners"),
                "features": {
                    "accuracy": int(round(acc * 100)),
                    "consistency": int(round(cons * 100)),
                    "focusScaled": int(round(f_scale * 100))
                }
            })

        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/metrics", methods=["GET"])
def get_metrics():
    global metrics
    if not metrics and os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
    return jsonify(metrics or {"status": "metrics_not_ready"})

@app.route("/train", methods=["POST"])
def train():
    global clf, reg, kmeans, metrics
    metrics = train_and_save_models()
    clf, reg, kmeans, metrics = load_models()
    return jsonify({"status": "training_complete", "metrics": metrics})

if __name__ == "__main__":
    print("[PYTHON ML ENGINE] Starting Flask ML REST API Server on port 5002...")
    app.run(host="127.0.0.1", port=5002, debug=False)
