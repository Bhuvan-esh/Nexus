"""
Stage 3: Tokenization / Segmentation & Protected Span Identifier
- Identifies sacred protected spans (URLs, emails, code blocks)
- Breaks text into words, punctuation, and protected entities
- Computes SHA-256 hashes to guarantee byte-exact preservation
"""

import hashlib
import re
from dataclasses import dataclass
from typing import List, Optional

URL_PATTERN = re.compile(r"https?://[^\s]+|www\.[^\s]+")
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
CODE_PATTERN = re.compile(r"`[^`]+`|\b[a-zA-Z0-9_]+\(\)|\b[a-zA-Z0-9_]+::[a-zA-Z0-9_]+\b")

@dataclass
class Token:
    index: int
    text: str
    is_protected: bool = False
    kind: str = "word"  # "word", "url", "email", "code", "punctuation"
    sha256: Optional[str] = None

def compute_sha256(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def tokenize(text: str) -> List[Token]:
    """
    Tokenizes input text into a sequence of Tokens, tagging protected spans.
    """
    # Regex matching URLs, emails, code, words, or standalone punctuation
    token_regex = re.compile(
        r"(https?://[^\s]+|www\.[^\s]+)"  # URL
        r"|([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)"  # Email
        r"|(`[^`]+`)"  # inline code
        r"|([a-zA-Z]+(?:'[a-zA-Z]+)?)"  # words (including contractions like don't)
        r"|(\d+)"  # numbers
        r"|([^\s\w])"  # punctuation
    )

    tokens: List[Token] = []
    idx = 0

    for match in token_regex.finditer(text):
        val = match.group(0)
        if URL_PATTERN.match(val):
            tokens.append(
                Token(
                    index=idx,
                    text=val,
                    is_protected=True,
                    kind="url",
                    sha256=compute_sha256(val),
                )
            )
        elif EMAIL_PATTERN.match(val):
            tokens.append(
                Token(
                    index=idx,
                    text=val,
                    is_protected=True,
                    kind="email",
                    sha256=compute_sha256(val),
                )
            )
        elif val.startswith("`") and val.endswith("`"):
            tokens.append(
                Token(
                    index=idx,
                    text=val,
                    is_protected=True,
                    kind="code",
                    sha256=compute_sha256(val),
                )
            )
        elif re.match(r"^[^\s\w]$", val):
            tokens.append(Token(index=idx, text=val, is_protected=False, kind="punctuation"))
        else:
            tokens.append(Token(index=idx, text=val, is_protected=False, kind="word"))
        idx += 1

    return tokens
