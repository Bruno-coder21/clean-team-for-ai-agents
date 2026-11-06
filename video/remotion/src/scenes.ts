// Timeline of the demo video. Seconds at 30 fps. Clips are 1440x900 screen recordings in public/clips.
export const FPS = 30;
export const SRC_W = 1440;
export const SRC_H = 900;

// A region of the source recording, in source pixels, to move the camera onto.
export type Focus = { x: number; y: number; w: number; h: number; from: number; to?: number; clamp?: boolean; spot?: boolean };

export type Scene =
  | { kind: "title"; seconds: number; title: string; subtitle: string }
  | { kind: "fines"; seconds: number }
  | { kind: "diagram"; seconds: number }
  | {
      kind: "clip";
      seconds: number;
      file: string; // file name inside public/clips
      startAt?: number; // seconds into the recording where this scene starts
      playbackRate?: number;
      focus?: Focus; // camera move, times in seconds inside the scene
      badge?: { text: string; at: number }; // label shown over the clip from `at` seconds
    }
  | { kind: "tools"; seconds: number }
  | { kind: "gaps"; seconds: number }
  | { kind: "end"; seconds: number };

export type Block = { caption: string; scenes: Scene[] };

export const BLOCKS: Block[] = [
  {
    caption: "Clean teams keep a competitor's raw data away from the buyer.",
    scenes: [
      { kind: "title", seconds: 5, title: "Clean Team for AI Agents", subtitle: "A hijacked agent can't leak what its room can't reach." },
      { kind: "fines", seconds: 15.6 },
    ],
  },
  {
    caption: "Two rooms. Two owners. One human crossing.",
    scenes: [{ kind: "diagram", seconds: 17 }],
  },
  {
    caption: "No release, no answer. Fewer than 3 customers stays inside.",
    scenes: [
      // Clip 1: the executive asks the assistant, which refuses.
      { kind: "clip", seconds: 4.5, file: "clip1.mov", startAt: 1, playbackRate: 3.33 },
      { kind: "clip", seconds: 6, file: "clip1.mov", startAt: 16, focus: { x: 280, y: 380, w: 760, h: 400, from: 0.2 } },
      // Clip 2 and 2b: the executive tries the analyst; Switch says it isn't in the room.
      { kind: "clip", seconds: 3.5, file: "clip2.mov", startAt: 3, playbackRate: 2.57 },
      { kind: "clip", seconds: 5, file: "clip2b.mov", startAt: 3, focus: { x: 880, y: 440, w: 560, h: 340, from: 1.2 } },
      // Clip 3: counsel asks the analyst; its answer with the blocked figures.
      { kind: "clip", seconds: 7, file: "clip3.mov", startAt: 3, playbackRate: 3.43 },
      { kind: "clip", seconds: 18.7, file: "clip3.mov", startAt: 27, playbackRate: 0.535, focus: { x: 1025, y: 100, w: 415, h: 660, from: 0.2 } },
    ],
  },
  {
    caption: "The only crossing is a person.",
    scenes: [
      // Clip 4: counsel approves; the analyst posts RELEASABLE MEMO #2.
      { kind: "clip", seconds: 6, file: "clip4.mov", startAt: 1, playbackRate: 2, focus: { x: 300, y: 470, w: 1000, h: 300, from: 3.5 } },
      // Clip 5: counsel pastes RELEASED MEMO #2 into the deal room.
      { kind: "clip", seconds: 4.5, file: "clip5.mov", startAt: 1, playbackRate: 2.67, focus: { x: 300, y: 560, w: 1000, h: 220, from: 2 } },
      // Clip 6: the executive asks again; the assistant answers from the memo.
      { kind: "clip", seconds: 2.2, file: "clip6.mov", startAt: 2, playbackRate: 2.73 },
      { kind: "clip", seconds: 5, file: "clip6.mov", startAt: 29, playbackRate: 0.9, focus: { x: 280, y: 420, w: 760, h: 360, from: 0.2 } },
    ],
  },
  {
    caption: "Hidden instruction flagged, not followed. Every attempt refused by the server.",
    scenes: [
      // Clip 7: the Blue Harbor summary flags the hidden instruction.
      { kind: "clip", seconds: 4.5, file: "clip7.mov", startAt: 1, playbackRate: 2.44 },
      { kind: "clip", seconds: 5.5, file: "clip7.mov", startAt: 15.5, focus: { x: 1030, y: 100, w: 410, h: 660, from: 0.2 } },
      { kind: "clip", seconds: 9.5, file: "clip7.mov", startAt: 16, playbackRate: 0.42, focus: { x: 1030, y: 480, w: 410, h: 330, from: 0 } },
      // Clip 8: the wall test from the Mac terminal.
      { kind: "clip", seconds: 12.9, file: "clip8.mov", startAt: 1.5, playbackRate: 0.736, focus: { x: 0, y: 0, w: 1240, h: 160, from: 5.8, clamp: false, spot: false }, badge: { text: "6 of 6 attempts refused by the server", at: 6.4 } },
    ],
  },
  {
    caption: "We tested the default setup, and we tell you where it leaks.",
    scenes: [
      // Clip 9: agents with two owners, then the analyst's addressing policy.
      { kind: "clip", seconds: 3.5, file: "clip9.mov", startAt: 0, focus: { x: 110, y: 190, w: 1300, h: 220, from: 0.5 } },
      { kind: "clip", seconds: 4.8, file: "clip9.mov", startAt: 9, playbackRate: 1.46, focus: { x: 100, y: 210, w: 900, h: 430, from: 0.3 } },
      { kind: "tools", seconds: 3.8 },
      { kind: "gaps", seconds: 13 },
    ],
  },
  {
    caption: "Switch enforces membership and who gives orders. We configure the rest.",
    scenes: [{ kind: "end", seconds: 17.5 }],
  },
];

export const blockSeconds = (b: Block) => b.scenes.reduce((t, sc) => t + sc.seconds, 0);

// Narration: one ElevenLabs file, cut into one segment per block (see scripts/align-narration.py).
export type Segment = { from: number; to: number };
export const LEAD_IN = 0.4; // seconds of picture before each block's voice starts
const TAIL = 0.6; // seconds of picture after each block's voice ends

// Stretches a block when its voice is longer than its picture. Clips keep the same span of the
// recording and play slower; focus and badge times stretch with them.
const stretch = (b: Block, k: number): Block => ({
  ...b,
  scenes: b.scenes.map((sc) => {
    if (k === 1) return sc;
    if (sc.kind !== "clip") return { ...sc, seconds: sc.seconds * k };
    return {
      ...sc,
      seconds: sc.seconds * k,
      playbackRate: (sc.playbackRate ?? 1) / k,
      focus: sc.focus ? { ...sc.focus, from: sc.focus.from * k, to: sc.focus.to === undefined ? undefined : sc.focus.to * k } : undefined,
      badge: sc.badge ? { ...sc.badge, at: sc.badge.at * k } : undefined,
    };
  }),
});

export const timeline = (segments: Segment[] | null): Block[] =>
  BLOCKS.map((b, i) => {
    const seg = segments?.[i];
    if (!seg) return b;
    const need = LEAD_IN + (seg.to - seg.from) + TAIL;
    const have = blockSeconds(b);
    return need > have ? stretch(b, need / have) : b;
  });

export const totalSecondsFor = (segments: Segment[] | null) => timeline(segments).reduce((s, b) => s + blockSeconds(b), 0);
