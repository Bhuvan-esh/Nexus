# NEXUS Frontend Design Specification
**"Warm Paper, Living Voice" — Adapted for English-to-Kannada Phonetic Transliteration**

---

**Project**: NEXUS: English-to-Kannada Transliteration System  
**Academic Governance**: Under the Guidance of Dr. Girish L  
**Authors**: J Bhuvanesh, S.Md.Naqeeb, Nitin S  
**Department**: AI & ML, AI & DS  
**Document Version**: 1.0 (Design Specification)  
**Date**: November 2026  

---

## Executive Summary

NEXUS is an NLP-driven English-to-Kannada phonetic transliteration application. Unlike generic translation applications, NEXUS operates under a strict linguistic guardrail:

> **"Sounds arrive, get written in Kannada script, and sacred content returns untouched."**

The interface is built upon the **"Warm paper, living voice"** design metaphor:
* **Paper as an Idea, Not a Background**: A tactile `#F5F1EA` paper canvas layered with subtle grain texture replaces standard sterile light themes.
* **The Living Voice (The NEXUS Orb)**: A singular, 72pt organic control doubling as the Send button and dynamic pipeline state machine with 7 orbiting stage particles.
* **Radical Transparency**: Real-time interlinear "resolve-along" rendering, byte-for-byte protected span badges with SHA-256 integrity proofs, fail-closed amber uncertainty flags, and an execution honesty strip.

---

## 1. Product Scope & Guardrails in the UI

1. **Phonetic Transliteration vs. Semantic Translation**:
   * **In Scope**: `"Hello"` $\rightarrow$ `"ಹೆಲ್ಲೋ"`, `"Computer"` $\rightarrow$ `"ಕಂಪ್ಯೂಟರ್"`, `"Good morning"` $\rightarrow$ `"ಗುಡ್ ಮಾರ್ನಿಂಗ್"`.
   * **Strictly Out of Scope**: `"Hello"` $\rightarrow$ `"ನಮಸ್ಕಾರ"` *(semantic translation)*.
2. **Sacred Content Preservation**:
   * URLs (`https://example.com`), emails (`contact@nexus.org`), and code identifiers (`variable_name()`) bypass transliteration and return verified byte-for-byte.
3. **No Silent Guessing**:
   * Tokens with confidence score below threshold $\tau = 0.70$ are visibly flagged with an amber underline and warning glyph.

---

## 2. Design Tokens & Styling Architecture

Components strictly consume design tokens. No arbitrary hex codes or random radii are permitted.

### 2.1 Color Palette & Semantic Roles (60 / 30 / 10 Rule)

| Token | Hex Value | Semantic Role | Ratio | Behavioral Rule |
| :--- | :--- | :--- | :--- | :--- |
| `paper` | `#F5F1EA` | Page background & app canvas | ~60% | Never used for cards or foreground |
| `card` | `#FBF9F5` | Replies, inspector sheets, sections | ~30% | Raised surface with soft shadow |
| `code` | `#EFEBE2` | Protected spans & monospace copy | — | Denotes preserved, unaltered content |
| `ink` | `#1C1A17` | Text copy & primary glyphs | — | Never pure `#000000` |
| `accent` | `#C8553D` | Primary action & active state only | ~10% | Reserved for the Orb, Send, and active stage |
| `link` | `#2F6FEB` | Lexicon & citation source pills | — | Identifies dictionary/rule origin |
| `protected` | `#3F7D5C` | Verified byte-exact safe state | — | Preserved span badges & verified hashes |
| `attention` | `#B4761F` | Fail-closed amber warning | — | Low confidence tokens ($\text{Score} < \tau$) |

### 2.2 Strict Radii & Elevation

* **Card Radius**: `14px` (`border-radius: 14px`)
* **Input Radius**: `10px` (`border-radius: 10px`)
* **Pill Radius**: `999px` (`border-radius: 999px`)
* **Borders**: `1px` at 8% ink opacity (`rgba(28, 26, 23, 0.08)`)
* **Soft Shadow**: `0 8px 24px rgba(28, 26, 23, 0.06)`

### 2.3 Typography System

| Typeface | Functional Role | Weight | Metrics & Notes |
| :--- | :--- | :--- | :--- |
| **Newsreader** | Display Titles & Kannada First Line | 500 Medium | Serif; editorial presence |
| **Geist** / **Inter** | UI Labels, Body & Explanations | 400 / 600 | 15–16px body, 1.6 line height |
| **JetBrains Mono** | Code, Hashes, Phonemes, Scores | 400 Regular | 13px mono on `code` surface |
| **Noto Sans Kannada**| Target Kannada Script | 400 Regular | Ample line-height (1.7×) for conjuncts |

---

## 3. Signature Interface Elements

