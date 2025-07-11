import ffmpeg from "fluent-ffmpeg";
import fs from "fs";


/* VERSÃO PERFEITA RODANDO  */
export async function montarIntro({ projectId, logoPath, corFundo, corFaixa, audioPath }) {
  const pasta = `./videos/${projectId}`;
  fs.mkdirSync(pasta, { recursive: true });

  console.log("✅ Iniciando Montar Intro:", audioPath,corFundo);

  return new Promise((resolve, reject) => {
    ffmpeg()
      // Fundo gradiente PNG (loop infinito)
      .input(corFundo)
      .inputOptions("-loop 1")
      .duration(3)

      // Logo
      .input(logoPath)
      .inputOptions("-loop 1")

      // Áudio
      .input(audioPath)

      .complexFilter([
        // 1️⃣ Logo escalada + pulsando
        "[1:v]scale=500:-1,scale=w=iw*(1+0.08*sin(2*PI*t)):h=ih*(1+0.08*sin(2*PI*t)):eval=frame[logo]",

        // 2️⃣ Fundo + logo centralizada
        "[0:v][logo]overlay=x=(W-w)/2:y=(H-h)/2[base]",

        // 3️⃣ MEGA animado (slide + pulse)
        //`[base]drawtext=text='MEGA':x=(w-text_w)/2:y='50 - 40*(1-t/1.5)*(gte(t\\,0)*lte(t\\,1.5))':fontsize='90 + 10*sin(2*PI*t/1.0)':fontcolor=white:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[mega]`,        
        `[base]drawtext=text='MEGA':x='(w-text_w)/2 + if(gte(t\\,2)\\,(t-2)*200\\,0)':y='50 - 40*(1-t/1.5)*(gte(t\\,0)*lte(t\\,1.5))':fontsize='90 + 10*sin(2*PI*t/1.0)':fontcolor=white:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[mega]`,

        // 4️⃣ Faixa + SEMANA DE
        //`[mega]drawbox=x=(w/2-200):y=150:w=400:h=60:color=red@1:t=fill[box]`,
        //`[box]drawtext=text='SEMANA DE':x=(w-text_w)/2:y=160:fontsize=40:fontcolor=white:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[semana]`,
        `[mega]drawtext=text='SEMANA DE':x=(w-text_w)/2:y=160:fontsize=40:fontcolor=white:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[semana]`,

        // 5️⃣ OFERTAS com contorno
        //`[semana]drawtext=text='OFERTAS':x=(w-text_w)/2:y=230:fontsize=70:fontcolor=white:borderw=4:bordercolor=blue:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[textos]`,
        `[semana]drawtext=text='OFERTAS':x='(w-text_w)/2 + if(gte(t\\,2)\\,(t-2)*200\\,0)':y=230:fontsize=70:fontcolor=white:borderw=4:bordercolor=blue:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[textos]`,

        // 6️⃣ Faixa inferior
        `[textos]drawbox=x=0:y=860:w=1080:h=220:color=${corFaixa}@1:t=fill[outv]`
      ])

      .outputOptions([
        "-map [outv]",
        "-map 2:a",
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-shortest"
      ])

      .output(`${pasta}/intro.mp4`)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

/* export async function montarIntro({ projectId, logoPath, corFundo, corFaixa, audioPath }) {
  const pasta = `./videos/${projectId}`;
  fs.mkdirSync(pasta, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input("./assets/gradientes/azul_gradient.png")
      .inputOptions("-loop 1")
      .duration(3)

      .input(logoPath)
      .inputOptions("-loop 1") // ✅ Para animar o PNG
      .input(audioPath)

      .complexFilter([
        // 🫀 Efeito “beat” na logo
        "[1:v]scale=325:-1[logoBase];" +
        "[logoBase]scale=w='iw*(1+0.05*sin(2*PI*t))':h='ih*(1+0.05*sin(2*PI*t))':eval=frame[logoAnim]",

        // Fundo + logo centralizada + movimento para cima
        "[0:v][logoAnim]overlay=x=(W-w)/2:y='(H-h)/2 - t*100'[base]",

        // Faixa vermelha embaixo
        `[base]drawbox=x=0:y=900:w=1080:h=180:color=${corFaixa}@1:t=fill[outv]`
      ])

      .outputOptions([
        "-map [outv]",
        "-map 2:a",
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-shortest"
      ])

      .output(`${pasta}/intro.mp4`)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
} */

  /* export async function montarIntro({ projectId, logoPath, corFundo, corFaixa, audioPath }) {
    const pasta = `./videos/${projectId}`;
    fs.mkdirSync(pasta, { recursive: true });
  
    return new Promise((resolve, reject) => {
      ffmpeg()
        // ✅ PNG do gradiente, loop, framerate garantido
        .input("./assets/gradientes/azul_gradient.png")
        .inputOptions(["-loop 1", "-framerate 25"])
        .duration(3)
  
        // ✅ Logo loop
        .input(logoPath)
        .inputOptions("-loop 1")
  
        .input(audioPath)
  
        .complexFilter([
          // 1️⃣ Logo com batimento usando n + eval=frame
          "[1:v]scale=w='325*(1+0.05*sin(2*PI*n/25))':h=-1:eval=frame[logoZoom]",
  
          // 2️⃣ Fundo + logo centralizada
          "[0:v][logoZoom]overlay=x=(W-w)/2:y=(H-h)/2[base]",
  
          // 3️⃣ Texto Mega + Semana + Ofertas
          `[base]drawtext=text='MEGA':x=(w-text_w)/2:y=50:fontsize=90:fontcolor=white:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[mega]`,
  
          `[mega]drawbox=x=(w/2-200):y=150:w=400:h=60:color=red@1:t=fill[box]`,
          `[box]drawtext=text='SEMANA DE':x=(w-text_w)/2:y=160:fontsize=40:fontcolor=white:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[semana]`,
  
          `[semana]drawtext=text='OFERTAS':x=(w-text_w)/2:y=230:fontsize=70:fontcolor=white:borderw=4:bordercolor=blue:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[textos]`,
  
          // 4️⃣ Faixa inferior
          `[textos]drawbox=x=0:y=860:w=1080:h=220:color=${corFaixa}@1:t=fill[outv]`
        ])
  
        .outputOptions([
          "-map [outv]",
          "-map 2:a",
          "-c:v libx264",
          "-pix_fmt yuv420p",
          "-shortest"
        ])
  
        .output(`${pasta}/intro.mp4`)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
  } */

/* export async function montarSlideProduto({
  projectId,
  produtoPath,
  preco,
  logoPath,
  corFundo,
  corFaixa,
  index
}) {
  const pasta = `./videos/${projectId}`;
  fs.mkdirSync(pasta, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input("./assets/gradientes/azul_gradient.png")
      .inputOptions("-loop 1")
      .duration(5)

      .input(produtoPath)
      .input(logoPath)
      .inputOptions("-loop 1")
      .complexFilter([
        "[1:v]scale=500:-1[produto]",
      
        // ✅ Branch fixo → branch animado → branch final
        "[2:v]scale=150:-1[logoBase];" +
        "[logoBase]scale=w='iw*(1+0.05*sin(2*PI*t))':h='ih*(1+0.05*sin(2*PI*t))':eval=frame[logoAnim]",
      
        `[0:v][produto]overlay=x='(W-w)/2 + if(gte(t,4.5), (t-4.5)*900, 0)':y='(H-h)/2'[base]`,
      
        `[base]drawbox=x=0:y=860:w=1080:h=220:color=${corFaixa}@1:t=fill[faixa]`,
      
        "[faixa]drawbox=x=100:y=100:w=250:h=100:color=yellow@0.9:t=fill[box]",
      
        `[box]drawtext=text='${preco}':x=120:y=160:fontsize=40:fontcolor=red:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[text]`,
      
        "[text][logoAnim]overlay=x=(W-w)/2:y=910[outv]"
      ])

      .outputOptions([
        "-map [outv]",
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-shortest"
      ])

      .output(`${pasta}/slide_${index}.mp4`)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
} */
   

  /* FUNCIONANDO PERFEITAMENTE */
  /* export async function montarSlideProduto({
    projectId,
    produtoPath,
    precoInteiro,
    precoDecimal,
    nomeProduto,
    logoPath,
    corFundo,
    corFaixa,
    index
  }) {
    const pasta = `./videos/${projectId}`;
    fs.mkdirSync(pasta, { recursive: true });
  
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input("./assets/gradientes/azul_gradient.png")
        .inputOptions("-loop 1")
        .duration(5)
  
        .input(produtoPath)
        .input(logoPath)
        .inputOptions("-loop 1")
  
        .complexFilter([
          // Produto
          "[1:v]scale=500:-1[produto]",
        
          // Logo com batimento
          "[2:v]scale=150:-1[logoBase];" +
          "[logoBase]scale=w='iw*(1+0.05*sin(2*PI*t))':h='ih*(1+0.05*sin(2*PI*t))':eval=frame[logoAnim]",
        
          // Produto com movimento de saída
          `[0:v][produto]overlay=x='(W-w)/2 + if(gte(t,4.5), (t-4.5)*900, 0)':y='(H-h)/2'[base]`,
        
          // Faixa vermelha inferior
          `[base]drawbox=x=0:y=860:w=1080:h=220:color=${corFaixa}@1:t=fill[faixa]`,
        
          // ✅ Caixa amarela mais baixa e mais à esquerda
          "[faixa]drawbox=x=50:y=200:w=350:h=180:color=yellow@0.9:t=fill[box]",
        
          // ✅ Nome do produto em cima dentro da caixa
          `[box]drawtext=text='${nomeProduto}':x='50 + (350-text_w)/2':y=220:fontsize=16:fontcolor=black:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[withName]`,
        
          // ✅ Preço inteiro grande encadeado
          `[withName]drawtext=text='${precoInteiro}':x=180:y=270:fontsize=90:fontcolor=red:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[withInt]`,
        
          // ✅ Decimal encadeado do anterior
          `[withInt]drawtext=text=',${precoDecimal}':x=300:y=270:fontsize=30:fontcolor=red:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[priceDec]`,
        
          // ✅ Logo na faixa inferior animada
          "[priceDec][logoAnim]overlay=x=(W-w)/2:y=870[outv]"
        ])
  
        .outputOptions([
          "-map [outv]",
          "-c:v libx264",
          "-pix_fmt yuv420p",
          "-shortest"
        ])
  
        .output(`${pasta}/slide_${index}.mp4`)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
  } */

    /* VERSÃO FINAL FUNCIONANDO PERFEITAMENTE COM ZOOM CRIADO ANTES VIA ZOOM PAN */
export async function montarSlideProduto({
      projectId,
      index,
      logoPath,
      corFundo,
      corFaixa,
      nomeProduto,
      precoInteiro,
      precoDecimal
    }) 
    {
      const pasta = `./videos/${projectId}`;
      console.log(`✅ entrou no montarSlideProduto`);
    
      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(corFundo)
          .inputOptions("-loop 1")
          .duration(5)
          .input(`${pasta}/zoom_${index}.mp4`)
          .input(logoPath).inputOptions("-loop 1")
    
          .complexFilter([
          // Logo animada
          "[2:v]scale=320:-1[logoBase];" +
          "[logoBase]scale=w='iw*(1+0.05*sin(2*PI*t))':h='ih*(1+0.05*sin(2*PI*t))':eval=frame[logoAnim]",

          // Fundo + produto centralizado
          "[0:v][1:v]overlay=x=(W-w)/2:y=(H-h)/2[base]",

          // ✅ MEGA OFERTAS no topo central
          //`[base]drawtext=text='MEGA OFERTAS':x=(w-text_w)/2:y=40:fontsize=40:fontcolor=white:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[withTitle]`,
          `[base]drawtext=text='MEGA OFERTAS':` +
          `x='(w-text_w)/2 + if(gte(t,4), (t-4)*50, 0)':` +  // desliza p/ direita nos últimos ~1s
          `y=40:` +
          `fontsize='40 + 5*sin(2*PI*t/1.0)':` +             // pulse suave
          `fontcolor=white:` +
          `fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[withTitle]`,

          // ✅ Faixa vermelha embaixo
          `[withTitle]drawbox=x=0:y=840:w=1080:h=240:color=${corFaixa}@1:t=fill[faixa]`,

          // Caixa amarela do preço
          "[faixa]drawbox=x=50:y=200:w=350:h=180:color=yellow@0.9:t=fill[box]",

          // Nome do produto
          `[box]drawtext=text='${nomeProduto}':x='50 + (350-text_w)/2':y=220:fontsize=16:fontcolor=black:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[withName]`,

          // Preço grande e decimal
          `[withName]drawtext=text='${precoInteiro}':x=180:y=270:fontsize=90:fontcolor=red:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[withInt]`,
          `[withInt]drawtext=text=',${precoDecimal}':x=300:y=270:fontsize=30:fontcolor=red:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[priceDec]`,

          // Logo em baixo animada
          "[priceDec][logoAnim]overlay=x=(W-w)/2:y=890[final]",

          // ✅ Fade out no final
          "[final]fade=t=out:st=4:d=1[outv]"
          ])
    
          .outputOptions([
            "-map [outv]",
            "-c:v libx264",
            "-pix_fmt yuv420p",
            "-shortest"
          ])
          .output(`${pasta}/slide_${index}.mp4`)
          .on("end", resolve)
          .on("error", reject)
          .run();

          console.log(`✅ Fim do montarSlideProduto`);
      });
}

export async function adicionarMusicaFinal({ projectId }) {
  const pasta = `./videos/${projectId}`;
  const concatPath = `${pasta}/video_concat.mp4`;
  const finalPath = `${pasta}/video-final.mp4`;
  

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatPath)
      .input(`./audios/${projectId}/narracao-final.mp3`)
      .input(`./assets/music/background.mp3`)
      .complexFilter(`
        [1:a][2:a]amix=inputs=2:duration=longest:dropout_transition=2[mix]
      `)
      .outputOptions([
        "-map 0:v",
        "-map [mix]",
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-shortest"
      ])
      .output(finalPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

export async function gerarProdutoZoom({projectId, produtoPath, index}) {
  const pasta = `./videos/${projectId}`;
  fs.mkdirSync(pasta, { recursive: true });
  
  console.log(`Iniciando gerarProdutoZoom, caminho ${produtoPath}, indice ${index}`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(produtoPath)
      .inputOptions("-loop 1")
      .duration(5)
      .complexFilter([
        // Efeito de zoom progressivo
        "zoompan=z='zoom+0.001':d=125:s=350x350"
      ])
      .outputOptions([
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-shortest"
      ])
      .output(`${pasta}/zoom_${index}.mp4`)
      .on("end", resolve)
      .on("error", reject)
      .run();
      
      console.log(`Vídeo ${pasta}/zoom_${index}.mp4 gravado.`);
  });
  
}

/*funcionando perfeitamente com SCALE*/
/* export async function gerarProdutoScaleZoom({
  produtoPath,
  projectId,
  index
}) {
  const pasta = `./videos/${projectId}`;
  fs.mkdirSync(pasta, { recursive: true });

  console.log(`Iniciando gerarProdutoScaleZoom, caminho ${produtoPath}, indice ${index}`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(produtoPath)
      .inputOptions("-loop 1")
      .duration(5)
      .complexFilter([
        "scale=w=iw*(0.9+0.1*t/5):h=ih*(0.9+0.1*t/5):eval=frame," +
        "pad=w=1080:h=1080:x=(ow-iw)/2:y=(oh-ih)/2:color=#0055FF,fps=25[outv]"
      ])
      .outputOptions([
        "-map [outv]",
        "-pix_fmt yuv420p",
        "-c:v libx264",
        "-r 25",
        "-shortest"
      ])
      .output(`${pasta}/zoom_${index}.mp4`)
      .on("end", resolve)
      .on("error", reject)
      .run();

      console.log(`✅ Video ${pasta}/zoom_${index}.mp4 salvo`);
  });
} */

  export async function gerarProdutoScaleZoom({
  produtoPath,
  projectId,
  index,
  corFundo
}) {
  const pasta = `./videos/${projectId}`;
  fs.mkdirSync(pasta, { recursive: true });

  console.log(`Iniciando gerarProdutoScaleZoom, caminho ${produtoPath}, indice ${index}`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      // Fundo sólido
      .input(`color=${corFundo}:s=700x700:d=5`)
      .inputOptions(["-f", "lavfi"])

      // Produto original
      .input(produtoPath)
      .inputOptions("-loop 1")
      .duration(5)

      .complexFilter([
        // 1️⃣ Escala dinâmica no produto
        "[1:v]scale=w=iw*(0.5+0.1*t/5):h=ih*(0.5+0.1*t/5):eval=frame[zoomed]",

        // 2️⃣ Sobrepõe o produto (zoomed) no fundo fixo
        "[0:v][zoomed]overlay=x=(W-w)/2:y=(H-h)/2:shortest=1"
      ])

      .outputOptions([
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-shortest"
      ])
      .output(`${pasta}/zoom_${index}.mp4`)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

/* export async function gerarProdutoScaleZoom({
  produtoPath,
  projectId,
  index,
  corFundo = "#0055FF"
}) {
  const pasta = `./videos/${projectId}`;
  fs.mkdirSync(pasta, { recursive: true });

  console.log(`Iniciando gerarProdutoScaleZoom, caminho ${produtoPath}, indice ${index}`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      // Fundo sólido
      .input(`color=${corFundo}:s=500x500:d=5`)
      .inputOptions(["-f", "lavfi"])

      // Produto original
      .input(produtoPath)
      .inputOptions("-loop 1")
      .duration(5)

      .complexFilter([
        // 1️⃣ Escala dinâmica no produto
        "[1:v]scale=w=iw*(0.9+0.1*t/5):h=ih*(0.9+0.1*t/5):eval=frame[zoomed]",

        // 2️⃣ Sobrepõe o produto (zoomed) no fundo fixo
        "[0:v][zoomed]overlay=x=(W-w)/2:y=(H-h)/2:shortest=1"
      ])

      .outputOptions([
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-shortest"
      ])
      .output(`${pasta}/zoom_${index}.mp4`)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
} */

export async function gerarProdutoScaleSemPad({projectId, produtoPath, index}) {
  const pasta = `./videos/${projectId}`;
  fs.mkdirSync(pasta, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(produtoPath)
      .inputOptions("-loop 1")
      .duration(5)
      .complexFilter([
        // 1️⃣ Zoom dinâmico
        `[0:v]scale=w='trunc(iw*(0.5+0.5*t/5)/2)*2':h='trunc(ih*(0.5+0.5*t/5)/2)*2':eval=frame[zoomed]`,
        
        // 2️⃣ Pad só para garantir paridade, fundo azul ou transparente
        `[zoomed]pad=w=ceil(iw/2)*2:h=ceil(ih/2)*2:x='(ow-iw)/2':y='(oh-ih)/2':color=0x00000000[outv]`
      ])
      .output(`${pasta}/zoom_${index}.mp4`)
      .outputOptions([
        "-map [outv]",
        "-pix_fmt yuv420p",
        "-c:v libx264",
        "-r 25",
        "-shortest"
      ])
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}
