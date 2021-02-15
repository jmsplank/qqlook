from flask import Flask, request, Response, jsonify
from flask_cors import CORS, cross_origin
from tinydb import TinyDB, Query
import pybowshock
import numpy as np
from datetime import datetime as dt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config["CORS_HEADERS"] = "Content-Type"

db = TinyDB("db.json")


def gt(time):
    return dt.strptime(time, "%Y-%m-%dT%H:%M:%S.%fZ")


def gd(time_bigger, time_smaller):
    time_bigger = gt(time_bigger)
    time_smaller = gt(time_smaller)
    return abs((time_bigger - time_smaller).total_seconds())


@app.route("/")
def home():
    return "<h1>Hello World</h1>"


@app.route("/shock_crossing", methods=["GET", "POST"])
def shock_crossings():
    if request.method == "GET":
        # Returns all shock crossings
        return (
            {"length": str(len(db)), "events": db.all()},
            200,
            {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": ["GET", "POST"],
            },
        )

    if request.method == "POST":
        # Add a new shock crossing
        data = request.json
        data["timeBurst"] = gd(data["burstEnd"], data["burstStart"])
        data["timeCrossing"] = gd(data["crossingEnd"], data["crossingStart"])
        dirn = ["timeSW", "timeMag"]
        data[dirn[0] if data["direction"] == 1 else dirn[1]] = gd(
            data["crossingStart"], data["burstStart"]
        )
        data[dirn[0] if data["direction"] == -1 else dirn[1]] = gd(
            data["burstEnd"], data["crossingEnd"]
        )
        db.insert(data)
        return (
            "Success.",
            200,
            {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": ["GET", "POST"],
            },
        )


@app.route("/get_estimated_shock_normal")
def get_estimated_shock_normal():
    x, y, z = [float(request.args.get(coord)) for coord in ["x", "y", "z"]]
    R = np.array([x, y, z])
    vsw = 100
    bimf = np.array([0, 10, 0])
    angle = pybowshock.bs_angle_at_surf_GSE(R, vsw, "BS: Peredo", bimf, unit="deg")

    return (
        {"angle": f"{angle:02.1f}"},
        200,
        {"Access-Control-Allow-Origin": "*"},
    )