### 3.1 The NEXUS Orb
The primary interactive centerpiece. It acts as both a living indicator and the 72pt primary Send trigger:
1. **Idle**: 4-second slow harmonic breathing cycle on an off-white core sphere.
2. **Typing**: Dynamic `accent` terracotta ring with ripple rhythm driven by typing cadence.
3. **Thinking**: 7 orbiting particles rotating around the sphere, each lighting up sequentially as its corresponding pipeline stage confirms.
4. **Resolved**: A single pulse of `protected` emerald green settling back to idle.

### 3.2 Interlinear "Resolve-Along" View
Direct counterpart to voice read-along:
* English source tokens appear directly above their corresponding Kannada tokens.
* Words glow in synchronization with the pipeline resolver.
* Low-confidence tokens display an `attention` amber underline, warning triangle, and "LOW CONF" tag.

### 3.3 Protected-Span Integrity Badge
* URLs, email addresses, and inline code blocks are isolated into a dedicated JetBrains Mono badge.
* Includes a lock icon (`🔒`), a `PRESERVED` label, and client-verified SHA-256 hash match (`✓`).
* Tapping reveals a modal confirming that the text was returned byte-for-byte without altering a single character.

### 3.4 Pipeline Proof Sheet (The Proof Screen)
An interactive bottom sheet rising from any completed message showing the full 7-stage CLI trace:
1. **Input Validation**: Latin alphabet verification and boundary checks.
2. **Preprocessing**: Whitespace normalization and casing preservation.
3. **Tokenization**: Segmentation into words and protected entities.
4. **Pronunciation Analysis (G2P)**: CMU dictionary lookup and digraph pattern isolation.
5. **Candidate Generation**: Synthesis of candidates from Lexicon $D(w)$ and Rules $R(w)$.
6. **Candidate Selection**: Multi-factor scoring $\text{Score} = \alpha P + \beta L + \gamma X$.
7. **Post-Processing**: Unicode NFC normalization and punctuation reconstruction.

### 3.5 Token Inspector
Tapping any individual Kannada token launches the Token Inspector:
* Candidate ranking list with normalized score percentage and legacy raw score.
* Detailed factor breakdown:
  * **$P(k, w)$**: Phonetic correspondence score.
  * **$L(k, w)$**: Lexical evidence score.
  * **$X(k, \text{ctx})$**: Contextual fit score.
* Source attribution pills: "Dictionary", "Phonetic rules".

### 3.6 Answer Honesty Strip
A quiet monospace status line below every reply:
$$\text{7 tokens · 1 protected · 0 altered · 0 low conf · 38 ms}$$
The "0 altered" metric is mathematically verified against the SHA-256 digest of protected inputs.

---

## 4. Technical Architecture & Streaming Protocol

### 4.1 Client-Server Communication
* **Transport**: Full-duplex WebSocket (`/ws/transliterate`) or REST fallback (`/api/transliterate`).
* **Format**: Structured JSON event stream enabling real-time UI stage progression.

```json
{ "type": "stage", "name": "tokenization", "output": ["hello"], "ms": 1 }
{ "type": "token", "index": 0, "source": "hello", "kannada": "ಹೆಲ್ಲೋ",
  "score": 0.975, "raw_score": 150, "confident": true, 
  "origin": ["dictionary", "phonetic_rules"],
  "candidates": [ { "kannada": "ಹೆಲ್ಲೋ", "score": 0.975, "raw_score": 150, "P": 0.95, "L": 1.0, "X": 0.0 } ] }
{ "type": "span", "index": 1, "kind": "url", "text": "https://example.com", "protected": true, "sha256": "100680ad54..." }
{ "type": "done", "final": "ಹೆಲ್ಲೋ", "total_ms": 38,
  "summary": { "tokens": 1, "protected": 0, "altered": 0, "low_confidence": 0 } }
```

### 4.2 Offline Demonstration Resilience
To guarantee an instantaneous, zero-spinner demonstration during evaluations, NEXUS includes pre-seeded golden paths (`Hello`, `The school is open.`, `Check out https://example.com for more info.`) that display an explicit `Offline · cached` badge when served from local cache.

---

## 5. Verification & Acceptance Checklist

* [x] **Strict 60 / 30 / 10 color application** with zero unmapped hex colors in components.
* [x] **Four-state animated Orb** with 72pt touch target and 7 stage particles.
* [x] **Real-time interlinear alignment** for phrases, sentences, and punctuation.
* [x] **Protected span preservation** with SHA-256 match confirmation.
* [x] **Fail-closed amber flags** when candidate score falls below $\tau = 0.70$.
* [x] **7-Stage Pipeline Proof Sheet** reflecting the terminal CLI execution trace.
* [x] **Full keyboard accessibility** (Enter to send, Shift+Enter for newline) and screen-reader state announcements.
