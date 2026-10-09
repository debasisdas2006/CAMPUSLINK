"""
CAMPUSLINK - Interview Monitoring API
-------------------------------------

Provides API endpoints for:

- Starting interview monitoring
- Processing monitoring observations
- Getting monitoring events
- Getting monitoring summary
- Getting monitoring status
- Stopping monitoring

The monitoring system reports observable signals.
It does not independently determine cheating or hiring outcomes.
"""

import sys
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4


# ---------------------------------------------------------
# PATH SETUP
# ---------------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parents[1]

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


# ---------------------------------------------------------
# IMPORT MONITORING MODULE
# ---------------------------------------------------------

from src.monitoring.camera_monitor import CameraMonitor


# ---------------------------------------------------------
# OPTIONAL FASTAPI IMPORT
# ---------------------------------------------------------

try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel

    FASTAPI_AVAILABLE = True

except ImportError:
    FASTAPI_AVAILABLE = False


# ---------------------------------------------------------
# IN-MEMORY MONITORING SESSIONS
# ---------------------------------------------------------

MONITORING_SESSIONS: Dict[str, CameraMonitor] = {}


# ---------------------------------------------------------
# PYDANTIC MODELS
# ---------------------------------------------------------

if FASTAPI_AVAILABLE:

    class StartMonitoringRequest(BaseModel):
        interview_id: str
        student_id: str


    class FaceData(BaseModel):
        face_count: int = 1


    class PositionData(BaseModel):
        x: float
        y: float


    class MonitoringFrameRequest(BaseModel):
        face_count: int = 1
        position: Optional[PositionData] = None


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def create_monitoring_id() -> str:
    """
    Create unique monitoring session ID.
    """

    return f"MON-{uuid4().hex[:10].upper()}"


def get_monitoring_session(
    monitoring_id: str,
) -> CameraMonitor:

    monitor = MONITORING_SESSIONS.get(
        monitoring_id
    )

    if monitor is None:
        raise ValueError(
            f"Monitoring session not found: {monitoring_id}"
        )

    return monitor


# ---------------------------------------------------------
# SERVICE FUNCTIONS
# ---------------------------------------------------------

def start_monitoring(
    interview_id: str,
    student_id: str,
) -> Dict[str, Any]:
    """
    Create and start a monitoring session.
    """

    monitoring_id = create_monitoring_id()

    monitor = CameraMonitor(
        interview_id=interview_id,
        student_id=student_id,
    )

    start_result = monitor.start()

    MONITORING_SESSIONS[monitoring_id] = monitor

    return {
        "success": True,
        "monitoring_id": monitoring_id,
        "interview_id": interview_id,
        "student_id": student_id,
        "monitoring": start_result,
    }


