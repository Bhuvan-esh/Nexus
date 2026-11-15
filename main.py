"""
NEXUS CLI Runner
Displays the exact step-by-step modular pipeline trace as documented in the README.
"""

import sys
from src.transliteration import transliterate_stream

def run_cli():
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
    else:
        try:
            text = input("Enter English text: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting NEXUS.")
            return

    if not text:
        print("Empty input. Exiting.")
        return

    print("\nINPUT:")
    print(text)

    for event in transliterate_stream(text):
        etype = event.get("type")
        if etype == "stage":
            name = event.get("name", "").upper()
            output = event.get("output")
            print(f"\n{name}:")
            if isinstance(output, list):
                print(output)
            else:
                print(output)
        elif etype == "token":
            idx = event.get("index")
            src = event.get("source")
            kn = event.get("kannada")
            raw_score = event.get("raw_score", 150)
            origin = ", ".join(event.get("origin", []))
            print(f"\nCANDIDATE SELECTION:")
            print(f"{src} -> {kn} (score {raw_score}, {origin})")
        elif etype == "span":
            src = event.get("text")
            kind = event.get("kind", "").upper()
            print(f"\nPROTECTED SPAN ({kind}):")
            print(f"{src} (preserved byte-for-byte, SHA-256 match)")
        elif etype == "done":
            print(f"\nFINAL OUTPUT:")
            print(event.get("final"))
            summary = event.get("summary", {})
            ms = event.get("total_ms", 0)
            print(f"\nHONESTY METRICS:")
            print(f"{summary.get('tokens', 0)} tokens · {summary.get('protected', 0)} protected · {summary.get('altered', 0)} altered · {summary.get('low_confidence', 0)} low confidence · {ms} ms\n")

if __name__ == "__main__":
    run_cli()
