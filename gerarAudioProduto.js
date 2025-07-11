import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const voiceId = process.env.ELEVENLABS_VOICE_ID;
const apiKey = process.env.ELEVENLABS_API_KEY;

// 🗣️ Narração de abertura
export async function gerarAudioIntro(texto, audioPath) {
  console.log("🎙️ Gerando áudio de abertura:", texto);

   const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: texto,
      model_id: "eleven_multilingual_v1",
      voice_settings: {
        stability: 0.10,
        speed: 1.10,
        similarity_boost: 0.8
      }
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    }
  );

  fs.writeFileSync(audioPath, response.data);
  console.log("✅ Áudio de abertura salvo em:", audioPath); 
}

// 🗣️ Narração de produto
export async function gerarAudioProduto(texto, audioPath) {
  console.log("🎙️ Gerando áudio do produto:", texto);

   const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: texto,
      model_id: "eleven_multilingual_v1",
      voice_settings: {
        stability: 0.10,
        speed: 1.10,
        similarity_boost: 0.8
      }
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    }
  );

  fs.writeFileSync(audioPath, response.data);
  console.log("✅ Áudio do produto salvo em:", audioPath); 
}
