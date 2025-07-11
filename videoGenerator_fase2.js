import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export async function montarVideoFinal(projectId) {
  const pastaVideo = `./videos/${projectId}`;
  const inputVideo = `${pastaVideo}/video-fase1.mp4`;
  const narracao = `./audios/${projectId}/narracao-final.mp3`;    // Seu áudio ElevenLabs
  const musica = `./assets/music/background.mp3`;   // Música de fundo
  const output = `${pastaVideo}/video-final.mp4`;

  if (!fs.existsSync(inputVideo)) throw new Error("❌ Vídeo base não existe!");
  if (!fs.existsSync(narracao)) throw new Error("❌ Narração não existe!");
  if (!fs.existsSync(musica)) throw new Error("❌ Música não existe!");

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputVideo)  // 0:v + 0:a (se tiver)
      .input(narracao)    // 1:a
      .input(musica)      // 2:a
      .complexFilter([
        "[2:a]volume=0.2[bgm]",    // Música mais baixa
        "[1:a][bgm]amix=inputs=2:duration=first[aout]"  // Mix narração + música
      ])
      .outputOptions([
        "-map", "0:v",   // Usa o vídeo da FASE 1
        "-map", "[aout]",// Usa o áudio mixado
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-shortest"
      ])
      .output(output)
      .on("start", (cmd) => console.log("⚙️ FFmpeg:", cmd))
      .on("end", () => {
        console.log("✅ FASE 2: Vídeo final gerado em:", output);
        resolve(output);
      })
      .on("error", (err) => {
        console.error("❌ Erro FASE 2:", err);
        reject(err);
      })
      .run();
  });
}
