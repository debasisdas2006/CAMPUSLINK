"""
Camera Monitoring Controller
----------------------------
Combines:

1. Face detection
2. Movement detection
3. Monitoring event management

This module coordinates observable interview-monitoring
signals. It does not make a final cheating decision.
"""

import sys
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------
# PATH SETUP
# ---------------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parents[2]

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


# ---------------------------------------------------------
# IMPORT MONITORING MODULES
# ---------------------------------------------------------

from src.monitoring.face_detection import FaceDetector
from src.monitoring.movement_detection import MovementDetector
from src.monitoring.monitoring_events import MonitoringEventManager


class CameraMonitor:
    """
    Main controller for interview monitoring.
    """

    def __init__(
        self,
        interview_id: str,
        student_id: str,
    ):
        self.interview_id = interview_id
        self.student_id = student_id

        self.face_detector = FaceDetector()
        self.movement_detector = MovementDetector()

        self.event_manager = MonitoringEventManager(
            interview_id=interview_id,
            student_id=student_id,
        )

        self.is_monitoring = False
        self.frames_processed = 0
        self.started_at: Optional[str] = None
        self.stopped_at: Optional[str] = None

    def start(self) -> Dict[str, Any]:
        """
        Start interview monitoring.
        """

        if self.is_monitoring:
            return {
                "success": True,
                "message": "Monitoring is already running.",
                "status": self.get_status(),
            }

        self.is_monitoring = True
        self.started_at = datetime.utcnow().isoformat()
        self.stopped_at = None

        event = self.event_manager.start_monitoring()

        return {
            "success": True,
            "message": "Interview monitoring started.",
            "event": event,
            "status": self.get_status(),
        }

    def stop(self) -> Dict[str, Any]:
        """
        Stop interview monitoring.
        """

        if not self.is_monitoring:
            return {
                "success": True,
                "message": "Monitoring is already stopped.",
                "status": self.get_status(),
            }

        self.is_monitoring = False
        self.stopped_at = datetime.utcnow().isoformat()

        event = self.event_manager.stop_monitoring()

        return {
            "success": True,
            "message": "Interview monitoring stopped.",
            "event": event,
            "status": self.get_status(),
        }

    def process_frame(
        self,
        frame: Any = None,
        movement_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Process one monitoring frame.
        """

        if not self.is_monitoring:
            return {
                "success": False,
                "message": "Monitoring is not running.",
                "interview_id": self.interview_id,
                "student_id": self.student_id,
            }

        self.frames_processed += 1

        # -------------------------------------------------
        # FACE DETECTION
        # -------------------------------------------------

        face_result = self.face_detector.detect(frame)

        face_event = self.event_manager.record_face_detection(
            face_result
        )

        # -------------------------------------------------
        # MOVEMENT DETECTION
        # -------------------------------------------------

        movement_result = {
            "movement_detected": False,
            "movement_score": 0.0,
            "direction": "NONE",
            "magnitude": 0.0,
        }

        movement_event = None

        if movement_data is not None:
            movement_result = self.movement_detector.detect(
                movement_data
            )

            movement_event = self.event_manager.record_movement(
                movement_result
            )

        return {
            "success": True,
            "frame_number": self.frames_processed,
            "timestamp": datetime.utcnow().isoformat(),
            "face_detection": face_result,
            "movement_detection": movement_result,
            "events": {
                "face": face_event,
                "movement": movement_event,
            },
        }

    def process_test_observation(
        self,
        face_count: int = 1,
        current_position: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Test monitoring without a real camera.
        """

        try:
            face_count = int(face_count)
        except (TypeError, ValueError):
            face_count = 0

        face_count = max(0, face_count)

        frame = {
            "faces": [
                {
                    "face_id": index + 1,
                    "x": None,
                    "y": None,
                    "width": None,
                    "height": None,
                }
                for index in range(face_count)
            ]
        }

        movement_data = None

        if current_position is not None:
            movement_data = {
                "person_position": current_position
            }

        return self.process_frame(
            frame=frame,
            movement_data=movement_data,
        )

    def get_events(self) -> List[Dict[str, Any]]:
        """
        Return all monitoring events.
        """

        return self.event_manager.get_events()

    def get_summary(self) -> Dict[str, Any]:
        """
        Return complete monitoring summary.
        """

        event_summary = self.event_manager.get_summary()

        return {
            "interview_id": self.interview_id,
            "student_id": self.student_id,
            "is_monitoring": self.is_monitoring,
            "started_at": self.started_at,
            "stopped_at": self.stopped_at,
            "frames_processed": self.frames_processed,
            "event_summary": event_summary,
            "face_frames_processed": (
                self.face_detector.total_frames_processed
            ),
            "movement_frames_processed": (
                self.movement_detector.total_frames_processed
            ),
            "movement_events": (
                self.movement_detector.movement_events
            ),
        }

    def get_status(self) -> Dict[str, Any]:
        """
        Return current monitoring status.
        """

        return {
            "interview_id": self.interview_id,
            "student_id": self.student_id,
            "is_monitoring": self.is_monitoring,
            "frames_processed": self.frames_processed,
            "started_at": self.started_at,
            "stopped_at": self.stopped_at,
        }


def create_camera_monitor(
    interview_id: str,
    student_id: str,
) -> CameraMonitor:
    """
    Factory function.
    """

    return CameraMonitor(
        interview_id=interview_id,
        student_id=student_id,
    )


def demo():
    print("=" * 60)
    print("CAMERA MONITOR DEMO")
    print("=" * 60)

    monitor = CameraMonitor(
        interview_id="INT-001",
        student_id="STU-001",
    )

    # -------------------------------------------------
    # START
    # -------------------------------------------------

    result = monitor.start()

    print("\nSTART")
    print(result["message"])

    # -------------------------------------------------
    # FRAME 1
    # -------------------------------------------------

    print("\nFRAME 1")

    result = monitor.process_test_observation(
        face_count=1,
        current_position={
            "x": 0.50,
            "y": 0.50,
        },
    )

    print(
        "Face Count:",
        result["face_detection"]["face_count"],
    )

    print(
        "Movement:",
        result["movement_detection"]["movement_detected"],
    )

    # -------------------------------------------------
    # FRAME 2
    # -------------------------------------------------

    print("\nFRAME 2")

    result = monitor.process_test_observation(
        face_count=1,
        current_position={
            "x": 0.52,
            "y": 0.50,
        },
    )

    print(
        "Face Count:",
        result["face_detection"]["face_count"],
    )

    print(
        "Movement:",
        result["movement_detection"]["movement_detected"],
    )

    # -------------------------------------------------
    # FRAME 3
    # -------------------------------------------------

    print("\nFRAME 3")

    result = monitor.process_test_observation(
        face_count=2,
        current_position={
            "x": 0.75,
            "y": 0.50,
        },
    )

    print(
        "Face Count:",
        result["face_detection"]["face_count"],
    )

    print(
        "Multiple Faces:",
        result["face_detection"]["multiple_faces"],
    )

    print(
        "Movement:",
        result["movement_detection"]["movement_detected"],
    )

    # -------------------------------------------------
    # FRAME 4
    # -------------------------------------------------

    print("\nFRAME 4")

    result = monitor.process_test_observation(
        face_count=0,
        current_position={
            "x": 0.75,
            "y": 0.75,
        },
    )

    print(
        "Face Count:",
        result["face_detection"]["face_count"],
    )

    print(
        "Face Present:",
        result["face_detection"]["face_present"],
    )

    print(
        "Movement:",
        result["movement_detection"]["movement_detected"],
    )

    # -------------------------------------------------
    # STOP
    # -------------------------------------------------

    result = monitor.stop()

    print("\nSTOP")
    print(result["message"])

    # -------------------------------------------------
    # SUMMARY
    # -------------------------------------------------

    print("\n" + "=" * 60)
    print("MONITORING SUMMARY")
    print("=" * 60)

    summary = monitor.get_summary()

    print("Interview ID:", summary["interview_id"])
    print("Student ID:", summary["student_id"])
    print("Frames Processed:", summary["frames_processed"])
    print("Monitoring Active:", summary["is_monitoring"])
    print("Movement Events:", summary["movement_events"])

    print("\nEvent Counts:")
    print(summary["event_summary"]["event_counts"])

    print("\nSeverity Counts:")
    print(summary["event_summary"]["severity_counts"])


if __name__ == "__main__":
    demo()