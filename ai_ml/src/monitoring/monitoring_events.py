"""
Interview Monitoring Events
---------------------------
Stores observable monitoring events during an AI interview.

Examples:
- FACE_NOT_DETECTED
- MULTIPLE_FACES
- MOVEMENT_DETECTED
- FACE_PRESENT

This module records observations only.
It does not make a final cheating or hiring decision.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid


class MonitoringEvent:
    """
    Represents one monitoring event.
    """

    def __init__(
        self,
        interview_id: str,
        student_id: str,
        event_type: str,
        details: Optional[Dict[str, Any]] = None,
        severity: str = "INFO",
        timestamp: Optional[str] = None,
    ):
        self.event_id = str(uuid.uuid4())
        self.interview_id = interview_id
        self.student_id = student_id
        self.event_type = event_type
        self.details = details or {}
        self.severity = severity
        self.timestamp = timestamp or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "interview_id": self.interview_id,
            "student_id": self.student_id,
            "event_type": self.event_type,
            "severity": self.severity,
            "timestamp": self.timestamp,
            "details": self.details,
        }


class MonitoringEventManager:
    """
    Manages monitoring events for an interview.
    """

    EVENT_SEVERITY = {
        "FACE_PRESENT": "INFO",
        "FACE_NOT_DETECTED": "WARNING",
        "MULTIPLE_FACES": "WARNING",
        "MOVEMENT_DETECTED": "INFO",
        "SIGNIFICANT_MOVEMENT": "WARNING",
        "MONITORING_STARTED": "INFO",
        "MONITORING_STOPPED": "INFO",
    }

    def __init__(
        self,
        interview_id: str,
        student_id: str,
    ):
        self.interview_id = interview_id
        self.student_id = student_id
        self.events: List[MonitoringEvent] = []

    def add_event(
        self,
        event_type: str,
        details: Optional[Dict[str, Any]] = None,
        severity: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Add a monitoring event.
        """

        if severity is None:
            severity = self.EVENT_SEVERITY.get(
                event_type,
                "INFO",
            )

        event = MonitoringEvent(
            interview_id=self.interview_id,
            student_id=self.student_id,
            event_type=event_type,
            details=details,
            severity=severity,
        )

        self.events.append(event)

        return event.to_dict()

    def record_face_detection(
        self,
        detection_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Convert face detection output into a monitoring event.
        """

        face_count = detection_result.get(
            "face_count",
            0,
        )

        if face_count == 0:
            return self.add_event(
                event_type="FACE_NOT_DETECTED",
                details={
                    "face_count": 0,
                    "face_present": False,
                },
            )

        if face_count > 1:
            return self.add_event(
                event_type="MULTIPLE_FACES",
                details={
                    "face_count": face_count,
                    "face_present": True,
                    "faces": detection_result.get(
                        "faces",
                        [],
                    ),
                },
            )

        return self.add_event(
            event_type="FACE_PRESENT",
            details={
                "face_count": face_count,
                "face_present": True,
            },
        )

    def record_movement(
        self,
        movement_result: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Convert movement detection output into an event.

        No event is created when there is no movement.
        """

        movement_detected = movement_result.get(
            "movement_detected",
            False,
        )

        if not movement_detected:
            return None

        magnitude = float(
            movement_result.get(
                "magnitude",
                0.0,
            )
        )

        if magnitude >= 0.30:
            event_type = "SIGNIFICANT_MOVEMENT"
        else:
            event_type = "MOVEMENT_DETECTED"

        return self.add_event(
            event_type=event_type,
            details={
                "movement_score": movement_result.get(
                    "movement_score",
                    0.0,
                ),
                "direction": movement_result.get(
                    "direction",
                    "NONE",
                ),
                "magnitude": magnitude,
            },
        )

    def start_monitoring(self) -> Dict[str, Any]:
        """
        Record monitoring start.
        """

        return self.add_event(
            event_type="MONITORING_STARTED",
            details={
                "message": "Interview monitoring started."
            },
        )

    def stop_monitoring(self) -> Dict[str, Any]:
        """
        Record monitoring stop.
        """

        return self.add_event(
            event_type="MONITORING_STOPPED",
            details={
                "message": "Interview monitoring stopped."
            },
        )

    def get_events(self) -> List[Dict[str, Any]]:
        """
        Return all events.
        """

        return [
            event.to_dict()
            for event in self.events
        ]

    def get_event_count(self) -> int:
        return len(self.events)

    def get_events_by_type(
        self,
        event_type: str,
    ) -> List[Dict[str, Any]]:
        """
        Filter events by event type.
        """

        return [
            event.to_dict()
            for event in self.events
            if event.event_type == event_type
        ]

    def get_events_by_severity(
        self,
        severity: str,
    ) -> List[Dict[str, Any]]:
        """
        Filter events by severity.
        """

        return [
            event.to_dict()
            for event in self.events
            if event.severity == severity
        ]

    def get_summary(self) -> Dict[str, Any]:
        """
        Generate a monitoring summary.
        """

        event_counts: Dict[str, int] = {}
        severity_counts: Dict[str, int] = {}

        for event in self.events:
            event_counts[event.event_type] = (
                event_counts.get(event.event_type, 0) + 1
            )

            severity_counts[event.severity] = (
                severity_counts.get(event.severity, 0) + 1
            )

        return {
            "interview_id": self.interview_id,
            "student_id": self.student_id,
            "total_events": len(self.events),
            "event_counts": event_counts,
            "severity_counts": severity_counts,
        }


def create_monitoring_event(
    interview_id: str,
    student_id: str,
    event_type: str,
    details: Optional[Dict[str, Any]] = None,
    severity: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Convenience function for creating one event.
    """

    manager = MonitoringEventManager(
        interview_id=interview_id,
        student_id=student_id,
    )

    return manager.add_event(
        event_type=event_type,
        details=details,
        severity=severity,
    )


def demo():
    print("=" * 60)
    print("MONITORING EVENTS DEMO")
    print("=" * 60)

    manager = MonitoringEventManager(
        interview_id="INT-001",
        student_id="STU-001",
    )

    # Start monitoring
    manager.start_monitoring()

    # Face present
    manager.record_face_detection(
        {
            "face_count": 1,
            "face_present": True,
            "multiple_faces": False,
            "faces": [
                {
                    "face_id": 1,
                    "x": 100,
                    "y": 100,
                }
            ],
        }
    )

    # Multiple faces
    manager.record_face_detection(
        {
            "face_count": 2,
            "face_present": True,
            "multiple_faces": True,
            "faces": [
                {"face_id": 1},
                {"face_id": 2},
            ],
        }
    )

    # Movement
    manager.record_movement(
        {
            "movement_detected": True,
            "movement_score": 25.0,
            "direction": "RIGHT",
            "magnitude": 0.25,
        }
    )

    # Significant movement
    manager.record_movement(
        {
            "movement_detected": True,
            "movement_score": 55.0,
            "direction": "LEFT",
            "magnitude": 0.55,
        }
    )

    # Face missing
    manager.record_face_detection(
        {
            "face_count": 0,
            "face_present": False,
            "multiple_faces": False,
            "faces": [],
        }
    )

    # Stop monitoring
    manager.stop_monitoring()

    print("\nEVENTS")
    print("-" * 60)

    for event in manager.get_events():
        print(
            f"{event['event_type']} | "
            f"{event['severity']} | "
            f"{event['timestamp']}"
        )

    print("\nSUMMARY")
    print("-" * 60)

    summary = manager.get_summary()

    print("Interview ID:", summary["interview_id"])
    print("Student ID:", summary["student_id"])
    print("Total Events:", summary["total_events"])
    print("Event Counts:", summary["event_counts"])
    print("Severity Counts:", summary["severity_counts"])


if __name__ == "__main__":
    demo()