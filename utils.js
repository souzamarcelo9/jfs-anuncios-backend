import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";

export async function getAudioDurationInSeconds(filePath) {
  const info = await ffprobe(filePath, { path: ffprobeStatic.path });
  const dur = info.streams.find(s => s.codec_type === "audio").duration;
  return parseFloat(dur);
}
