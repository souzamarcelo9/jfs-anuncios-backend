import express from "express";
import cors from "cors" // Importe o pacote cors
import { db } from "./firebase.js";
import fs from "fs";
import axios from "axios";
import { gerarAudioUnico } from "./elevenlabs.js";
import { montarIntro, montarSlideProduto, adicionarMusicaFinal,gerarProdutoZoom,gerarProdutoScaleZoom,gerarProdutoScaleSemPad } from "./videoGenerator_fase3.js";
import ffmpeg from "fluent-ffmpeg";
import { removerFundoImagem } from "./removerFundo.js";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import path from "path";
import admin from "firebase-admin";
// 🔑 Inicializa o Firebase Admin com credencial de serviço
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

/* admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "jf-anuncios.appspot.com", // Troque pelo seu bucket real
}); */

const bucket = admin.storage().bucket();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173' // Apenas a sua aplicação front-end é permitida
}));

const PORT = 3001;

app.use("/videos", express.static("videos"));

async function baixarLogo(urlLogo, projectId) {
  const logoPath = `./temp/${projectId}_logo.png`;
  const response = await axios.get(urlLogo, { responseType: "arraybuffer" });
  fs.mkdirSync("./temp", { recursive: true });
  fs.writeFileSync(logoPath, response.data);
  return logoPath;
}

async function baixarImagens(items, projectId) {
  const paths = [];
  for (const [i, item] of items.entries()) {
    const imgLocal = `./temp/${projectId}_produto_${i}.png`;
    const response = await axios.get(item.imgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imgLocal, response.data);
    paths.push(imgLocal);
  }
  return paths;
}

async function uploadVideoFirestore(projectId,userID){

  // 🔚 Caminho final local do vídeo
const finalVideoPath = `./videos/${projectId}/video-final.mp4`;

// ✅ Faz upload pro Storage
const destino = `videos/${projectId}/video-final.mp4`;
let urlFinal = ''; 

try
{

await bucket.upload(finalVideoPath, {
  destination: destino,
});

// ✅ Gera URL assinada
const file = bucket.file(destino);
const [url] = await file.getSignedUrl({
  action: "read",
  expires: "03-09-2030",
});

console.log("URL pública do vídeo:", url);
urlFinal = url;

// ✅ Salva meta no Firestore
await db.collection("videos").add({
  projectId: projectId,
  userId: userID, // Pega do seu doc do projeto
  videoUrl: url,
  createdAt: Date.now(),
});

console.log(`✅ Vídeo FINAL SALVO`);
// ✅ Retorna pro Frontend
/* res.json({
  mensagem: `✅ Vídeo FINAL PRONTO`,
  downloadUrl: url,
}); */

}
catch(exception){
  console.log(`❌ Erro ao produzir vídeo. Detalhes : ${exception.message} || ${exception}`); 
}
  return urlFinal;

}

function separarPreco(preco) {
  const valor = parseFloat(preco);
  if (isNaN(valor)) {
    return { inteiro: "0", decimal: "00" };
  }
  const inteiro = Math.floor(valor).toString();
  const decimal = ((valor - Math.floor(valor)) * 100).toFixed(0).padStart(2, "0");
  return { inteiro, decimal };
}

function obterWallPaperPngByName(name) {
  
  let wallPaper = '';

  switch(name){

    case "Vibrante":
    wallPaper = "./assets/gradientes/azul_gradient.png";
    break;
    
    case "Natureza":
    
     wallPaper = "./assets/gradientes/amarelo_gradient.png";
     break;

    case "Profissional":
    
     wallPaper = "./assets/gradientes/cinza_gradient.png";
     break;

     case "Fresco":
    
     wallPaper = "./assets/gradientes/verde_gradient.png";
     break;

     case "Quente":
    
     wallPaper = "./assets/gradientes/laranja_gradient.png";
     break;

     case "Elegante":
    
     wallPaper = "./assets/gradientes/roxo_gradient.png";
     break;
    
     default:
      wallPaper = "./assets/gradientes/azul_gradient.png";
      break;
  }

  return wallPaper;
}