def process_monitoring_frame(
    monitoring_id: str,
    face_count: int = 1,
    position: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Process one monitoring observation.
    """

    monitor = get_monitoring_session(
        monitoring_id
    )

    result = monitor.process_test_observation(
        face_count=face_count,
        current_position=position,
    )

    return {
        "success": result.get(
            "success",
            False,
        ),
        "monitoring_id": monitoring_id,
        "result": result,
    }


def get_monitoring_status(
    monitoring_id: str,
) -> Dict[str, Any]:
    """
    Return current monitoring status.
    """

    monitor = get_monitoring_session(
        monitoring_id
    )

    return {
        "success": True,
        "monitoring_id": monitoring_id,
        "status": monitor.get_status(),
    }


def get_monitoring_events(
    monitoring_id: str,
) -> Dict[str, Any]:
    """
    Return all events generated during monitoring.
    """

    monitor = get_monitoring_session(
        monitoring_id
    )

    events = monitor.get_events()

    return {
        "success": True,
        "monitoring_id": monitoring_id,
        "total_events": len(events),
        "events": events,
    }


def get_monitoring_summary(
    monitoring_id: str,
) -> Dict[str, Any]:
    """
    Return monitoring summary.
    """

    monitor = get_monitoring_session(
        monitoring_id
    )

    return {
        "success": True,
        "monitoring_id": monitoring_id,
        "summary": monitor.get_summary(),
    }


def stop_monitoring(
    monitoring_id: str,
) -> Dict[str, Any]:
    """
    Stop monitoring.
    """

    monitor = get_monitoring_session(
        monitoring_id
    )

    result = monitor.stop()

    return {
        "success": True,
        "monitoring_id": monitoring_id,
        "monitoring": result,
        "summary": monitor.get_summary(),
    }


# ---------------------------------------------------------
# FASTAPI APPLICATION
# ---------------------------------------------------------

if FASTAPI_AVAILABLE:

    app = FastAPI(
        title="CAMPUSLINK AI/ML Monitoring API",
        description=(
            "Interview monitoring API for CAMPUSLINK"
        ),
        version="1.0.0",
    )


    @app.get("/")
    def root():
        return {
            "service": "CAMPUSLINK AI/ML Monitoring",
            "status": "running",
            "version": "1.0.0",
        }


    @app.get("/health")
    def health():
        return {
            "status": "healthy",
            "service": "monitoring",
            "active_sessions": len(
                MONITORING_SESSIONS
            ),
        }


    @app.post("/monitoring/start")
    def api_start_monitoring(
        request: StartMonitoringRequest,
    ):
        try:
            return start_monitoring(
                interview_id=request.interview_id,
                student_id=request.student_id,
            )

        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=str(exc),
            )


    @app.post(
        "/monitoring/{monitoring_id}/frame"
    )
    def api_process_frame(
        monitoring_id: str,
        request: MonitoringFrameRequest,
    ):
        try:
            position = None

            if request.position is not None:
                position = {
                    "x": request.position.x,
                    "y": request.position.y,
                }

            return process_monitoring_frame(
                monitoring_id=monitoring_id,
                face_count=request.face_count,
                position=position,
            )

        except ValueError as exc:
            raise HTTPException(
                status_code=404,
                detail=str(exc),
            )

        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=str(exc),
            )


    @app.get(
        "/monitoring/{monitoring_id}/status"
    )
    def api_monitoring_status(
        monitoring_id: str,
    ):
        try:
            return get_monitoring_status(
                monitoring_id
            )

        except ValueError as exc:
            raise HTTPException(
                status_code=404,
                detail=str(exc),
            )


    @app.get(
        "/monitoring/{monitoring_id}/events"
    )
    def api_monitoring_events(
        monitoring_id: str,
    ):
        try:
            return get_monitoring_events(
                monitoring_id
            )

        except ValueError as exc:
            raise HTTPException(
                status_code=404,
                detail=str(exc),
            )


    @app.get(
        "/monitoring/{monitoring_id}/summary"
    )
    def api_monitoring_summary(
        monitoring_id: str,
    ):
        try:
            return get_monitoring_summary(
                monitoring_id
            )

        except ValueError as exc:
            raise HTTPException(
                status_code=404,
                detail=str(exc),
            )


    @app.post(
        "/monitoring/{monitoring_id}/stop"
    )
    def api_stop_monitoring(
        monitoring_id: str,
    ):
        try:
            return stop_monitoring(
                monitoring_id
            )

        except ValueError as exc:
            raise HTTPException(
                status_code=404,
                detail=str(exc),
            )


else:

    app = None


# ---------------------------------------------------------
# DEMO
# ---------------------------------------------------------

def demo():

    print("=" * 60)
    print("CAMPUSLINK MONITORING API DEMO")
    print("=" * 60)

    # -----------------------------------------------------
    # START
    # -----------------------------------------------------

    result = start_monitoring(
        interview_id="INT-001",
        student_id="STU-001",
    )

    monitoring_id = result["monitoring_id"]

    print("\nMonitoring Started")
    print("------------------")
    print("Monitoring ID:", monitoring_id)

    # -----------------------------------------------------
    # FRAME 1
    # -----------------------------------------------------

    print("\nFrame 1")

    result = process_monitoring_frame(
        monitoring_id=monitoring_id,
        face_count=1,
        position={
            "x": 0.50,
            "y": 0.50,
        },
    )

    print(
        "Face Count:",
        result["result"][
            "face_detection"
        ]["face_count"],
    )

    # -----------------------------------------------------
    # FRAME 2
    # -----------------------------------------------------

    print("\nFrame 2")

    result = process_monitoring_frame(
        monitoring_id=monitoring_id,
        face_count=1,
        position={
            "x": 0.52,
            "y": 0.50,
        },
    )

    print(
        "Movement:",
        result["result"][
            "movement_detection"
        ]["movement_detected"],
    )

    # -----------------------------------------------------
    # FRAME 3
    # -----------------------------------------------------

    print("\nFrame 3")

    result = process_monitoring_frame(
        monitoring_id=monitoring_id,
        face_count=2,
        position={
            "x": 0.75,
            "y": 0.50,
        },
    )

    print(
        "Face Count:",
        result["result"][
            "face_detection"
        ]["face_count"],
    )

    print(
        "Multiple Faces:",
        result["result"][
            "face_detection"
        ]["multiple_faces"],
    )

    # -----------------------------------------------------
    # EVENTS
    # -----------------------------------------------------

    events = get_monitoring_events(
        monitoring_id
    )

    print("\nMonitoring Events")
    print("-----------------")

    for event in events["events"]:
        print(
            event["event_type"],
            "|",
            event["severity"],
        )

    # -----------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------

    summary = get_monitoring_summary(
        monitoring_id
    )

    print("\nMonitoring Summary")
    print("------------------")

    print(
        summary["summary"]
    )

    # -----------------------------------------------------
    # STOP
    # -----------------------------------------------------

    stop_result = stop_monitoring(
        monitoring_id
    )

    print("\nMonitoring Stopped")
    print("------------------")

    print(
        stop_result["monitoring"]["message"]
    )


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

if __name__ == "__main__":

    demo()

    if FASTAPI_AVAILABLE:
        print("\n" + "=" * 60)
        print("FastAPI is available.")
        print("Run the API with:")
        print(
            "uvicorn api.monitoring_api:app --reload"
        )
        print("=" * 60)
    else:
        print("\nFastAPI is not installed.")
        print(
            "Install it using: pip install fastapi uvicorn"
        )