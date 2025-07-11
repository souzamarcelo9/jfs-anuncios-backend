import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

let serviceAccount;

// Verifica se a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS_JSON está definida
// (Isso indica que estamos em um ambiente de produção ou onde a variável foi configurada)
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    // Parseia o JSON da variável de ambiente para um objeto JavaScript
    serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log("Firebase Admin SDK: Credenciais carregadas da variável de ambiente.");
  } catch (error) {
    console.error("ERRO: Não foi possível parsear GOOGLE_APPLICATION_CREDENTIALS_JSON. Verifique o formato JSON da variável de ambiente.", error);
    // Você pode querer lançar um erro ou sair do processo aqui se as credenciais são críticas
    process.exit(1);
  }
} else {
  // Se a variável de ambiente não estiver definida, tenta carregar do arquivo local
  // Certifique-se de que o caminho para serviceAccountKey.json está correto
  // em relação ao local onde seu script de backend é executado.
  try {
    serviceAccount = require('./serviceAccountKey.json');
    console.log("Firebase Admin SDK: Credenciais carregadas do arquivo local.");
  } catch (error) {
    console.error("ERRO: serviceAccountKey.json não encontrado ou inválido. Verifique o caminho e o conteúdo do arquivo.", error);
    // Se você não pode carregar credenciais, o app não pode funcionar
    process.exit(1);
  }
}

// Inicializa o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "jf-anuncios.firebasestorage.app"
});


const db = getFirestore();
export { db  };
