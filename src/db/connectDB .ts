import { AppDataSource } from "./data-source";

// Função para inicializar a conexão no app.ts
export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error);
    process.exit(1);
  }
};
