# WEBSERVICE-NODE-PESSOA-ENDERECO

O projeto é um webservice para tratamneto de pessoa e endereço. Este e apenas o primeiro passo. O projeto final tratara individualmente as pessoas (Fisica, Juridica e Estrangeira).

**projeto Node.js com npm**. Assim você terá uma API completa em **Express + TypeORM**, 
com tratamento de erros, respostas padronizadas e logging.

---

## Passo 1 – Inicializar Projeto
No banco de dados:
```plsql
DROP TABLE teste.endereco;
CREATE TABLE teste.endereco (
    id                      serial4 NOT NULL,
    cep                     numeric(8) NOT NULL,
    logradouro              varchar(100) NOT NULL,
    complemento             varchar(100) NULL,
    cidade                  varchar(100) NOT NULL,
    estado                  bpchar(2) NOT NULL,
    CONSTRAINT uq_endereco_cep UNIQUE (cep),
    CONSTRAINT pk_endereco PRIMARY KEY (id)
);

-- Permissions
ALTER TABLE teste.endereco OWNER TO user_admin;
GRANT ALL ON TABLE teste.endereco TO user_admin;

-- Preenchimento:
INSERT INTO teste.endereco
(logradouro, cidade, estado, cep) VALUES
    ('Avenida do Canto', 'Palmas', 'TO', '77001000'),   
    ('Travessa das cores', 'Quixada', 'CE', '63900000'),        
    ('Rua das Flores', 'Goiania', 'GO', '74000000');    


DROP TABLE teste.pessoa;
CREATE TABLE teste.pessoa (
    id                      serial4 NOT NULL,
    nome_pessoa             varchar(100) NOT NULL,
    status_ativo            bool DEFAULT true NOT NULL,
    indicador_pessoa        bpchar(1) DEFAULT 'F'::bpchar NOT NULL,
    id_endereco             int4 NOT NULL,
    cpf                     numeric(11) NOT NULL,
    data_nascimento         date NOT NULL,
    CONSTRAINT uq_pessoa_cpf UNIQUE (cpf),
    CONSTRAINT pk_pessoa PRIMARY KEY (id),
    CONSTRAINT fk_pessoa_endereco 
                FOREIGN KEY (id) 
                    REFERENCES teste.endereco(id) 
                        ON DELETE CASCADE
);

-- Permissions
ALTER TABLE teste.pessoa OWNER TO user_admin;
GRANT ALL ON TABLE teste.pessoa TO user_admin;

-- Preenchimento:
INSERT INTO teste.pessoa
(nome_pessoa, cpf, data_nascimento, id_endereco) VALUES
    ('Joao da Silva', '16981545004', '11/10/1960', ?),  
    ('Maria do Rosario', '45948575071', '05/06/1971', ?),
    ('Jose das Folhas', '16269944040', '02/01/1985', ?);

    
```
---

No terminal:
```bash
mkdir webservice-node-pessoa-endereco
cd webservice-node-pessoa-endereco
npm init -y

```
---

## Passo 2 – Estrutura de Pastas
```
webservice-node-pessoa-endereco/
    - src/
        - controllers/
            PessoaController.ts
            EnderecoController.ts
        - db/
            data-source.ts
        - entities/
            Pessoa.ts
            Endereco.ts
        - enums/
            IndicadorPessoa.ts
        - errors/
            AppError.ts
        - middlewares/
            errorHandler.ts
            responseHandler.ts
            loggerHandler.ts
        - repositories/
            PessoaRepository.ts
            EnderecoRepository.ts
        - routes/
            pessoaRoutes.ts
            enderecoRoutes.ts
            index.ts   <-- módulo genérico que une todas as rotas
        - services/
            PessoaService.ts
            EnderecoService.ts
        - utils/
            asyncHandler.ts
        - swagger/
            main.yaml
  app.ts
  app.ts
.env
tsconfig.json
package.json

```
---

## Passo 3 – Instalar Dependências
* -D, --save-dev: Pacote que aparecerá em devDependencies

