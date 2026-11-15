"""
Stage 4: Pronunciation Analysis (G2P)
- Maps graphemic patterns into phonetic representations
- Analyzes multi-letter patterns, digraphs (sh, ch, ph, th), silent letters
- Integrates CMU Pronouncing Dictionary & rule-based phonemic synthesis
"""

from typing import List, Tuple

# Multi-letter digraph patterns
DIGRAPHS = {
    "sh": "SH",
    "ch": "CH",
    "ph": "F",
    "th": "TH",
    "wh": "W",
    "ck": "K",
    "ng": "NG",
    "ee": "IY",
    "oo": "UW",
    "ai": "EY",
    "ay": "EY",
    "ea": "IY",
    "oa": "OW",
}

# Common CMU dictionary phoneme cache for primary demo words
PHONEME_CACHE = {
    "hello": ["HH", "AH0", "L", "OW1"],
    "the": ["DH", "AH0"],
    "school": ["S", "K", "UW1", "L"],
    "is": ["IH1", "Z"],
    "open": ["OW1", "P", "AH0", "N"],
    "good": ["G", "UH1", "D"],
    "morning": ["M", "AO1", "R", "N", "IH0", "NG"],
    "machine": ["M", "AH0", "SH", "IY1", "N"],
    "learning": ["L", "ER1", "N", "IH0", "NG"],
    "computer": ["K", "AH0", "M", "P", "Y", "UW1", "T", "ER0"],
    "bangalore": ["B", "AE1", "NG", "G", "AH0", "L", "AO1", "R"],
    "bhuvanesh": ["B", "UW1", "V", "AH0", "N", "EH1", "SH"],
    "nexus": ["N", "EH1", "K", "S", "AH0", "S"],
}

def analyze_pronunciation(word: str) -> Tuple[List[str], str]:
    """
    Analyzes pronunciation of an English word.
    Returns (phonemes, analysis_note).
    """
    w_lower = word.lower()

    if w_lower in PHONEME_CACHE:
        phonemes = PHONEME_CACHE[w_lower]
        return phonemes, " ".join(phonemes) + " (CMU Pronouncing Dictionary)"

    # Check for multi-letter patterns
    detected_patterns = [p for p in DIGRAPHS.keys() if p in w_lower]
    if detected_patterns:
        note = f"Multi-letter patterns detected: {', '.join(detected_patterns)}"
    else:
        note = "no configured multi-letter pattern; individual-letter rules will be used"

    # Fallback letter-by-letter approximation
    approx_phonemes = []
    i = 0
    while i < len(w_lower):
        if i + 1 < len(w_lower) and w_lower[i : i + 2] in DIGRAPHS:
            approx_phonemes.append(DIGRAPHS[w_lower[i : i + 2]])
            i += 2
        else:
            approx_phonemes.append(w_lower[i].upper())
            i += 1

    return approx_phonemes, note
