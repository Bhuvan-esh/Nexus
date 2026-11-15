# NEXUS Frontend: Features to Implement

> **Design System Source**: *Frontend Design Brief* ("Warm paper, living voice"), adapted for NEXUS.  
> **Product**: NEXUS English-to-Kannada Phonetic Transliteration System  
> **Under the Guidance of**: Dr. Girish L  

---

## 1. Product Framing for the UI

NEXUS is a chat-style transliteration app. The user types English, NEXUS replies with Kannada script, and the reply shows its working (the pipeline) the way an LLM shows its reasoning.

**The metaphor (from the brief):** paper is not a background, it is the idea. The brief's promise was *"the document arrives, gets translated, comes back unchanged"*. The NEXUS equivalent:

> **"Sounds arrive, get written in Kannada, and anything that shouldn't change comes back untouched."**

That second half is the moat: protected spans (URLs, emails, code) are visibly preserved byte-for-byte, and uncertain words are visibly flagged instead of silently guessed.

**Scope line shown in the UI:** *NEXUS transliterates, it does not translate.* "Hello" becomes ಹೆಲ್ಲೋ, never ನಮಸ್ಕಾರ.

---

## 2. Design Tokens

Defined as tokens (Figma variables, NativeWind config). No raw hex values in components.

### 2.1 Colour: Six Colours, Three Rules

| Token | Hex | Role | Meaning |
| :--- | :--- | :--- | :--- |
| `paper` | `#F5F1EA` | Page, app canvas | Background only (60%) |
| `card` | `#FBF9F5` | Replies, sections, sheets | Raised content (30%) |
| `code` | `#EFEBE2` | Protected spans, mono content | "Sacred content", never altered |
| `ink` | `#1C1A17` | All text | Never pure black |
| `accent` | `#C8553D` | Primary action + active state **only** | The orb, Send, current stage (~10%) |
| `link` | `#2F6FEB` | Source citations **only** | "Where this came from" pills |
| `protected` | `#3F7D5C` | Verified, byte-exact, safe | Preserved spans, resolved state |
| `attention` | `#B4761F` | Uncertain token, fail-closed | Low confidence, OOV, fallback |

* **Rule 1 (60 / 30 / 10):** paper ≈ 60%, ink and cards ≈ 30%, accent ≈ 10% of any screen (one action, one active state).
* **Rule 2:** never pure black on paper.
* **Rule 3:** a colour carries one meaning, always. Never use accent for decoration.
* **Never rely on colour alone.** Pair every colour with a glyph or label (lock for protected, triangle for attention, check for resolved).

### 2.2 Typography: Four Faces, One Fixed Scale

| Face | Role | Weight | Notes |
| :--- | :--- | :--- | :--- |
| **Newsreader** (serif) | Display + section titles | 500 | Screen title and Kannada first line |
| **Geist** | Body + UI | 400 / 600 | General interface copy |
| **JetBrains Mono** | Code, protected spans, hashes, scores | 400 | Monospace data and hash integrity |
| **Noto Sans Kannada** | Kannada output (script parity) | 400 | Ample line-height for conjuncts |

| Role | Size | Weight | Notes |
| :--- | :---: | :--- | :--- |
| Display | 28 / 34 | Serif 500 | Screen title and first Kannada line |
| Section | 17 | Serif 500 | One per card, tight leading, -1% tracking |
| Body | 15–16 | Sans 400 | Line-height 1.6, measure capped at ~64ch |
| Label | 11 | Sans 600 | Uppercase, +8–13% tracking, ink at 60% |
| Code | 13 | Mono 400 | Always on the `code` surface, never inline in body copy |

### 2.3 Surface and Shape: Paper, Not Plastic

* **Border**: `1px` at 8% ink (`rgba(28, 26, 23, 0.08)`).
* **Shadow**: One soft shadow only: `0 8px 24px rgba(28, 26, 23, 0.06)`.
* **Radius**: **14** cards, **10** inputs, **999** pills. Nothing else.
* **Grain**: A 2–3% opacity procedural grain texture over the page background.
* **Icons**: **Lucide**, one stroke width throughout.

### 2.4 Motion System

* **Physics**: Spring, `damping 20 / stiffness 120`.
* **Timing**: Micro-interactions 150–250 ms. Entrances ≤ 400 ms, 30–50 ms stagger, 6–8 px rise.
* **Reduced Motion**: Keep opacity changes and highlight, drop movement.

---

## 3. Tech Stack

