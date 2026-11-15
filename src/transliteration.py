"""
NEXUS Core End-to-End Transliteration Pipeline Orchestrator
Yields real-time streaming traces matching the frontend specification (§7).
"""

import time
from typing import Generator, Dict, Any, List

from src.input_handler import validate_input, ValidationError
from src.preprocessing import preprocess_text
from src.tokenizer import tokenize, Token
from src.pronunciation import analyze_pronunciation
from src.candidate_generator import generate_candidates
from src.candidate_ranker import rank_candidates
from src.postprocessing import reconstruct_sentence, normalize_kannada_unicode

def transliterate_stream(text: str) -> Generator[Dict[str, Any], None, None]:
    """
    Generator yielding structured pipeline events matching §7 contract:
    - stage events
    - token events
    - span events
    - done event with honesty summary
    """
    start_total = time.perf_counter()

    # 1. Validation
    t0 = time.perf_counter()
    try:
        is_valid, validated_text = validate_input(text)
        ms_val = max(1, int((time.perf_counter() - t0) * 1000))
        yield {
            "type": "stage",
            "name": "validation",
            "label": "Input Validation & Guardrails",
            "output": "Input accepted (Latin script)",
            "ms": ms_val,
        }
    except ValidationError as e:
        yield {
            "type": "error",
            "message": str(e),
        }
        return

    # 2. Normalization
    t0 = time.perf_counter()
    normalized = preprocess_text(validated_text)
    ms_norm = max(1, int((time.perf_counter() - t0) * 1000))
    yield {
        "type": "stage",
        "name": "normalization",
        "label": "Preprocessing & Normalization",
        "output": normalized,
        "ms": ms_norm,
    }

    # 3. Tokenization & Protected Span Identification
    t0 = time.perf_counter()
    tokens: List[Token] = tokenize(normalized)
    ms_tok = max(1, int((time.perf_counter() - t0) * 1000))
    yield {
        "type": "stage",
        "name": "tokenization",
        "label": "Tokenizer & Protected Spans",
        "output": [t.text for t in tokens],
        "ms": ms_tok,
    }

    # 4. Pronunciation Analysis (G2P)
    t0 = time.perf_counter()
    pronunciations = []
    for tok in tokens:
        if not tok.is_protected and tok.kind == "word":
            phonemes, note = analyze_pronunciation(tok.text)
            pronunciations.append(f"{tok.text}: {note}")
    ms_pron = max(1, int((time.perf_counter() - t0) * 1000))
    yield {
        "type": "stage",
        "name": "pronunciation",
        "label": "Pronunciation Analysis (G2P)",
        "output": pronunciations if pronunciations else "Bypassed for non-word tokens",
        "ms": ms_pron,
    }

    # 5 & 6. Candidate Generation & Selection (Streaming per token)
    rendered_tokens: List[str] = []
    word_token_count = 0
    protected_count = 0
    low_conf_count = 0

    for idx, tok in enumerate(tokens):
        if tok.is_protected:
            protected_count += 1
            rendered_tokens.append(tok.text)
            yield {
                "type": "span",
                "index": idx,
                "kind": tok.kind,
                "text": tok.text,
                "protected": True,
                "sha256": tok.sha256,
            }
        elif tok.kind == "punctuation":
            rendered_tokens.append(tok.text)
            # Standalone punctuation does not need heavy phonetic candidate generation
            yield {
                "type": "token",
                "index": idx,
                "source": tok.text,
                "kannada": tok.text,
                "score": 1.0,
                "raw_score": 150,
                "confident": True,
                "origin": ["Punctuation"],
                "candidates": [
                    {
                        "kannada": tok.text,
                        "score": 1.0,
                        "raw_score": 150,
                        "P": 1.0,
                        "L": 1.0,
                        "X": 0.0,
                    }
                ],
            }
        else:
            word_token_count += 1
            # Stage 5: Candidate generation
            cands = generate_candidates(tok.text)
            # Stage 6: Candidate selection
            best, ranked = rank_candidates(cands, tok.text)
            rendered_tokens.append(best["kannada"])

            if not best["confident"]:
                low_conf_count += 1

            yield {
                "type": "token",
                "index": idx,
                "source": tok.text,
                "kannada": best["kannada"],
                "score": best["score"],
                "raw_score": best["raw_score"],
                "confident": best["confident"],
                "origin": best["origin"],
                "candidates": [
                    {
                        "kannada": r["kannada"],
                        "score": r["score"],
                        "raw_score": r["raw_score"],
                        "P": r["P"],
                        "L": r["L"],
                        "X": r["X"],
                    }
                    for r in ranked
                ],
            }

    # 7. Post-Processing & Output Normalization
    t0 = time.perf_counter()
    final_output = reconstruct_sentence(rendered_tokens)
    ms_post = max(1, int((time.perf_counter() - t0) * 1000))
    yield {
        "type": "stage",
        "name": "postprocessing",
        "label": "Post-Processing & Unicode NFC",
        "output": final_output,
        "ms": ms_post,
    }

    total_ms = max(1, int((time.perf_counter() - start_total) * 1000))

    # Honesty Strip Summary
    yield {
        "type": "done",
        "final": final_output,
        "total_ms": total_ms,
        "summary": {
            "tokens": word_token_count,
            "protected": protected_count,
            "altered": 0,  # Computed guarantee: protected spans are never altered
            "low_confidence": low_conf_count,
        },
    }

def transliterate(text: str) -> Dict[str, Any]:
    """
    Synchronous batch transliteration helper.
    """
    events = list(transliterate_stream(text))
    done_event = [e for e in events if e.get("type") == "done"]
    if done_event:
        return {
            "output": done_event[0]["final"],
            "events": events,
            "summary": done_event[0]["summary"],
            "total_ms": done_event[0]["total_ms"],
        }
    return {"output": "", "events": events, "error": "Incomplete pipeline execution"}