```bash
npm install express dotenv pg typeorm reflect-metadata joi swagger-ui-express cors yamljs
npm install -D typescript ts-node-dev path copyfiles yamljs @types/express @types/node @types/swagger-ui-express @types/cors
npx tsc --init

```
---

## Passo 4 – Configurar TypeScript
Crie `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2021",                                  
    "module": "commonjs",                                
    "lib": ["es6"],                                      
    "allowJs": true,                                     
    "outDir": "./dist",                                  
    "rootDir": "./src",                                  
    "removeComments": true,                              
    "strict": true,                                      
    "strictPropertyInitialization": false,               
    "esModuleInterop": true,                             
    "experimentalDecorators": true,                      
    "emitDecoratorMetadata": true,                       
    "skipLibCheck": true,                                
    "forceConsistentCasingInFileNames": true             
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}

```
---

## Passo 5 – Código Principal

### Passo 5.1 – Códigos básicos da aplicação

**src/errors/AppError.ts**
```ts
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

```
---

**src/middlewares/errorHandler.ts**
```ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      data: null,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
    data: null,
  });
}

```
---

**src/middlewares/responseHandler.ts**
```ts
import { Request, Response, NextFunction } from 'express';

export function successHandler(req: Request, res: Response, next: NextFunction) {
  res.success = (data: any, message = 'Operação realizada com sucesso') => {
    res.json({
      status: 'success',
      message,
      data,
    });
  };
  next();
}

```
---

**src/middlewares/loggerHandler.ts**
```ts
import { Request, Response, NextFunction } from 'express';

export function loggerHandler(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const originalJson = res.json;

  res.json = function (body: any) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${duration}ms`);
    console.log('Request body:', req.body);
    console.log('Response:', body);
    return originalJson.call(this, body);
  };

  next();
}

```
---


### Passo 5.2 – Entidades e Auxiliares:

**src/enuns/IndicadorPessoaEnum.ts**
```ts
import { AppError } from "../errors/AppError";

export enum IndicadorPessoaEnum {
  FISICA = '1',
  JURIDICA = '2',
  ESTRANGEIRA = '3',
}

export const IndicadorPessoaLabel: Record<string, string> = {
  [IndicadorPessoaEnum.FISICA]: 'Pessoa Física',
  [IndicadorPessoaEnum.JURIDICA]: 'Pessoa Jurídica',
  [IndicadorPessoaEnum.ESTRANGEIRA]: 'Pessoa Estrangeira',
};

export const validarIndicadorPessoa = (valor: any): IndicadorPessoaEnum => {
  if (!Object.values(IndicadorPessoaEnum).includes(valor)) {
    throw new AppError(
      `Indicador '${valor}' inválido. Use: 1 (Física), 2 (Jurídica) ou 3 (Estrangeira)`, 
      400
    );
  }
  return valor as IndicadorPessoaEnum;
};

```
---

**src/entities/Endereco.ts**
```ts

import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'endereco', schema: 'teste' })
@Unique(['cep'])
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 8, scale: 0 })
  cep: number;

  @Column({ type: 'varchar', length: 100 })
  logradouro: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complemento: string;

  @Column({ type: 'varchar', length: 100 })
  cidade: string;

  @Column({ type: 'char', length: 2 })
  estado: string;
  
  @ManyToOne(() => Pessoa, pessoa => pessoa.enderecos)
  pessoa: Pessoa;
}

```
---

** src/entities/Pessoa.ts **
```ts
import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToOne, JoinColumn } from 'typeorm';
import { Endereco } from './Endereco'; 

@Entity({ name: 'pessoa', schema: 'teste' })
@Unique(['cpf'])
export class Pessoa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome_pessoa', type: 'varchar', length: 100 })
  nomePessoa: string;

  @Column({ name: 'status_ativo', type: 'boolean', default: true })
  statusAtivo: boolean;

  @Column({ name: 'indicador_pessoa', type: 'char', length: 1, default: 'F' })
  indicadorPessoa: string;

  @Column({ type: 'numeric', precision: 11, scale: 0 })
  cpf: number;

  @Column({ name: 'data_nascimento', type: 'date' })
  dataNascimento: Date;

  @OneToOne(() => Endereco, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_endereco' })
  endereco: Endereco;
}

