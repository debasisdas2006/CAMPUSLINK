"""
CAMPUSLINK AI/ML
Common utility functions.
"""

import re
from typing import Any


def normalize_text(value: Any) -> str:
    """
    Convert a value into normalized lowercase text.
    """
    if value is None:
        return ""

    return str(value).strip().lower()


def normalize_skill(skill: Any) -> str:
    """
    Normalize a programming language or technical skill.
    """
    skill = normalize_text(skill)

    skill = skill.replace("-", " ")
    skill = re.sub(r"\s+", " ", skill)

    aliases = {
        "py": "python",
        "python3": "python",
        "js": "javascript",
        "ts": "typescript",
        "c plus plus": "c++",
        "cpp": "c++",
        "c sharp": "c#",
        "postgres": "postgresql",
        "postgre sql": "postgresql",
        "mongo": "mongodb",
        "machine learning": "machine learning",
        "ml": "machine learning",
        "artificial intelligence": "artificial intelligence",
        "ai": "artificial intelligence",
    }

    return aliases.get(skill, skill)


def normalize_skill_list(skills: list[Any]) -> list[str]:
    """
    Normalize and deduplicate a list of skills.
    """
    result = []

    for skill in skills or []:
        normalized = normalize_skill(skill)

        if normalized and normalized not in result:
            result.append(normalized)

    return result


def clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    """
    Keep a numeric value inside a defined range.
    """
    return max(minimum, min(value, maximum))