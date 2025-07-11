import fs from "fs";
import path from "path";
import { removeBackgroundFromImageFile } from "remove.bg";

export async function removerFundoImagem(inputPath, outputPath) {
  const apiKey = process.env.REMOVE_BG_API_KEY; // Salve em .env
  
  console.log(`✅ Iniciando remoção de fundo ${inputPath}`);
  
  try
  {
  const result = await removeBackgroundFromImageFile({
    path: inputPath,
    apiKey: apiKey,
    size: "auto",
    type: "auto",
    format: "png",
  });
  
  fs.writeFileSync(outputPath, result.base64img, { encoding: "base64" });
  console.log(`✅ Fundo removido: ${outputPath}`);
  }
  catch(exception){
    console.log("Erro ao tentar remover fundo.");
    console.log(exception);
  }  
}