```
---


### Passo 5.3 – Mapeamento e Acesso aos dados do Banco de dados

**src/db/data-source.ts**
```ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Pessoa } from '../entities/Pessoa';
import { Endereco } from '../entities/Endereco';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'seu_usuario',
  password: 'sua_senha',
  database: 'sua_base',
  synchronize: true,
  logging: false,
  entities: [Pessoa, Endereco],
});

```
---

**src/repositories/PessoaRepository.ts**
```ts
import { AppDataSource } from '../db/data-source';
import { Pessoa } from '../entities/Pessoa';

export const PessoaRepository = AppDataSource.getRepository(Pessoa);

```
---

**src/repositories/EnderecoRepository.ts**
```ts
import { AppDataSource } from '../db/data-source';
import { Endereco } from '../entities/Endereco';

export const EnderecoRepository = AppDataSource.getRepository(Endereco);

```
---


### Passo 5.4 – Services identificamos as regras de negocio

**src/services/PessoaService.ts**
```ts
import { PessoaRepository } from '../repositories/PessoaRepository';
import { Pessoa } from '../entities/Pessoa';
import { AppError } from '../errors/AppError';

export class PessoaService {
  async criarPessoa(dados: Partial<Pessoa>) {
    if (!dados.cpf) throw new AppError('CPF é obrigatório', 422);
    const pessoa = PessoaRepository.create(dados);
    return await PessoaRepository.save(pessoa);
  }

  async obterPessoa(id: number) {
    const pessoa = await PessoaRepository.findOne({
      where: { id },
      relations: ['enderecos'],
    });
    if (!pessoa) throw new AppError('Pessoa não encontrada', 404);
    return pessoa;
  }
}

```
---

**src/services/EnderecoService.ts**
```ts
import { EnderecoRepository } from '../repositories/EnderecoRepository';
import { Endereco } from '../entities/Endereco';
import { AppError } from '../errors/AppError';

export class EnderecoService {
  async criarEndereco(dados: Partial<Endereco>) {
    if (!dados.pessoa) throw new AppError('Pessoa associada é obrigatória', 422);
    const endereco = EnderecoRepository.create(dados);
    return await EnderecoRepository.save(endereco);
  }

  async listarEnderecosPorPessoa(pessoaId: number) {
    return await EnderecoRepository.find({
      where: { pessoa: { id: pessoaId } },
    });
  }
}

```
---


### Passo 5.5 – Acesso a A#Splicação via URL

**src/controllers/PessoaController.ts**
```ts
import { Router } from 'express';
import { PessoaService } from '../services/PessoaService';

const router = Router();
const pessoaService = new PessoaService();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', asyncHandler(async (req, res) => {
  const pessoa = await pessoaService.criarPessoa(req.body);
  res.success(pessoa, 'Pessoa criada com sucesso');
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const pessoa = await pessoaService.obterPessoa(Number(req.params.id));
  res.success(pessoa, 'Pessoa encontrada');
}));

export default router;

```
---

**src/controllers/EnderecoController.ts**
```ts
import { Router } from 'express';
import { EnderecoService } from '../services/EnderecoService';

const router = Router();
const enderecoService = new EnderecoService();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', asyncHandler(async (req, res) => {
  const endereco = await enderecoService.criarEndereco(req.body);
  res.success(endereco, 'Endereço criado com sucesso');
}));

router.get('/pessoa/:pessoaId', asyncHandler(async (req, res) => {
  const enderecos = await enderecoService.listarEnderecosPorPessoa(Number(req.params.pessoaId));
  res.success(enderecos, 'Endereços encontrados');
}));

export default router;

```
---


### Passo 5.6 – Rotas de Acesso as Controllers da Aplicação

**src/routes/pessoaRoutes.ts**
```ts
import { Router } from 'express';
import { PessoaService } from '../services/PessoaService';

