import axios from "axios";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

export async function gerarAudioUnico(texto, nomeArquivo) {
 const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  console.log("Chegou no gerarAudioUnico:", nomeArquivo);

  try {
    const pasta = path.dirname(nomeArquivo);
    console.log('Vai criar pasta:', pasta);
    fs.mkdirSync(pasta, { recursive: true });

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: texto,
        model_id: "eleven_multilingual_v1",
        voice_settings: {
          stability: 0.30,
          speed: 1.10,
          similarity_boost: 0.75
        },
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    console.log('Vai salvar em:', nomeArquivo);
    fs.writeFileSync(nomeArquivo, response.data);
    console.log("Áudio gerado com sucesso:", nomeArquivo);

  } catch (err) {
    console.error("Falhou:", err);
  } 
}

 /* export async function gerarAudioUnico(texto, nomeArquivo) {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  console.log("Chegou no gErarAudioUnico " + nomeArquivo);
  
  try
  {
  
  const pasta = path.dirname(nomeArquivo);
  fs.mkdirSync(pasta, { recursive: true });
   
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: texto,
      model_id: "eleven_multilingual_v1",
      voice_settings: {
        stability: 0.20,        
        speed:1.10,
        similarity_boost: 0.7
      },
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );
   /* const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: texto,
      model_id: "eleven_multilingual_v1",
      voice_settings: {
        stability: 0.05,        
        speed:1.10,
        similarity_boost: 0.9
      },
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  ); */
  
  //fs.writeFileSync(nomeArquivo, response.data); 
  //console.log("Áudio gerado:", nomeArquivo);
   //}
  //catch(err){
   // console.log("Falhou:", err);
  //}
//} 
 