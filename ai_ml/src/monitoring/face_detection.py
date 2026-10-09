"""
Face Detection Module
---------------------
Detects faces from camera frames.

This module reports observable signals only:
- no face
- one face
- multiple faces
- approximate face position

It does NOT make cheating decisions.
"""

from typing import Any, Dict, List, Optional


class FaceDetectionResult:
    """
    Structured result for a single frame.
    """

    def __init__(
        self,
        face_count: int = 0,
        faces: Optional[List[Dict[str, Any]]] = None,
    ):
        self.face_count = face_count
        self.faces = faces or []

    @property
    def face_present(self) -> bool:
        return self.face_count > 0

    @property
    def multiple_faces(self) -> bool:
        return self.face_count > 1

    def to_dict(self) -> Dict[str, Any]:
        return {
            "face_count": self.face_count,
            "face_present": self.face_present,
            "multiple_faces": self.multiple_faces,
            "faces": self.faces,
        }


class FaceDetector:
    """
    Lightweight face detection interface.

    The actual camera/frame processing can later be connected
    to OpenCV, MediaPipe, or another computer-vision model.
    """

    def __init__(self):
        self.total_frames_processed = 0

    def detect(self, frame: Any = None) -> Dict[str, Any]:
        """
        Detect faces in a frame.

        For now this method supports:
        - structured test data
        - simple dictionary input

        A real camera integration can later pass an OpenCV frame.
        """

        self.total_frames_processed += 1

        # Test/structured input
        if isinstance(frame, dict):
            faces = frame.get("faces", [])

            if not isinstance(faces, list):
                faces = []

            normalized_faces = []

            for index, face in enumerate(faces):
                if isinstance(face, dict):
                    normalized_faces.append(
                        {
                            "face_id": face.get("face_id", index + 1),
                            "x": face.get("x"),
                            "y": face.get("y"),
                            "width": face.get("width"),
                            "height": face.get("height"),
                        }
                    )
                else:
                    normalized_faces.append(
                        {
                            "face_id": index + 1,
                            "x": None,
                            "y": None,
                            "width": None,
                            "height": None,
                        }
                    )

            result = FaceDetectionResult(
                face_count=len(normalized_faces),
                faces=normalized_faces,
            )

            return result.to_dict()

        # No actual frame supplied
        result = FaceDetectionResult(
            face_count=0,
            faces=[],
        )

        return result.to_dict()

    def detect_from_face_count(self, face_count: int) -> Dict[str, Any]:
        """
        Useful for testing the monitoring pipeline.
        """

        try:
            face_count = int(face_count)
        except (TypeError, ValueError):
            face_count = 0

        face_count = max(0, face_count)

        faces = []

        for index in range(face_count):
            faces.append(
                {
                    "face_id": index + 1,
                    "x": None,
                    "y": None,
                    "width": None,
                    "height": None,
                }
            )

        result = FaceDetectionResult(
            face_count=face_count,
            faces=faces,
        )

        return result.to_dict()

    def get_status(self, detection_result: Dict[str, Any]) -> str:
        """
        Convert face detection into a descriptive status.
        """

        face_count = detection_result.get("face_count", 0)

        if face_count == 0:
            return "NO_FACE"

        if face_count == 1:
            return "SINGLE_FACE"

        return "MULTIPLE_FACES"


def detect_faces(frame: Any = None) -> Dict[str, Any]:
    """
    Convenience function.
    """

    detector = FaceDetector()
    return detector.detect(frame)


def demo():
    print("=" * 60)
    print("FACE DETECTION DEMO")
    print("=" * 60)

    detector = FaceDetector()

    test_frames = [
        {"faces": []},
        {
            "faces": [
                {
                    "face_id": 1,
                    "x": 100,
                    "y": 80,
                    "width": 200,
                    "height": 220,
                }
            ]
        },
        {
            "faces": [
                {
                    "face_id": 1,
                    "x": 100,
                    "y": 80,
                    "width": 200,
                    "height": 220,
                },
                {
                    "face_id": 2,
                    "x": 400,
                    "y": 100,
                    "width": 180,
                    "height": 200,
                },
            ]
        },
    ]

    for index, frame in enumerate(test_frames, start=1):
        result = detector.detect(frame)
        status = detector.get_status(result)

        print(f"\nFrame {index}")
        print("Face Count:", result["face_count"])
        print("Face Present:", result["face_present"])
        print("Multiple Faces:", result["multiple_faces"])
        print("Status:", status)

    print("\nTotal Frames Processed:", detector.total_frames_processed)


if __name__ == "__main__":
    demo()