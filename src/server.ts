import { AppDataSource } from './db/data-source';
import app from './app';

const PORT = process.env.APP_PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
          console.log(`Servidor rodando em http://localhost:${PORT}`);
          console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => console.error('Erro ao inicializar DataSource:', error));
  