| Layer | Choice | Why |
| :--- | :--- | :--- |
| **App** | React Native + Expo | Fastest route to polish, real Android testing & web |
| **Styling** | NativeWind / Tailwind | Strict token discipline |
| **Animation** | Reanimated / React Native Animated | Orb state machine & particle physics |
| **Icons** | Lucide | Single stroke width consistency |
| **Backend** | FastAPI wrapping `src/transliteration.py` | Streaming pipeline stages via WebSockets / REST |
| **Transport** | WebSocket (`/ws/transliterate`) | Low latency real-time streaming |

---

## 4. The Signature Element: The NEXUS Orb

One control, four states, never replaced. Doubles as the **Send** button with a **72 pt** tap target.

| State | Trigger | Visual Behavior |
| :--- | :--- | :--- |
| **Idle** | Empty composer | Slow breathing, 4 s cycle, off-white core sphere |
| **Typing** | User typing | `accent` ring with ripple rhythm driven by typing cadence |
| **Thinking** | Pipeline running | Particle orbit (never a spinner): **Seven particles, one per pipeline stage; each lights up as its stage completes.** |
| **Resolved** | Output complete | `protected` green pulse once, success feedback, settles to idle |

---

## 5. Three Core Screens / Flows

1. **Ask**: Composer, 72pt Orb, starter chips, scope guardrail box.
2. **Answer**: Streamed reply with interlinear view, protected spans, amber flags, and the honesty strip.
3. **Proof**: Bottom sheet pipeline trace with 7 stages, intermediate phonemes, and SHA-256 match.

---

## 6. Detailed Feature Checklist

### P0: Core Path (Ask → Answer → Proof)
* **F1. Chat Thread & Composer**: Enter sends, Shift+Enter newline; inline validation alerts (Latin check, length limit).
* **F2. Streamed Reply**: Kannada resolves token by token with 40ms stagger.
* **F3. Interlinear "Resolve-Along" View**: English source directly above Kannada script, aligned per token with synchronized resolve glow.
* **F4. Protected-Span Badge**: URLs, emails, and code snippets render in JetBrains Mono on `#EFEBE2` card with lock glyph and byte-exact verification.
* **F5. Fail-Closed Amber Flags**: Tokens scoring below threshold $\tau$ get an `attention` amber underline, triangle glyph, and "Low confidence" label.
* **F6. Pipeline Sheet (Proof Screen)**: 7 rows corresponding to the CLI trace (Validation, Normalization, Tokenization, G2P, Candidate Gen, Candidate Selection, Post-processing) with segmented progress bar.
* **F7. Token Inspector**: Detailed breakdown with candidate list, $P, L, X$ scores, and source pills (`link` blue).
* **F8. Answer Honesty Strip**: Quiet mono metrics line under every reply: `X tokens · Y protected · 0 altered · Z low conf · T ms`.
* **F9. Preservation Check**: SHA-256 hash match between input span and output span verified inside the proof sheet.
* **F10. Starter Chips**: 6 illustrative matrix chips (`Hello`, `Good morning`, `Machine learning`, `Bangalore`, `Bhuvanesh`, `https://example.com`).

### P1: Polish
* **F11. Morphing Glyph Mark**: Brand mark animated $A \rightarrow \text{ಕ}$ in ~300ms.
* **F12. Message Actions**: Copy Kannada text, regenerate.
* **F13. Pre-Seeded Golden Paths**: Instant offline demo with "Offline · cached" chip.
* **F14. Conversation History**: Local thread management.
* **F15. Accessible Error States**: Custom paper cards with retry actions.

---

## 7. Backend Streaming Contract (§7)

```json
// Streamed events (one JSON object per event)
{ "type": "stage", "name": "tokenization", "output": ["hello"], "ms": 1 }
{ "type": "token", "index": 0, "source": "hello", "kannada": "ಹೆಲ್ಲೋ",
  "score": 0.975, "raw_score": 150, "confident": true, "origin": ["dictionary", "phonetic_rules"],
  "candidates": [ { "kannada": "ಹೆಲ್ಲೋ", "score": 0.975, "raw_score": 150, "P": 0.95, "L": 1.0, "X": 0.0 } ] }
{ "type": "span", "index": 1, "kind": "url", "text": "https://example.com", "protected": true, "sha256": "..." }
{ "type": "done", "final": "ಹೆಲ್ಲೋ", "total_ms": 38,
  "summary": { "tokens": 1, "protected": 0, "altered": 0, "low_confidence": 0 } }
```
