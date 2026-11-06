import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FPS, LEAD_IN, Scene, Segment, SRC_H, SRC_W, timeline } from "./scenes";
import audio from "./audio.json";

const C = {
  bg: "#0d1117",
  panel: "#161b22",
  line: "#30363d",
  text: "#e6edf3",
  dim: "#8b949e",
  clean: "#2f81f7",
  deal: "#d29922",
  ok: "#3fb950",
  bad: "#f85149",
};
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

const FadeIn: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [delay, delay + 12], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: o, transform: `translateY(${y}px)` }}>{children}</div>;
};

const Title: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <AbsoluteFill style={{ background: C.bg, justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
    <FadeIn>
      <div style={{ color: C.text, fontSize: 92, fontWeight: 800, letterSpacing: -2 }}>{title}</div>
    </FadeIn>
    <FadeIn delay={18}>
      <div style={{ color: C.dim, fontSize: 40, marginTop: 24, textAlign: "center" }}>{subtitle}</div>
    </FadeIn>
  </AbsoluteFill>
);

const FINES = [
  { where: "EU", amount: "€124.5M", what: "Altice: gun-jumping; got the target's sensitive data early" },
  { where: "US", amount: "$5.68M", what: "FTC: target's contracts and prices shared before closing" },
  { where: "UK", amount: "£100M+", what: "CMA: bank traders sharing sensitive information in chats" },
];

const Fines: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, padding: 120, justifyContent: "center" }}>
    <FadeIn>
      <div style={{ color: C.text, fontSize: 56, fontWeight: 700 }}>Regulators fine competitors for sharing sensitive data.</div>
    </FadeIn>
    <div style={{ display: "flex", gap: 40, marginTop: 70 }}>
      {FINES.map((f, i) => (
        <FadeIn key={f.where} delay={20 + i * 15}>
          <div style={{ background: C.panel, border: `2px solid ${C.line}`, borderRadius: 20, padding: 40, width: 480 }}>
            <div style={{ color: C.dim, fontSize: 30 }}>{f.where}</div>
            <div style={{ color: C.bad, fontSize: 80, fontWeight: 800 }}>{f.amount}</div>
            <div style={{ color: C.text, fontSize: 28, marginTop: 10 }}>{f.what}</div>
          </div>
        </FadeIn>
      ))}
    </div>
    <FadeIn delay={350}>
      <div style={{ color: C.text, fontSize: 44, marginTop: 70 }}>
        Now AI agents are joining deal teams. <span style={{ color: C.dim }}>All companies in this demo are fictional.</span>
      </div>
    </FadeIn>
  </AbsoluteFill>
);

const Room: React.FC<{ name: string; color: string; lines: string[]; x: number }> = ({ name, color, lines, x }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 230,
      width: 640,
      height: 560,
      border: `4px solid ${color}`,
      borderRadius: 28,
      background: C.panel,
      padding: 36,
      boxSizing: "border-box",
    }}
  >
    <div style={{ color, fontSize: 48, fontWeight: 800 }}>{name}</div>
    <div style={{ color: C.dim, fontSize: 26, marginBottom: 20 }}>private room · owner Admin</div>
    {lines.map((l) => (
      <div key={l} style={{ color: C.text, fontSize: 30, marginTop: 14 }}>
        {l}
      </div>
    ))}
  </div>
);

const Diagram: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: f - 12.5 * fps, fps, config: { damping: 200 }, durationInFrames: 4 * fps });
  const memoX = interpolate(t, [0, 1], [870, 1050]);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center", color: C.text, fontSize: 52, fontWeight: 700 }}>
        The wall is room membership, enforced by Switch
      </div>
      <Room
        name="#clean-team"
        color={C.clean}
        x={110}
        lines={["Counsel (human)", "analista · owner clean-team", "Linux user cleanteam", "Read, Grep, Glob only", "Raw data room"]}
      />
      <Room
        name="#deal-team"
        color={C.deal}
        x={1170}
        lines={["Counsel (human)", "Meridian executive (human)", "assistente · owner deal-team", "Linux user dealteam", "Released memos only"]}
      />
      <div style={{ position: "absolute", left: memoX, top: 470, transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ background: C.ok, color: C.bg, fontSize: 30, fontWeight: 800, padding: "14px 22px", borderRadius: 14 }}>MEMO</div>
        <div style={{ color: C.ok, fontSize: 24, marginTop: 10 }}>carried by counsel</div>
      </div>
      <div style={{ position: "absolute", bottom: 150, width: "100%", textAlign: "center", color: C.bad, fontSize: 34 }}>
        No agent belongs to both rooms.
      </div>
    </AbsoluteFill>
  );
};

