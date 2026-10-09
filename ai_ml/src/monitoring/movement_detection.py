"""
Movement Detection Module
-------------------------
Tracks observable movement signals during an interview.

This module does NOT determine cheating.
It only records movement-related observations that can
later be reviewed by the recruiter/admin system.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime


class MovementDetectionResult:
    """
    Structured movement detection result.
    """

    def __init__(
        self,
        movement_detected: bool = False,
        movement_score: float = 0.0,
        direction: str = "NONE",
        magnitude: float = 0.0,
    ):
        self.movement_detected = movement_detected
        self.movement_score = movement_score
        self.direction = direction
        self.magnitude = magnitude

    def to_dict(self) -> Dict[str, Any]:
        return {
            "movement_detected": self.movement_detected,
            "movement_score": round(self.movement_score, 2),
            "direction": self.direction,
            "magnitude": round(self.magnitude, 2),
        }


class MovementDetector:
    """
    Lightweight movement detector.

    The current implementation accepts structured movement data.
    A real camera implementation can later connect OpenCV,
    MediaPipe, or another computer-vision model.
    """

    MOVEMENT_THRESHOLD = 0.15

    VALID_DIRECTIONS = {
        "NONE",
        "LEFT",
        "RIGHT",
        "UP",
        "DOWN",
        "FORWARD",
        "BACKWARD",
    }

    def __init__(self):
        self.total_frames_processed = 0
        self.movement_events = 0
        self.previous_position: Optional[Dict[str, float]] = None

    def calculate_movement(
        self,
        previous_position: Optional[Dict[str, float]],
        current_position: Optional[Dict[str, float]],
    ) -> Dict[str, Any]:
        """
        Calculate movement between two positions.

        Expected position format:

        {
            "x": 0.50,
            "y": 0.50
        }

        Values are normally normalized between 0 and 1.
        """

        if not previous_position or not current_position:
            return MovementDetectionResult().to_dict()

        try:
            previous_x = float(previous_position.get("x", 0.0))
            previous_y = float(previous_position.get("y", 0.0))

            current_x = float(current_position.get("x", 0.0))
            current_y = float(current_position.get("y", 0.0))
        except (TypeError, ValueError):
            return MovementDetectionResult().to_dict()

        dx = current_x - previous_x
        dy = current_y - previous_y

        magnitude = (dx ** 2 + dy ** 2) ** 0.5

        movement_detected = magnitude >= self.MOVEMENT_THRESHOLD

        if not movement_detected:
            direction = "NONE"
        elif abs(dx) >= abs(dy):
            direction = "RIGHT" if dx > 0 else "LEFT"
        else:
            direction = "DOWN" if dy > 0 else "UP"

        movement_score = min(magnitude * 100, 100)

        result = MovementDetectionResult(
            movement_detected=movement_detected,
            movement_score=movement_score,
            direction=direction,
            magnitude=magnitude,
        )

        if movement_detected:
            self.movement_events += 1

        return result.to_dict()

    def detect(
        self,
        frame_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Process one movement observation.

        Supported test format:

        {
            "person_position": {
                "x": 0.50,
                "y": 0.50
            }
        }
        """

        self.total_frames_processed += 1

        if not isinstance(frame_data, dict):
            return MovementDetectionResult().to_dict()

        current_position = frame_data.get("person_position")

        if not isinstance(current_position, dict):
            return MovementDetectionResult().to_dict()

        result = self.calculate_movement(
            self.previous_position,
            current_position,
        )

        self.previous_position = {
            "x": float(current_position.get("x", 0.0)),
            "y": float(current_position.get("y", 0.0)),
        }

        return result

    def detect_movement_sequence(
        self,
        positions: List[Dict[str, float]],
    ) -> List[Dict[str, Any]]:
        """
        Process a sequence of positions.
        """

        results = []

        self.previous_position = None

        for position in positions:
            result = self.detect(
                {
                    "person_position": position
                }
            )

            results.append(result)

        return results

    def get_summary(self) -> Dict[str, Any]:
        """
        Return detector statistics.
        """

        movement_rate = 0.0

        if self.total_frames_processed > 0:
            movement_rate = (
                self.movement_events
                / self.total_frames_processed
            ) * 100

        return {
            "total_frames_processed": self.total_frames_processed,
            "movement_events": self.movement_events,
            "movement_rate": round(movement_rate, 2),
        }


def detect_movement(
    previous_position: Optional[Dict[str, float]],
    current_position: Optional[Dict[str, float]],
) -> Dict[str, Any]:
    """
    Convenience function.
    """

    detector = MovementDetector()

    return detector.calculate_movement(
        previous_position,
        current_position,
    )


def demo():
    print("=" * 60)
    print("MOVEMENT DETECTION DEMO")
    print("=" * 60)

    detector = MovementDetector()

    positions = [
        {"x": 0.50, "y": 0.50},
        {"x": 0.52, "y": 0.50},
        {"x": 0.70, "y": 0.50},
        {"x": 0.70, "y": 0.70},
        {"x": 0.70, "y": 0.70},
    ]

    print("\nProcessing movement sequence...")

    results = detector.detect_movement_sequence(positions)

    for index, result in enumerate(results, start=1):
        print(f"\nFrame {index}")
        print("Movement Detected:", result["movement_detected"])
        print("Movement Score:", result["movement_score"])
        print("Direction:", result["direction"])
        print("Magnitude:", result["magnitude"])

    print("\n" + "-" * 60)
    print("SUMMARY")
    print("-" * 60)

    summary = detector.get_summary()

    print("Frames Processed:", summary["total_frames_processed"])
    print("Movement Events:", summary["movement_events"])
    print("Movement Rate:", summary["movement_rate"], "%")


if __name__ == "__main__":
    demo()