function obterBackgroundColorByName(name) {
  
  let wallPaper = '';

  switch(name){

    case "Vibrante":
    wallPaper = "./assets/gradientes/azul_fundo.png";
    break;
    
    case "Natureza":
    
     wallPaper = "./assets/gradientes/amarelo_fundo.png";
     break;

    case "Profissional":
    
     wallPaper = "./assets/gradientes/cinza_fundo.png";
     break;

     case "Fresco":
    
     wallPaper = "./assets/gradientes/verde_fundo.png";
     break;

     case "Quente":
    
     wallPaper = "./assets/gradientes/laranja_fundo.png";
     break;

     case "Elegante":
    
     wallPaper = "./assets/gradientes/roxo_fundo.png";
     break;
    
     default:
      wallPaper = "./assets/gradientes/azul_fundo.png";
      break;
  }

  return wallPaper;
}
   

app.get("/gerar-video/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try
  {
  const doc = await db.collection("projects").doc(projectId).get();
  if (!doc.exists) return res.status(404).send("Projeto não encontrado.");

  const projeto = doc.data();
  const logoPath = await baixarLogo(projeto.smLogo, projectId);
  const imagens = await baixarImagens(projeto.items, projectId);

  const corFundo = projeto.smColorSet.primary || "#0055FF";
  const corFaixa = projeto.smColorSet.secondary || "#FF0000";

  // Intro
  const audioIntro = `./audios/${projectId}/audio_intro.mp3`;
  //await gerarAudioUnico("🔥Ofertas imperdíveis!! 🔥 É no Valedassa!!", audioIntro);

  // ⚙️ Chame a API de remoção primeiro:
  console.log("Iniciando remoção da logo: " + logoPath);
  const logoSemFundo = `./temp/${projectId}_logo_semfundo.png`;
  await removerFundoImagem(logoPath,logoSemFundo); // salva PNG sem fundo

  const wallPaper = obterWallPaperPngByName(projeto.smColorSet.name);
  await montarIntro({ projectId, logoPath:logoSemFundo, corFundo:wallPaper, corFaixa, audioPath: audioIntro });

  // ✅ 2️⃣ Slides dos produtos
const pasta = `./videos/${projectId}`;
const slides = [];

for (const [i, item] of projeto.items.entries()) {
  const preco = item.price ? `R$ ${item.price}` : "R$ 0,00"; // Nunca undefined
  const { inteiro, decimal } = separarPreco(item.price);
  
  console.log("iniciando geraProdutoScaleZoom no index : " + imagens[i] );

// Antes de gerar zoom:
await removerFundoImagem(imagens[i], `./temp/${projectId}_produto_${i}_semfundo.png`);
const produtoSemFundo = `./temp/${projectId}_produto_${i}_semfundo.png`;

const wallPaperProduto = obterBackgroundColorByName(projeto.smColorSet.name);
  
  await gerarProdutoScaleZoom({
    projectId,
    produtoPath:produtoSemFundo,// imagens[i],
    index: i,
    corFundo: projeto.smColorSet.primary//"#0055FF"
  });

   await montarSlideProduto({
    projectId,
    produtoPath: `${pasta}/zoom_${i}.mp4`,
    preco: preco,
    precoInteiro: inteiro.toString(),
    precoDecimal: decimal.toString(),
    nomeProduto: item.name,
    logoPath:logoSemFundo,
    corFundo:wallPaperProduto,
    corFaixa,
    index: i
  });   

  slides.push(`slide_${i}.mp4`);
}

  // Concat
  
  const listPath = `${pasta}/list.txt`;
  fs.writeFileSync(listPath, [`file 'intro.mp4'`, ...slides.map(s => `file '${s}'`)].join("\n"));

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions("-f", "concat", "-safe", "0")
      .outputOptions("-c copy")
      .output(`${pasta}/video_concat.mp4`)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });

  // Narração única + música
  const textoCompleto = [`"🔥${projeto.slogan}🔥"`, ...projeto.items.map(i => `${i.description}!`)].join(". ");
  await gerarAudioUnico(textoCompleto, `./audios/${projectId}/narracao-final.mp3`);
  await adicionarMusicaFinal({ projectId });
  
  console.log(`🔚 Subindo vídeo para firestore.`);
  const urlFinal = await uploadVideoFirestore(projectId,projeto.customerID);

  console.log( `✅ Vídeo FINAL PRONTO, caminho: /videos/${projectId}/video-final.mp4`);
  res.status(200).json({ mensagem: `✅ Seu anúncio foi gerado com sucesso!!`, caminho: urlFinal });
  }
  catch(exception){
  res.status(500).json({ mensagem: `❌ Erro ao produzir vídeo. Detalhes : ${exception.message || exception});` });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});