const BOX_W = 1760;
const BOX_H = 900;

// Camera over the recording: full frame, or moved onto scene.focus (source pixels).
const camera = (scene: Extract<Scene, { kind: "clip" }>, t: number) => {
  const s0 = Math.min(BOX_W / SRC_W, BOX_H / SRC_H);
  const full = { s: s0, tx: (BOX_W - SRC_W * s0) / 2, ty: (BOX_H - SRC_H * s0) / 2 };
  const fo = scene.focus;
  if (!fo) return { ...full, e: 0 };
  const s1 = Math.min(BOX_W / fo.w, BOX_H / fo.h);
  let tx = BOX_W / 2 - (fo.x + fo.w / 2) * s1;
  let ty = BOX_H / 2 - (fo.y + fo.h / 2) * s1;
  if (fo.clamp !== false) {
    tx = SRC_W * s1 >= BOX_W ? Math.min(0, Math.max(BOX_W - SRC_W * s1, tx)) : (BOX_W - SRC_W * s1) / 2;
    ty = SRC_H * s1 >= BOX_H ? Math.min(0, Math.max(BOX_H - SRC_H * s1, ty)) : (BOX_H - SRC_H * s1) / 2;
  }
  const end = fo.to ?? 1e6;
  const ramp = 0.6;
  const p = interpolate(t, [fo.from, fo.from + ramp, end, end + ramp], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  return { s: full.s + (s1 - full.s) * e, tx: full.tx + (tx - full.tx) * e, ty: full.ty + (ty - full.ty) * e, e };
};

const Clip: React.FC<{ scene: Extract<Scene, { kind: "clip" }> }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = camera(scene, f / fps);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", left: (1920 - BOX_W) / 2, top: 40, width: BOX_W, height: BOX_H, overflow: "hidden", borderRadius: 18, border: `2px solid ${C.line}`, background: "#000" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: SRC_W, height: SRC_H, transformOrigin: "0 0", transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }}>
          <OffthreadVideo
            src={staticFile(`clips/${scene.file}`)}
            startFrom={Math.round((scene.startAt ?? 0) * fps)}
            playbackRate={scene.playbackRate ?? 1}
            muted
            style={{ width: SRC_W, height: SRC_H }}
          />
        </div>
        {scene.focus && scene.focus.spot !== false ? (
          <div
            style={{
              position: "absolute",
              left: cam.tx + scene.focus.x * cam.s,
              top: cam.ty + scene.focus.y * cam.s,
              width: scene.focus.w * cam.s,
              height: scene.focus.h * cam.s,
              borderRadius: 10,
              boxShadow: `0 0 0 4000px rgba(13,17,23,${0.78 * cam.e})`,
            }}
          />
        ) : null}
      </div>
      {scene.badge ? <Badge text={scene.badge.text} at={scene.badge.at} /> : null}
    </AbsoluteFill>
  );
};

const Badge: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = interpolate(f, [at * fps, at * fps + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 620, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: C.ok, color: C.bg, fontFamily: FONT, fontSize: 52, fontWeight: 800, padding: "18px 40px", borderRadius: 16 }}>{text}</div>
    </div>
  );
};

const Tools: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, padding: 140, justifyContent: "center" }}>
    <FadeIn>
      <div style={{ color: C.text, fontSize: 54, fontWeight: 700 }}>The analyst's tools</div>
    </FadeIn>
    <FadeIn delay={12}>
      <div style={{ color: C.ok, fontSize: 42, marginTop: 44 }}>Allowed: Read · Grep · Glob</div>
    </FadeIn>
    <FadeIn delay={26}>
      <div style={{ color: C.bad, fontSize: 42, marginTop: 30 }}>Denied (35): Bash · Write · Edit · WebFetch · WebSearch · Task</div>
      <div style={{ color: C.dim, fontSize: 34, marginTop: 14 }}>and every Switch tool that invites, adds, links or edits rooms and agents</div>
    </FadeIn>
    <FadeIn delay={40}>
      <div style={{ color: C.text, fontSize: 38, marginTop: 50 }}>Its own Linux user, cleanteam, in its own data-room folder.</div>
    </FadeIn>
  </AbsoluteFill>
);

