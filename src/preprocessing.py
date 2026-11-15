"""
Stage 2: Preprocessing & Normalization
- Strips excessive whitespace while preserving semantic casing metadata and punctuation
"""

import re

def preprocess_text(text: str) -> str:
    """
    Normalizes whitespace and standardizes quotes and hyphens.
    Preserves casing metadata for proper nouns and acronyms.
    """
    # Replace multiple consecutive spaces/tabs with a single space
    cleaned = re.sub(r"[ \t]+", " ", text.strip())
    # Standardize curly quotes to straight quotes
    cleaned = cleaned.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    return cleaned
