/* import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export async function montarVideo(projectId, imagePaths) {
  const pastaVideo = `./videos/${projectId}`;
  fs.mkdirSync(pastaVideo, { recursive: true });

  const audioPath = `./audios/${projectId}/narracao-final.mp3`;
  const musicaFundo = './assets/music/background.mp3';
  const output = `${pastaVideo}/video-final.mp4`;

  //const listaTxt = imagePaths.map(img => `file '${path.resolve(img)}'\nduration 3`).join('\n');
  const lista = imagePaths.map(img => `file '${path.resolve(img)}'\nduration 3`);
  lista.push(`file '${path.resolve(imagePaths[imagePaths.length - 1])}'`);
  const listaTxt = lista.join('\\n');
  const listaPath = `./temp/${projectId}_list.txt`;
  fs.mkdirSync('./temp', { recursive: true });
  fs.writeFileSync(listaPath, listaTxt);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listaPath)               // 0:v (imagens concatenadas)
      .input(audioPath)               // 1:a (narração)
      .input(musicaFundo)             // 2:a (música de fundo)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .complexFilter([
        "[2:a]volume=0.3[a1]",
        "[1:a][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]",
        {
          filter: 'drawtext',
          options: {
            text: '🔥 Supermercado Econômico 🔥',
            fontfile: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            fontcolor: 'white',
            fontsize: 60,
            x: '(w-text_w)/2',
            y: '50',
            box: 1,
            boxcolor: 'black@0.5',
            boxborderw: 10,
            alpha: "if(lt(t,1), 0, if(lt(t,3), (t-1)/2, 1))",
            enable: 'between(t,0,5)'
          }
        }
      ])
      .outputOptions([
        '-map', '0:v',
        '-map', '[aout]',
        '-r', '30',
        '-s', '1080x1080',
        '-shortest'
      ])
      .output(output)
      .on('end', () => {
        console.log('🎬 Vídeo final gerado com sucesso em:', output);
        resolve(output);
      })
      .on('error', (err) => {
        console.error('Erro ao gerar vídeo:', err);
        reject(err);
      })
      .run();
  });
}
 */

import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function montarVideo(projectId, imagePaths) {
  const pastaVideo = `./videos/${projectId}`;
  fs.mkdirSync(pastaVideo, { recursive: true });

  const pastaImagens = `./temp/${projectId}_imagens`;
  fs.mkdirSync(pastaImagens, { recursive: true });

  // ✅ Converte tudo pra JPG, garante 1080x1080, múltiplo de 2
  for (let index = 0; index < imagePaths.length; index++) {
    const imgPath = imagePaths[index];
    const numero = String(index + 1).padStart(3, '0'); // img_001.jpg
    const destino = `${pastaImagens}/img_${numero}.jpg`;

    await sharp(imgPath)
      .flatten({ background: '#ffffff' }) // Remove alpha
      .resize({
        width: 1080,
        height: 1080,
        fit: 'contain',
        background: '#ffffff'
      })
      .jpeg({ quality: 90 })
      .toFile(destino);

    console.log(`🔄 Gerou: ${destino}`);
  }

  const output = `${pastaVideo}/video-fase1.mp4`;

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(`${pastaImagens}/img_%03d.jpg`) // Padrão sequencial
      .inputOptions(['-framerate', '1/3'])   // 3 seg cada imagem
      .outputOptions([
        '-r', '30',               // FPS final
        '-c:v', 'libx264',        // Codec H.264
        '-pix_fmt', 'yuv420p'     // Compatível com tudo
      ])
      .output(output)
      .on('start', (cmd) => console.log("⚙️ FFmpeg:", cmd))
      .on('end', () => {
        console.log('✅ FASE 1: Vídeo final gerado em:', output);
        resolve(output);
      })
      .on('error', (err) => {
        console.error('❌ Erro FASE 1:', err);
        reject(err);
      })
      .run();
  });
}