const Gaps: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, padding: 140, justifyContent: "center" }}>
    <FadeIn>
      <div style={{ color: C.text, fontSize: 54, fontWeight: 700 }}>Two gaps we found in the default setup</div>
    </FadeIn>
    {[
      "Anyone in a room can bring any agent in with !invite-agent.",
      "A server restart puts agents back in every channel their bot is in.",
    ].map((g, i) => (
      <FadeIn key={g} delay={[9, 138][i]}>
        <div style={{ color: C.deal, fontSize: 40, marginTop: 40 }}>• {g}</div>
      </FadeIn>
    ))}
    <FadeIn delay={279}>
      <div style={{ color: C.ok, fontSize: 40, marginTop: 60 }}>A guard removes the analyst from any other room within a minute.</div>
    </FadeIn>
  </AbsoluteFill>
);

const End: React.FC = () => {
  const rows = [
    { h: "Switch enforces", c: C.ok, t: "Room membership · who may give each agent orders" },
    { h: "We configure", c: C.clean, t: "Separate owners and Linux users · private rooms · denied tools · the guard" },
    { h: "Prompt only", c: C.deal, t: "The fewer-than-3-customers rule · the wording of the aggregate" },
  ];
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, padding: 140, justifyContent: "center" }}>
      {rows.map((r, i) => (
        <FadeIn key={r.h} delay={[9, 132, 255][i]}>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 34 }}>
            <div style={{ color: r.c, fontSize: 46, fontWeight: 800, width: 520 }}>{r.h}</div>
            <div style={{ color: C.text, fontSize: 36 }}>{r.t}</div>
          </div>
        </FadeIn>
      ))}
      <FadeIn delay={390}>
        <div style={{ color: C.text, fontSize: 44, fontWeight: 700, marginTop: 90 }}>github.com/Bruno-coder21/clean-team-for-ai-agents</div>
      </FadeIn>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 26, pointerEvents: "none" }}>
      <div style={{ opacity: o, background: "rgba(0,0,0,0.78)", color: "#fff", fontFamily: FONT, fontSize: 34, padding: "12px 28px", borderRadius: 12, maxWidth: 1600, textAlign: "center" }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.kind) {
    case "title":
      return <Title title={scene.title} subtitle={scene.subtitle} />;
    case "fines":
      return <Fines />;
    case "diagram":
      return <Diagram />;
    case "clip":
      return <Clip scene={scene} />;
    case "tools":
      return <Tools />;
    case "gaps":
      return <Gaps />;
    case "end":
      return <End />;
  }
};

export const DemoVideo: React.FC<{ withAudio: boolean; withClips: boolean }> = ({ withAudio, withClips }) => {
  const segments = (audio as { segments: Segment[] | null }).segments;
  let at = 0;
  const seqs: React.ReactNode[] = [];
  timeline(segments).forEach((b, bi) => {
    const blockStart = at;
    b.scenes.forEach((s, si) => {
      const frames = Math.round(s.seconds * FPS);
      const view = s.kind === "clip" && !withClips ? <Title title={`[${s.file}]`} subtitle="clip placeholder" /> : <SceneView scene={s} />;
      seqs.push(
        <Sequence key={`${bi}-${si}`} from={at} durationInFrames={frames}>
          {view}
        </Sequence>,
      );
      at += frames;
    });
    seqs.push(
      <Sequence key={`cap-${bi}`} from={blockStart} durationInFrames={at - blockStart}>
        <Caption text={b.caption} />
      </Sequence>,
    );
    const seg = segments?.[bi];
    if (withAudio && seg) {
      seqs.push(
        <Sequence key={`voice-${bi}`} from={blockStart + Math.round(LEAD_IN * FPS)} durationInFrames={Math.round((seg.to - seg.from) * FPS) + 1}>
          <Audio src={staticFile("narration.mp3")} startFrom={Math.round(seg.from * FPS)} endAt={Math.round(seg.to * FPS)} />
        </Sequence>,
      );
    }
  });
  return <AbsoluteFill style={{ background: C.bg }}>{seqs}</AbsoluteFill>;
};
