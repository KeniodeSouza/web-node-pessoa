import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './db/connectDB ';
import { errorHandler } from './middlewares/errorHandler';
import { loggerHandler } from './middlewares/loggerHandler';
import { responseHandler } from './middlewares/responseHandler';
import routes from './routes';


const app = express();
app.use(express.json());

// middlewares globais
app.use(loggerHandler);
app.use(responseHandler);

// Inicializa o banco de dados
connectDB();

// Swagger: Rota da Documentação
const YAML = require('yamljs');
const path = require('path');
const swaggerDocumentYaml = YAML.load(path.join(__dirname, './swagger/main.yaml'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocumentYaml));

// módulo genérico de rotas
app.use(routes);

// middleware de erro no final
app.use(errorHandler);

export default app;
