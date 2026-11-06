"""Cut the single ElevenLabs narration into one segment per block of the video.

Input: a word-level transcript of public/narration.mp3 as JSON, a list of {"w", "s", "e"}
(word, start and end in seconds). We made ours with faster-whisper (model base.en,
word_timestamps=True), run outside this project. Pauses alone were not enough: ElevenLabs
sometimes pauses longer inside a block than between two blocks.

The script reads the narration text from video/narration.md (the paragraph after each
**Narration** line), finds where each block's first three words are spoken, and writes
src/audio.json, which src/scenes.ts uses to time the video.

Usage, from video/remotion:  python3 -I scripts/align-narration.py words.json
"""

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MD = ROOT.parent / "narration.md"
OUT = ROOT / "src" / "audio.json"


SAME_SOUND = {"council": "counsel"}  # the transcript cannot tell these apart


def norm(word):
    w = re.sub(r"[^a-z0-9]", "", word.lower())
    return SAME_SOUND.get(w, w)


def main():
    words = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    paras = [p.strip() for p in re.findall(r"\*\*Narration\*\*\n(.+?)\n\n", MD.read_text(encoding="utf-8"), flags=re.S)]
    starts = []
    i = 0
    for p in paras:
        first = [norm(x) for x in p.split()[:3]]
        while i < len(words) - 2 and [norm(words[j]["w"]) for j in (i, i + 1, i + 2)] != first:
            i += 1
        if i >= len(words) - 2:
            raise SystemExit(f"could not find the start of: {p[:40]}")
        starts.append(i)
        i += 1
    segments = []
    for k, s in enumerate(starts):
        nxt = starts[k + 1] if k + 1 < len(starts) else None
        last = (nxt if nxt is not None else len(words)) - 1
        # Keep 0.3 s after the last word for its tail, but stop before the next block's voice.
        end = words[last]["e"] + 0.3
        if nxt is not None:
            end = min(end, words[nxt]["s"] - 0.15)
        segments.append({"from": round(max(0.0, words[s]["s"] - 0.1), 2), "to": round(end, 2)})
    OUT.write_text(json.dumps({"segments": segments}, indent=2) + "\n", encoding="utf-8")
    for k, seg in enumerate(segments, 1):
        print(f"block {k}: {seg['from']:7.2f} -> {seg['to']:7.2f}  ({seg['to'] - seg['from']:5.2f} s)")


main()
