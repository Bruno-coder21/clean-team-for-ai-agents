import React from "react";
import { Composition, registerRoot } from "remotion";
import { DemoVideo } from "./Video";
import { FPS, Segment, totalSecondsFor } from "./scenes";
import audio from "./audio.json";

const Root: React.FC = () => (
  <>
    <Composition
      id="Demo"
      component={DemoVideo}
      durationInFrames={Math.round(totalSecondsFor((audio as { segments: Segment[] | null }).segments) * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ withAudio: false, withClips: false }}
    />
  </>
);

registerRoot(Root);