const router = Router();
const pessoaService = new PessoaService();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', asyncHandler(async (req, res) => {
  const pessoa = await pessoaService.criarPessoa(req.body);
  res.success(pessoa, 'Pessoa criada com sucesso');
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const pessoa = await pessoaService.obterPessoa(Number(req.params.id));
  res.success(pessoa, 'Pessoa encontrada');
}));

export default router;

```
---

**src/routes/enderecoRoutes.ts**
```ts
import { Router } from 'express';
import { EnderecoService } from '../services/EnderecoService';

const router = Router();
const enderecoService = new EnderecoService();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', asyncHandler(async (req, res) => {
  const endereco = await enderecoService.criarEndereco(req.body);
  res.success(endereco, 'Endereço criado com sucesso');
}));

router.get('/pessoa/:pessoaId', asyncHandler(async (req, res) => {
  const enderecos = await enderecoService.listarEnderecosPorPessoa(Number(req.params.pessoaId));
  res.success(enderecos, 'Endereços encontrados');
}));

export default router;

```
---

**src/routes/index.ts**
```ts
import { Router } from 'express';
import pessoaRoutes from './pessoaRoutes';
import enderecoRoutes from './enderecoRoutes';

const router = Router();

// cada rota é montada em seu prefixo
router.use('/pessoas', pessoaRoutes);
router.use('/enderecos', enderecoRoutes);

export default router;

```
---


### Passo 5.7 – Codigos principal da Aplicação

**src/app.ts**
```ts
import express from 'express';
import { successHandler } from './middlewares/responseHandler';
import { errorHandler } from './middlewares/errorHandler';
import { loggerHandler } from './middlewares/loggerHandler';
import routes from './routes';

const app = express();
app.use(express.json());

// middlewares globais
app.use(loggerHandler);
app.use(successHandler);

// módulo genérico de rotas
app.use(routes);

// middleware de erro no final
app.use(errorHandler);

export default app;

```
---

**src/server.ts**
```ts
import { AppDataSource } from './db/data-source';
import app from './app';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => console.error('Erro ao inicializar DataSource:', error));

