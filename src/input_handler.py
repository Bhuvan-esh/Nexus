"""
Stage 1: Input Validation & Guardrails
- Verifies Latin-script input
- Checks boundary length limits
- Rejects empty or whitespace-only inputs
- Isolates protected spans
"""

import re
from typing import Tuple

MAX_INPUT_LENGTH = 500

class ValidationError(ValueError):
    """Raised when user input violates validation guardrails."""
    pass

def validate_input(text: str) -> Tuple[bool, str]:
    """
    Validates the input string.
    Returns (is_valid, sanitized_text) or raises ValidationError.
    """
    if not text or not text.strip():
        raise ValidationError("Input text cannot be empty or whitespace only.")

    stripped = text.strip()

    if len(stripped) > MAX_INPUT_LENGTH:
        raise ValidationError(
            f"Input length ({len(stripped)} chars) exceeds maximum allowed limit of {MAX_INPUT_LENGTH} characters."
        )

    # Check for non-Latin script characters (excluding standard punctuation, digits, ascii symbols)
    non_latin_pattern = re.compile(r"[^\x00-\x7F\u00A0-\u00FF]")
    match = non_latin_pattern.search(stripped)
    if match:
        invalid_char = match.group()
        raise ValidationError(
            f"NEXUS operates exclusively on Latin-script English input. Unsupported character detected: '{invalid_char}'"
        )

    return True, stripped
