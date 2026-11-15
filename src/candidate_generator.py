"""
Stage 5: Candidate Generator
- Hybrid architecture pairing curated lexicon dictionary D(w) with phonetic rule engine R(w)
- C(w) = D(w) ∪ R(w)
"""

from typing import List, Dict, Any

# Curated High-Precision Dictionary D(w)
CURATED_LEXICON: Dict[str, List[Dict[str, Any]]] = {
    "hello": [
        {"kannada": "ಹೆಲ್ಲೋ", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
        {"kannada": "ಹಲೋ", "origin": ["phonetic_rules"], "is_canonical": False},
        {"kannada": "ಹೆಲೋ", "origin": ["phonetic_rules"], "is_canonical": False},
    ],
    "the": [
        {"kannada": "ದ", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
        {"kannada": "ದಿ", "origin": ["phonetic_rules"], "is_canonical": False},
    ],
    "school": [
        {"kannada": "ಸ್ಕೂಲ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
    ],
    "is": [
        {"kannada": "ಈಸ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
        {"kannada": "ಇಸ್", "origin": ["phonetic_rules"], "is_canonical": False},
    ],
    "open": [
        {"kannada": "ಓಪನ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
    ],
    "good": [
        {"kannada": "ಗುಡ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
    ],
    "morning": [
        {"kannada": "ಮಾರ್ನಿಂಗ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
    ],
    "machine": [
        {"kannada": "ಮಷೀನ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
        {"kannada": "ಮೆಷಿನ್", "origin": ["phonetic_rules"], "is_canonical": False},
    ],
    "learning": [
        {"kannada": "ಲರ್ನಿಂಗ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
    ],
    "computer": [
        {"kannada": "ಕಂಪ್ಯೂಟರ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
    ],
    "bangalore": [
        {"kannada": "ಬ್ಯಾಂಗಲೋರ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
    ],
    "bhuvanesh": [
        {"kannada": "ಭುವನೇಶ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
    ],
    "nexus": [
        {"kannada": "ನೆಕ್ಸಸ್", "origin": ["dictionary", "phonetic_rules"], "is_canonical": True},
    ],
}

# Rule-based phoneme-to-Kannada mapping table for synthesis
PHONEME_TO_KANNADA = {
    "k": "ಕ್", "g": "ಗ್", "c": "ಕ್", "j": "ಜ್", "t": "ಟ್", "d": "ಡ್",
    "p": "ಪ್", "b": "ಬ್", "m": "ಮ್", "n": "ನ್", "r": "ರ್", "l": "ಲ್",
    "s": "ಸ್", "v": "ವ್", "w": "ವ್", "h": "ಹ್", "y": "ಯ್", "f": "ಫ್",
    "sh": "ಶ್", "ch": "ಚ್", "th": "ತ್", "ph": "ಫ್",
}

VOWEL_SIGNS = {
    "a": "ಾ", "e": "ೆ", "ee": "ೀ", "i": "ಿ", "o": "ೊ", "oo": "ೂ", "u": "ು", "ai": "ೈ",
}

INITIAL_VOWELS = {
    "a": "ಅ", "e": "ಎ", "i": "ಇ", "o": "ಒ", "u": "ಉ", "ee": "ಈ", "oo": "ಊ",
}

def synthesize_phonetic_rule(word: str) -> str:
    """
    Fallback rule-based Kannada synthesis for OOV tokens.
    """
    w = word.lower()
    res = []
    i = 0
    while i < len(w):
        # 2-letter digraphs
        if i + 1 < len(w) and w[i:i+2] in PHONEME_TO_KANNADA:
            base = PHONEME_TO_KANNADA[w[i:i+2]][:-1]  # remove virama if followed by vowel
            i += 2
            if i < len(w) and w[i] in VOWEL_SIGNS:
                res.append(base + VOWEL_SIGNS[w[i]])
                i += 1
            else:
                res.append(base + "್")
        elif w[i] in INITIAL_VOWELS and i == 0:
            res.append(INITIAL_VOWELS[w[i]])
            i += 1
        elif w[i] in PHONEME_TO_KANNADA:
            base = PHONEME_TO_KANNADA[w[i]][:-1]
            i += 1
            if i < len(w) and w[i] in VOWEL_SIGNS:
                res.append(base + VOWEL_SIGNS[w[i]])
                i += 1
            else:
                res.append(base + "್")
        else:
            i += 1
    return "".join(res) if res else word

def generate_candidates(word: str) -> List[Dict[str, Any]]:
    """
    Generates candidates from Curated Lexicon D(w) and Phonetic Rules R(w).
    """
    w_lower = word.lower()
    candidates: List[Dict[str, Any]] = []

    # Dictionary lookup D(w)
    if w_lower in CURATED_LEXICON:
        for entry in CURATED_LEXICON[w_lower]:
            candidates.append(entry)

    # Phonetic rule candidate R(w)
    rule_cand = synthesize_phonetic_rule(w_lower)
    if not any(c["kannada"] == rule_cand for c in candidates):
        candidates.append({
            "kannada": rule_cand,
            "origin": ["phonetic_rules"],
            "is_canonical": False,
        })

    return candidates