```
---


### Passo 5.8 – Scripts no `package.json`
```json
{
  "name": "webservice-node-pessoa-endereco",
  "version": "1.0.0",
  "description": "",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc && copyfiles -u 1 src/swagger/* dist/ && copyfiles -u 1 \"src/docs/*.*\" dist",
    "start": "node dist/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "joi": "^18.0.2",
    "pg": "^8.18.0",
    "reflect-metadata": "^0.2.2",
    "swagger-ui-express": "^5.0.1",
    "typeorm": "^0.3.28"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^25.3.0",
    "@types/swagger-ui-express": "^4.1.8",
    "copyfiles": "^2.4.1",
    "cross-env": "^10.1.0",
    "nodemon": "^3.1.14",
    "path": "^0.12.7",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3",
    "yamljs": "^0.3.0"
  }
}

```
---

## Passo 6 – Swagger (Documentação)

### 6.1 Configuração com modulo typescript

**src/config/swagger.ts:**
```typescript
export const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "WEBSERVICE-NODE-PESSOA",
        description: "API para Entidades com Node.js e TypeORM",
        version: "1.0.0"
    },
    servers: [{ url: "http://localhost:3000" }]
    paths: {
        "/api/v1/pessoa": {
            "get": {
                "summary": "Lista todas as pessoas",
                "responses": { "200": { "description": "Sucesso" } }
            },
            "post": {
                "summary": "Cria uma nova pessoa",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "cpf": { "type": "string" },
                                    "email": { "type": "string" },
                                    "nomeCompleto": { "type": "string" }
                                }
                            }
                        }
                    }
                },
                "responses": { "201": { "description": "Criado" } }
            }
        }
    }
};

```
---

*Configuração do Swagger UI (Visualização no Browser)*

**src/app.ts**
```typescript
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// módulo genérico de rotas
app.use(routes);

// middleware de erro no final
app.use(errorHandler);

export default app;

```
---

## 6.2 - Configuração com arquivos YAML

Para configuração com de Yaml, verifique se os seguintes pacotes estão instalados, se não use:
```bash
npm install -D path yamljs copyfiles

```
---

**src/swagger/main.yaml:**
```yaml
openapi: 3.0.0
info:
  title: WEBSERVICE-NODE-PESSOA
  description: API para Entidades com Node.js e TypeORM
  version: 1.0.0

paths:
  /pessoa:
    get:
      summary: Lista todas as pessoas
      responses:
        "200":
          $ref: '#/components/responses/Sucesso'
        "400":
          $ref: '#/components/responses/Erro'
    post:
      summary: Cria uma nova pessoa
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Pessoa'
      responses:
        "201":
          $ref: '#/components/responses/Criado'
        "400":
          $ref: '#/components/responses/Erro'

  /pessoa/{id}:
    get:
      summary: Busca uma Pessoa por ID com filtros
      parameters:
        - name: id
          in: path
          required: true
          description: O ID numérico do Pessoa
          schema:
            type: integer
            format: int64
        - name: includeDetails
          in: query
          required: false
          description: Define se deve retornar detalhes extras
          schema:
            type: boolean
            default: false
        - name: X-Request-ID
          in: header
          required: false
          schema:
            type: string
            format: uuid
      responses:
        "200":
          $ref: '#/components/responses/Sucesso'
        "404":
          $ref: '#/components/responses/Erro'

components:
  schemas:
    Pessoa:
      type: object
      required:
        - nomePessoa
        - indicadorPessoa
        - cpf
        - dataNascimento
      properties:
        nomePessoa:
          description: Nome completo da pessoa
          type: string
          maxLength: 100
          example: "João Silva"
        statusAtivo:
          description: Indica se o registro está ativo
          type: boolean
          default: true
        indicadorPessoa:
          description: Tipo de pessoa (Fisica ou Juridica)
          type: string
          enum: [F, J] # Substitua pelos valores reais do seu Enum
          default: F
        cpf:
          description: CPF sem pontuação (11 dígitos)
          type: number
          minimum: 00000000001
          maximum: 99999999999
          example: 79110377018
        dataNascimento:
          description: Data de nascimento no formato YYYY-MM-DD
          type: string
          format: date
          example: "1990-05-15"
        idEndereco:
          type: integer
          description: ID do endereço
          example: 1      
        endereco:
          $ref: '#/components/schemas/Endereco'

    Endereco:
      type: object
      required:
        - cep
        - logradouro
        - cidade
        - estado
      properties:
        cep:
          description: CEP numérico de 8 dígitos (sem hífen)
          type: integer
          minimum: 01000000
          maximum: 99999999
          example: 74000100
        logradouro:
          description: Nome da rua, avenida ou logradouro
          type: string
          maxLength: 100
          example: "Avenida Central"
        complemento:
          description: Informações adicionais (apartamento, bloco, etc)
          type: string
          maxLength: 100
          nullable: true
          example: "Bloco B, Apto 201"
        cidade:
          description: Nome da cidade
          type: string
          maxLength: 100
          example: "Goiânia"
        estado:
          description: Sigla da Unidade Federativa (UF)
          type: string
          minLength: 2
          maxLength: 2
          example: "GO"

    ErrorResponse:
      type: object
      properties:
        code:
            description: Código numérico do erro
            type: integer
        message:
            description: Mensagem de erro legível
            type: string
        details:
            description: Lista de detalhes adicionais sobre o erro
            type: array
            items:
              type: string

  responses:
    Sucesso:
      description: Operação realizada com sucesso
    Criado:
      description: Recurso criado com sucesso
    Erro:
      description: Ocorreu um erro inesperado
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

```
---

*Configuração do Swagger UI (Visualização no Browser)*

**src/app.ts**
```typescript
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
const swaggerDocument = YAML.load(path.join(__dirname, './swagger/main.yaml'));

// app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// módulo genérico de rotas
app.use(routes);

// middleware de erro no final
app.use(errorHandler);

export default app;

```
---
