"""
Stage 6: Candidate Ranking & Selection
- Implements weighted multi-factor scoring:
  Score(k | w, ctx) = α·P(k, w) + β·L(k, w) + γ·X(k, ctx)
- Selection & fallback threshold τ
"""

from typing import List, Dict, Any, Tuple

DEFAULT_ALPHA = 0.5
DEFAULT_BETA = 0.5
DEFAULT_GAMMA = 0.0
CONFIDENCE_THRESHOLD_TAU = 0.70

def score_candidate(
    candidate: Dict[str, Any],
    source_word: str,
    alpha: float = DEFAULT_ALPHA,
    beta: float = DEFAULT_BETA,
    gamma: float = DEFAULT_GAMMA,
) -> Dict[str, Any]:
    """
    Computes P, L, X scores and weighted score.
    """
    is_canonical = candidate.get("is_canonical", False)
    origins = candidate.get("origin", [])

    # Lexical score L(k, w)
    if "dictionary" in origins and is_canonical:
        L = 1.0
    elif "dictionary" in origins:
        L = 0.8
    else:
        L = 0.2

    # Phonetic score P(k, w)
    if is_canonical:
        P = 0.95
    elif "phonetic_rules" in origins:
        P = 0.85
    else:
        P = 0.60

    # Context score X(k, ctx)
    X = 0.0

    normalized_score = alpha * P + beta * L + gamma * X
    # Legacy raw score (e.g. 150 for hello -> ಹೆಲ್ಲೋ)
    raw_score = int(normalized_score * 150 / 0.975)

    return {
        "kannada": candidate["kannada"],
        "score": round(normalized_score, 3),
        "raw_score": raw_score,
        "P": round(P, 2),
        "L": round(L, 2),
        "X": round(X, 2),
        "origin": origins,
        "confident": normalized_score >= CONFIDENCE_THRESHOLD_TAU,
    }

def rank_candidates(
    candidates: List[Dict[str, Any]],
    source_word: str,
    alpha: float = DEFAULT_ALPHA,
    beta: float = DEFAULT_BETA,
    gamma: float = DEFAULT_GAMMA,
) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Ranks all candidates and returns (best_candidate, all_ranked_candidates).
    """
    if not candidates:
        fallback = {
            "kannada": source_word,
            "score": 0.0,
            "raw_score": 0,
            "P": 0.0,
            "L": 0.0,
            "X": 0.0,
            "origin": ["fallback"],
            "confident": False,
        }
        return fallback, [fallback]

    scored = [
        score_candidate(c, source_word, alpha, beta, gamma)
        for c in candidates
    ]
    # Sort descending by score
    ranked = sorted(scored, key=lambda x: x["score"], reverse=True)
    best = ranked[0]
    return best, ranked
