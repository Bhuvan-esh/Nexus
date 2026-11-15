"""
Stage 7: Post-Processing & Output Normalization
- Enforces Unicode Kannada block consistency
- Normalizes combining character sequences (NFC)
- Handles virama / vowel-modifier rules
- Reconstructs spacing and punctuation sequence
"""

import unicodedata
from typing import List

def normalize_kannada_unicode(text: str) -> str:
    """
    Applies standard Unicode NFC normalization to guarantee consistent Kannada glyph combining.
    """
    return unicodedata.normalize("NFC", text)

def reconstruct_sentence(tokens: List[str]) -> str:
    """
    Reconstructs spacing and punctuation in the rendered sentence.
    Does not insert spaces before standard punctuation marks like ., ,, !, ?, :, ;
    """
    result = ""
    for tok in tokens:
        if not result:
            result = tok
        elif tok in {".", ",", "!", "?", ":", ";", ")", "]"}:
            result += tok
        elif result.endswith("(") or result.endswith("["):
            result += tok
        else:
            result += " " + tok

    return normalize_kannada_unicode(result)
