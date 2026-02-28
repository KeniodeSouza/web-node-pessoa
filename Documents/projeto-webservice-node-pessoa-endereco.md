# WEBSERVICE-NODE-PESSOA-ENDERECO

O projeto é um webservice para tratamneto de pessoa e endereço. Este e apenas o primeiro passo.

> O projeto final tratará individualmente as pessoas (Fisica, Juridica e Estrangeira).

**projeto Node.js com npm**. Assim você terá uma API completa em **Express + TypeORM + JOI**,
com tratamento de erros, respostas padronizadas e logging. A documentação terá o **swagger-ui** como interface de acesso as API's.

---

## Passo 1 – Inicializar Projeto
No banco de dados:
```plsql
DROP TABLE teste.endereco;
CREATE TABLE teste.endereco (
    id                      serial4 NOT NULL,
    cep                     numeric(8) NOT NULL,
    logradouro              varchar(100) NOT NULL,
    bairro		            varchar(100) NULL,
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
(logradouro, bairro, cidade, estado, cep) VALUES
    ('Avenida do Canto', 'Centro', 'Palmas', 'TO', '77001000'),
    ('Travessa das cores', 'Centro', 'Quixada', 'CE', '63900000'),
    ('Rua 1', 'Centro', 'Goiania', 'GO', '74000002');
    ('Praça dos Bandeirantes', 'Centro', 'Goiania', 'GO', '74000001');


DROP TABLE teste.pessoa;
CREATE TABLE teste.pessoa (
    id                      serial4 NOT NULL,
    nome_pessoa             varchar(100) NOT NULL,
    status_ativo            bool DEFAULT true NOT NULL,
    indicador_pessoa        bpchar(1) DEFAULT 'F'::bpchar NOT NULL,
    id_endereco             int4 NOT NULL,
    cpf                     numeric(11) NOT NULL,
    data_nascimento         date NOT NULL,
	email					varcha(100) NULL,
    complemento             varchar(100) NULL,
    CONSTRAINT uq_pessoa_cpf UNIQUE (cpf),
    CONSTRAINT pk_pessoa PRIMARY KEY (id),
    CONSTRAINT fk_pessoa_endereco
                FOREIGN KEY (id_endereco)
                    REFERENCES teste.endereco(id)
                        ON DELETE RESTRICT
);
-- Permissions
ALTER TABLE teste.pessoa OWNER TO user_admin;
GRANT ALL ON TABLE teste.pessoa TO user_admin;

-- Preenchimento:
INSERT INTO teste.pessoa
(nome_pessoa, cpf, data_nascimento, email, id_endereco) VALUES
    ('Joao da Silva', '16981545004', 'joao.silva@dominio.com.br', '11/10/1960', ?),
    ('Maria do Rosario', '45948575071', 'maria.rosario@dominio.com.br', '05/06/1971', ?),
    ('Jose das Folhas', '16269944040', 'jose.folha@dominio.com.br', '02/01/1985', ?);

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
```text
webservice-node-pessoa-endereco/
├── Documents/
├── dist/
├── src/
│    ├── controllers/
│    ├── db/
│    ├── entities/
│    ├── enums/
│    ├── errors/
│    ├── middlewares/
│    ├── repositories/
│    │   └── migrations/
│    ├── routes/
│    ├── services/
│    ├── utils/
│    ├── swagger/
│    ├── app.ts
│    └── server.ts
├── .env
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
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
Altere o arquivo `tsconfig.json` para os seguintes parametros:
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
  // Erros manipulados:
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      data: null
    });
  }

  // Erros de sistema incontrolados:
  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
    data: null,
    // Em desenvolvimento, você pode incluir o stack trace para facilitar o debug
    stack: process.env.APP_ENV === 'development' ? err.stack : undefined,
  });
}
```
---

**src/middlewares/responseHandler.ts**
```ts
import { Request, Response, NextFunction } from 'express';

// Definimos o que a nossa resposta tem de especial
export interface CustomResponse extends Response {
  success(data: any, message?: string): void;
}

export function responseHandler(req: Request, res: Response, next: NextFunction) {
  // 2. Define a implementação do método
 (res as CustomResponse).success = (data: any, message = 'Operação realizada com sucesso') => {
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

import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Pessoa } from './Pessoa';

@Entity({ name: 'endereco', schema: 'teste' })
@Unique(['cep']) // Adicionada a CONSTRAINT endereco_unique UNIQUE (cep)
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 8, scale: 0 })
  cep: number;

  @Column({ type: 'varchar', length: 100 })
  logradouro: string;

  @Column({ type: 'varchar', length: 100 })
  bairro: string;

  @Column({ type: 'varchar', length: 100 })
  cidade: string;

  @Column({ type: 'char', length: 2 })
  estado: string;

  // Relacionamento: Um endereço para MUITAS pessoas
  @OneToMany(() => Pessoa, (pessoa) => pessoa.endereco)
  pessoas: Pessoa[];

}

```
---

** src/entities/Pessoa.ts **
```ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IndicadorPessoaEnum } from '../enums/IndicadorPessoaEnum';
import { Endereco } from './Endereco';

@Entity({ name: 'pessoa', schema: 'teste' })
@Unique(['cpf'])    // CONSTRAINT uq_pessoa
export class Pessoa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome_pessoa', type: 'varchar', length: 100 })
  nomePessoa: string;

  @Column({ name: 'status_ativo', type: 'boolean', default: true })
  statusAtivo: boolean;

  @Column({ name: 'indicador_pessoa', type: 'char', length: 1,
                    enum: IndicadorPessoaEnum, default: IndicadorPessoaEnum.FISICA })
  indicadorPessoa: IndicadorPessoaEnum;

  @Column({ name: 'id_endereco', type: 'int4', nullable: true })
  idEndereco: number | null;

  @Column({ type: 'numeric', precision: 11, scale: 0 })
  cpf: number;

  @Column({ name: 'data_nascimento', type: 'date' })
  dataNascimento: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  complemento: string | null;

  // RELACIONAMENTO: Muitas pessoas para UM endereço
  @ManyToOne(() => Endereco, (endereco) => endereco.pessoas)
  @JoinColumn({ name: 'id_endereco' }) // A FK fica aqui na tabela Pessoa
  endereco: Endereco;

}

```
---


### Passo 5.3 – Mapeamento e Acesso aos dados do Banco de dados

#### 5.3.1 - Modulos de configuração e conexão do banco de dados
**src/db/data-source.ts**
```ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Endereco } from '../entities/Endereco';
import { Pessoa } from '../entities/Pessoa';
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Pessoa, Endereco],
  logging: false,                        // Exibe Query na console: true ou nao false
  synchronize: false,                    // True: Não existencia de tabela. False: Tabelas ja criadas
});

```
---

**src/db/connectDB.ts**
```ts
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
```
---

#### 5.3.2 - Manipulação dos dados do banco de dados

**src/repositories/EnderecoRepository.ts**
```ts
import { Repository, DataSource } from 'typeorm';
import { AppDataSource } from '../db/data-source';
import { Endereco } from '../entities/Endereco';

export class EnderecoRepository {
    private repo: Repository<Endereco>;
     private dataSource: DataSource;

    constructor() {
        this.dataSource = AppDataSource;
        this.repo = this.dataSource.getRepository(Endereco);
    }

    async findAll() {
        return await this.repo.find({
            order: { logradouro: "ASC" },
        });
    }

    async findById(id: number) {
        return await this.repo.findOne({
            where: { id }
        });
    }
 
    async findByCep(cep: any) {
        return await this.repo.findOne({
            where: { cep }
        });
    }  

    async insert(dados: Partial<Endereco>) {
        const instance = this.repo.create(dados);
        return await this.repo.save(instance);
    }

    async update(id: number, dados: Partial<Endereco>) {
        // Usar preload é uma forma elegante de preparar um update no TypeORM
        const dadosAtualizar = await this.repo.preload({
                                                id: id,
                                                ...dados
                                            });

        if (!dadosAtualizar) {
            throw new Error(`Endereço com ID ${id} não encontrado.`);
        }                                            

        return await this.repo.save(dadosAtualizar);
    }

}    
```
---

**src/repositories/PessoaRepository.ts**
```ts
import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../db/data-source';
import { Pessoa } from '../entities/Pessoa';

export class PessoaRepository {
    private repo: Repository<Pessoa>;
     private dataSource: DataSource;

    constructor() {
        this.dataSource = AppDataSource;
        this.repo = this.dataSource.getRepository(Pessoa);
    }
    
    async createNew(dados: any) {
        // Usamos query parameters ($1, $2...) para evitar SQL Injection
        const sql = `
            WITH dados (indicador_pessoa, nome_pessoa, cpf, email, data_nascimento, complemento, cep) AS (
                VALUES (
                    $1::char(1),        -- indicador_pessoa 
                    $2::varchar,        -- Nome completo da pessoa 
                    $3::numeric(11),    -- CPF da pessoa 
                    $4::varchar,        -- Email de contato
                    $5::date,           -- Data de Nascimento da pessoa
                    $6::varchar,        -- Complemento do endereco
                    $7::numeric(8)      -- Cep do Endereço da Pessoa
                )
            )
            INSERT INTO teste.pessoa (indicador_pessoa, nome_pessoa, cpf, email, data_nascimento, complemento, id_endereco)
                SELECT dd.indicador_pessoa, dd.nome_pessoa, dd.cpf, dd.email, dd.data_nascimento, dd.complemento, te.id
                FROM dados dd
                    INNER JOIN teste.endereco te 
                        ON te.cep = dd.cep
            RETURNING *;
            `;

        const values = [
                    dados.indicadorPessoa,      // O valor será 'F' ou 'J'//
                    dados.nomePessoa,
                    dados.cpf,
                    dados.email,
                    dados.dataNascimento,
                    dados.complemento,
                    dados.cep
                ];

        // Executa a query bruta e retorna o resultado
        const result = await this.dataSource.query(sql, values);
        return result[0];   // Retorna os dados do registro inserido (devido ao RETURNING *)    }
    }

    async findAll() {
        return await this.repo.find({
            relations: ['endereco'],
            order: { nomePessoa: "ASC" }
        });
    }

    async findById(id: any) {
        return await this.repo.findOne({
            where: { id },
            relations: ['endereco']  
        });
    }
 
    async findByCpf(cpf: any) {
        return await this.repo.findOne({
            where: { cpf },
            relations: ['endereco'] // Incluindo relações se necessário
        });
    }  
}

```
---

### Passo 5.4 – Services para Regra de negocios

**src/services/PessoaService.ts**
```ts
import { AppError } from '../errors/AppError';
import { PessoaRepository } from '../repositories/PessoaRepository';

export class PessoaService {
  private repository: PessoaRepository;

  constructor() {
    this.repository = new PessoaRepository();
  }

  async createNew(dados: any) {
    const retorno = await this.repository.createNew(dados);
    if (!retorno) 
        throw new AppError('Pessoa não criado', 404);

    return retorno;
  }

  async findAll() {
    const lista = await this.repository.findAll();
    
    if (!lista || lista.length === 0) {
      throw new AppError('Nenhuma pessoa encontrada', 404);
    }
    
    return lista;
  }

  async findById(id: any) {
    const retorno = await this.repository.findById(id);
    if (!retorno) 
        throw new AppError(`Pessoa com ID ${id} não encontrada`, 404);

    return retorno;
  }

  async findByCpf(cpf: any) {
    const retorno = await this.repository.findByCpf(cpf);
  
    if (!retorno) {
      throw new AppError(`Pessoa com CPF ${cpf} não encontrada`, 404);
    }

    return retorno;
  }

}

```
---

**src/services/EnderecoService.ts**
```ts
import { Endereco } from '../entities/Endereco';
import { AppError } from '../errors/AppError';
import { EnderecoRepository } from '../repositories/EnderecoRepository';

export class EnderecoService {
  private repository: EnderecoRepository;

  constructor() {
    this.repository = new EnderecoRepository();
  }

  async findAll() {
    const lista = await this.repository.findAll();
    if (!lista) {
      throw new AppError('Endereço não foi encontrado', 404);
    }

    return lista;
  }

  async findById(id: any) {
    const retorno = await this.repository.findById(id);
    if (!retorno) 
        throw new AppError(`Endereço com Id ${id} não foi encontrado`, 404);

    return retorno;
  }

  async findByCep(cep: any) {
    const retorno = await this.repository.findByCep(cep);
    if (!retorno) {
      throw new AppError(`Endereço com CEP ${cep} não foi encontrado`, 404);
    }

    return retorno;
  }

    async criar(dados: Partial<Endereco>) {
        // 1. Validar se o CNPJ já existe (Regra de Negócio)
        const jaExiste = await this.repository.findByCep(dados.cep);
        if( jaExiste ) {
            throw { status: 409, message: "Este CEP já está cadastrado no sistema." };
        }

        return await this.repository.insert(dados);
    }
    
    async atualizar(id: any, dados: Partial<Endereco>) {
        const jaExiste = await this.repository.findById(id);
        if (!jaExiste) {
            throw { status: 404, message: "Endereço não encontrado para atualização." };
        }

        // Merge de dados para atualização parcial
        return await this.repository.update(id, dados);
    }
    
}

```
---

### Passo 5.5 – Acesso a Aplicação

- Classe abstrata generica para Controllers

**src/controllers/BaseController.ts**
```ts
import { Request, Response, NextFunction } from 'express';
import { Repository, EntityTarget, ObjectLiteral, DeepPartial } from 'typeorm';
import { AppDataSource } from '../db/data-source';

export abstract class BaseController<T extends ObjectLiteral> {
    protected repository: Repository<T>;

    constructor(entity: EntityTarget<T>) {
        this.repository = AppDataSource.getRepository(entity);
    }

    // LISTAR TODOS
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.repository.find();
            return res.json(data);
        } catch (error) {
            next(error);
        }
    };

    // OBTER UM POR ID
    getOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.repository.findOneBy({ id: id as any });
            
            if (!result) {
                return res.status(404).json({ message: 'Registro não encontrado' });
            }
            
            return res.json(result);
        } catch (error) {
            next(error);
        }
    };

    // CRIAR NOVO (POST)
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const entityData = req.body;
            // O método .create() apenas instancia, o .save() persiste no banco
            const newItem = this.repository.create(entityData as DeepPartial<T>);
            const result = await this.repository.save(newItem);
            
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    // ATUALIZAR (PUT/PATCH)
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Verificamos se o registro existe antes de tentar atualizar
            const item = await this.repository.findOneBy({ id: id as any });
            if (!item) {
                return res.status(404).json({ message: 'Registro não encontrado para atualização' });
            }

            // O método .merge() combina os dados novos com os existentes
            this.repository.merge(item, updateData);
            const result = await this.repository.save(item);

            return res.json(result);
        } catch (error) {
            next(error);
        }
    };

    // DELETAR
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const deleteResult = await this.repository.delete(id);

            if (deleteResult.affected === 0) {
                return res.status(404).json({ message: 'Registro não encontrado para exclusão' });
            }

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}

```
---

**src/controllers/PessoaController.ts**
```ts
import { Router, Request, Response, NextFunction } from 'express';
import { PessoaService } from '../services/PessoaService';
import { Pessoa } from '../entities/Pessoa';
import { BaseController } from './BaseController';

const router = Router();
const service = new PessoaService();

export class PessoaController extends BaseController<Pessoa> {
	private service = new PessoaService();

    constructor() {
        super(Pessoa);
        this.service = new PessoaService();
    }
	
    // adiciona ou sobrescreve o método de criação com lógica de negócio
	// Os dados já chegam validados pelo Middleware do Joi
	
    createNew = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.createNew(req.body);
            return res.status(201).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    };
	// Implementação do getAll
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.findAll();
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    getForId = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        try {
            const result = await this.service.findById(id);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    getForCpf = async (req: Request, res: Response, next: NextFunction) => {
        const { cpf } = req.params;

        try {
            const result = await this.service.findByCpf(cpf);
            return res.status(201).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    };
}

```
---

**src/controllers/EnderecoController.ts**
```ts
import { Router, Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { Endereco } from '../entities/Endereco';
import { Pessoa } from '../entities/Pessoa';
import { EnderecoService } from '../services/EnderecoService';

const router = Router();
const service = new EnderecoService();

export class EnderecoController extends BaseController<Pessoa> {
	  private service = new EnderecoService();

    constructor() {
        super(Endereco);
        this.service = new EnderecoService();
    }

    // Sobrescreve ou adiciona o método de criação com lógica de negócio
    // Os dados já chegam validados pelo Middleware do Joi

	// Implementação do getAll
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.findAll();
            return res.status(200).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    }

    getForId = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const idNum = Number(id);
    
        try {
            const result = await this.service.findById(idNum);
            return res.status(200).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    }

    getForCep = async (req: Request, res: Response, next: NextFunction) => {
        const { cep } = req.params;
    
        try {
            // Os dados já chegam validados pelo Middleware do Joi
            const result = await this.service.findByCep(cep);
            return res.status(200).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    }    

	// Implementação do create
     create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Os dados já chegam validados pelo Middleware do Joi
            const result = await this.service.criar(req.body);
            return res.status(201).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    };
 
    // Implementação do Update
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const result = await this.service.atualizar(id, req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    };
}

```
---

### Passo 5.6 – Rotas de Acesso as Controllers da Aplicação

**src/routes/pessoaRoutes.ts**
```ts
import { Router } from 'express';
import { PessoaController } from '../controllers/PessoaController';
import { validateRequest } from '../middlewares/validateRequest';
import { pessoaIdSchema, pessoaCpfSchema, pessoaCreateSchema, pessoaUpdateSchema } from '../schemas/pessoa.schema';

const router = Router();
const controller = new PessoaController();

// Rotas de acesso a entidade
router.get('/', 
                controller.getAll);
router.get('/:id', 
                validateRequest(pessoaIdSchema, 'params'), 
                controller.getForId);
router.get('/cpf/:cpf',  
                validateRequest(pessoaCpfSchema, 'params'), 
                controller.getForCpf);
                
// Rotas de manutenção da entidade
router.post('/', 
                validateRequest(pessoaCreateSchema, 'body'), 
                controller.createNew);

router.put('/:id', 
                validateRequest(pessoaIdSchema, 'params'),
                validateRequest(pessoaUpdateSchema, 'body'), 
                controller.update);

export default router;

```
---

**src/routes/enderecoRoutes.ts**
```ts
import { Router } from 'express';
import { EnderecoController } from '../controllers/EnderecoController';
import { validateRequest } from '../middlewares/validateRequest';
import { enderecoIdSchema, enderecoCepSchema, enderecoCreateSchema, enderecoUpdateSchema } from '../schemas/endereco.schema';

const router = Router();
const controller = new EnderecoController();

// Rotas de acesso a entidade
router.get('/', 
                controller.getAll);
router.get('/:id', 
                validateRequest(enderecoIdSchema, 'params'), 
                controller.getForId);
router.get('/cep/:cep',
                validateRequest(enderecoCepSchema, 'params'), 
                controller.getForCep);

// Rotas de manutenção das entidades
router.post('/', 
                validateRequest(enderecoCreateSchema, 'body'), 
                controller.create);

router.put('/:id', 
                validateRequest(enderecoIdSchema, 'params'),
                validateRequest(enderecoUpdateSchema, 'body'), 
                controller.update);
				
router.delete('/:id', 
				validateRequest(enderecoIdSchema, 'params'), 
				controller.delete);

export default router;


```
---

- Modulo de centralização das Rotas

**src/routes/index.ts**
```ts
import { Router } from 'express';
import pessoaRoutes from './pessoaRoutes';
import enderecoRoutes from './enderecoRoutes';

const router = Router();

// Cada rota é montada com seu prefixo
router.use('/pessoa', pessoaRoutes);
router.use('/endereco', enderecoRoutes);

export default router;

```
---

## Passo 5.7 – Swagger (Documentação)

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
              $ref: '#/components/schemas/PessoaNova'
      responses:
        "201":
          $ref: '#/components/responses/Criado'
        "400":
          $ref: '#/components/responses/Erro'

  /pessoa/{id}:
    get:
      summary: Busca por filtro, uma Pessoa por ID
      parameters:
        - name: id
          description: O ID numérico do Pessoa
          in: path
          required: true
          schema:
            type: integer
            format: int64
      responses:
        "200":
          $ref: '#/components/responses/Sucesso'
        "404":
          $ref: '#/components/responses/Erro'

  /pessoa/cpf/{cpf}:
    get:
      summary: Busca por filtro, uma Pessoa por CPF
      parameters:
        - name: cpf
          description: CPF sem pontuação (11 dígitos)
          in: path
          required: true
          schema:
            type: string
            pattern: '^[0-9]{11}$'
            minLength: 11
            maxLength: 11
          example: "79110377022"
      responses:
        "200":
          $ref: '#/components/responses/Sucesso'
        "404":
          $ref: '#/components/responses/Erro'

  /endereco:
    get:
      summary: Lista todas os Endereços
      responses:
        "200":
          $ref: '#/components/responses/Sucesso'
        "400":
          $ref: '#/components/responses/Erro'
    post:
      summary: Cria uma novo Endereco
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EnderecoNovo'
      responses:
        "201":
          $ref: '#/components/responses/Criado'
        "400":
          $ref: '#/components/responses/Erro'

  /endereco/{id}:
    get:
      summary: Busca por filtro, um Endereço por ID
      parameters:
        - name: id
          description: O ID numérico do Endereço
          in: path
          required: true
          schema:
            type: integer
            format: int64
      responses:
        "200":
          $ref: '#/components/responses/Sucesso'
        "404":
          $ref: '#/components/responses/Erro'

    put:
      summary: Atualiza o Endereco
      parameters:
        - name: id
          description: O ID numérico do Endereco
          in: path
          required: true
          schema:
            type: integer
            format: int64
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EnderecoAtual'
      responses:
        "200":
          $ref: '#/components/responses/Sucesso'
        "400":
          $ref: '#/components/responses/Erro'

  /endereco/cep/{cep}:
    get:
      summary: Busca por filtro, uma Pessoa por CEP
      parameters:
        - name: cep
          description: CEP sem pontuação (8 dígitos)
          in: path
          required: true
          schema:
            type: string
            pattern: '^[0-9]{8}$'
            minLength: 8
            maxLength: 8
          example: "74000001"
      responses:
        "200":
          $ref: '#/components/responses/Sucesso'
        "404":
          $ref: '#/components/responses/Erro'

components:
  schemas:
    PessoaNova:
      type: object
      required:
        - nomePessoa
        - indicadorPessoa
        - cpf
        - dataNascimento
        - cep
      properties:
        nomePessoa:
          description: Nome completo da pessoa
          type: string
          maxLength: 100
          example: "Fulano de Tal"
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
          type: string
          pattern: '^[0-9]{11}$'
          minLength: 11
          maxLength: 11          
          example: "79110377022"
        dataNascimento:
          description: Data de nascimento no formato YYYY-MM-DD
          type: string
          format: date
          example: "1990-05-15"
        email:
          description: Email para contacto
          type: string
          example: "FulanoTal@dominio.com.br"
        complemento:
          description: Informações adicionais (quadra, lote, edificio, apartamento, bloco, etc.)
          type: string
          maxLength: 100
          nullable: true
          example: "Bloco B, Apto 201"
        cep:
          description: Código de Endereçamento Postal - Numérico de 8 dígitos (sem pontuação)
          type: string
          pattern: '^[0-9]{8}$'
          minLength: 8
          maxLength: 8          
          example: 74000001

    PessoaAtual:
      type: object
      required:
        - cpf
      properties:
        nomePessoa:
          description: Nome completo da pessoa
          type: string
          maxLength: 100
          example: "Fulano de Tal"
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
          type: string
          pattern: '^[0-9]{11}$'
          minLength: 11
          maxLength: 11          
          example: "79110377022"
        dataNascimento:
          description: Data de nascimento no formato YYYY-MM-DD
          type: string
          format: date
          example: "1990-05-15"
        email:
          description: Email para contacto
          type: string
          example: "FulanoTal@dominio.com.br"
        complemento:
          description: Informações adicionais (quadra, lote, edificio, apartamento, bloco, etc.)
          type: string
          maxLength: 100
          nullable: true
          example: "Bloco B, Apto 201"
        cep:
          description: Código de Endereçamento Postal - Numérico de 8 dígitos (sem pontuação)
          type: string
          pattern: '^[0-9]{8}$'
          minLength: 8
          maxLength: 8          
          example: 74000001

    EnderecoNovo:
      type: object
      required:
        - cep
        - logradouro
        - cidade
        - estado
      properties:
        cep:
          description: Código de Endereçamento Postal - Numérico de 8 dígitos (sem pontuação)
          type: string
          pattern: '^[0-9]{8}$'
          minLength: 8
          maxLength: 8          
          example: 74000001
        logradouro:
          description: Nome de ruas, avenidas, praças, etc.
          type: string
          maxLength: 100
          example: "Avenida Central"
        bairro:
          description: Nome do bairro na cidade
          type: string
          maxLength: 100
          example: "Setor Central"
        cidade:
          description: Nome de cidade
          type: string
          maxLength: 100
          example: "Goiânia"
        estado:
          description: Sigla da Unidade Federativa (UF)
          type: string
          minLength: 2
          maxLength: 2
          example: "GO"

    EnderecoAtual:
      type: object
      required:
        - cep
      properties:
        cep:
          description: Código de Endereçamento Postal - Numérico de 8 dígitos (sem pontuação)
          type: string
          pattern: '^[0-9]{8}$'
          minLength: 8
          maxLength: 8          
          example: 74000001
        logradouro:
          description: Nome de ruas, avenidas, praças, etc.
          type: string
          maxLength: 100
          example: "Avenida Central"
        bairro:
          description: Nome do bairro na cidade
          type: string
          maxLength: 100
          example: "Setor Central"
        cidade:
          description: Nome de cidade
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

### Passo 5.8 – Modulos principais da Aplicação

**src/app.ts**
```ts
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

// Rotas genérico da aplicação
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

const PORT = process.env.APP_PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
          console.log(`Servidor rodando em http://localhost:${PORT}`);
          console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => console.error('Erro ao inicializar DataSource:', error));
  
```
---

## Passo 6 – Arquivos extra para elaboração e execução da aplicacao

- Arquivo de configuração da Aplicação:

**/package.json**
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

- Arquivo com as variáveis de ambiente local:

**/.env**
```text
DB_HOST=localhost
DB_PORT=5432
DB_USER=user_admin
DB_PASS=admin_123
DB_NAME=gestao
APP_ENV=development
APP_PORT=3000
```
---

## Passo 7 – Inicialização do projeto para o GIT

- Arquivo Git para ignorar o processamento de diretorios ou arquivos
**/.gitignore**
```text
# Dependências
node_modules

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/

# Variáveis de Ambiente (SENSÍVEL)
.env
.env.test
.env.production
.env.local

# Build e Saída
dist
dist/
build/
out/

# IDEs e Editores
.vscode/
.idea/
*.swp
*.swo

# Sistema Operacional
.DS_Store
Thumbs.db

# Testes e Coverage
coverage/
.nyc_output

# Compilação TypeScript
tsconfig.tsbuildinfo

# Outros
.npm
package-lock.json

```
---

- Comandos de inicialização do GIT:
```bash

git init
git add .
git commit -m "Primeiro commit para criação do Repostório"
git branch -M main
git remote add origin https://github.com/KeniodeSouza/frontend-app.git
git push -u origin main

```
---

## Passo 8 – Instalar e configurar o Docker

### Passo 8.1 - Instalação das imagens

- Imagem para servidor de banco de dados
**config/Dockerfile**
```dockerfile
# dockerfile
# Utilizando a imagem oficial do PostgreSQL (versão estável)
FROM postgres:latest

# Define variáveis de ambiente necessárias para o banco
ENV POSTGRES_DB=gestao
ENV POSTGRES_USER=USER_admin
ENV POSTGRES_PASSWORD=admin_123

# Expor a porta padrão do PostgreSQL
EXPOSE 5432

# (Opcional) Copia scripts .sql para executar na criação do banco
COPY ./initdb.sql /docker-entrypoint-initdb.d/
```
---

- Comandos:
```bash
# Download da imagem
docker pull postgres

# Criando um novo volume
docker volume create pgdata

# Executando o container de Postgres
docker run --name postgres-db \
			-e POSTGRES_DB=gestao \
			-e POSTGRES_USER=user_admin \
			-e POSTGRES_PASSWORD=admin_123 \
			-p 5432:5432
			-v pgdata:/var/lib/postgresql/data \
			-d postgres
			
# Download da imagem de cliente
docker pull dpage/pgadmin4

# Executando o cliente
docker run --name pgadmin-db \
			-e "PGADMIN_DEFAULT_EMAIL=meu_email@teste.com.br" 
			-e "PGADMIN_DEFAULT_PASSWORD=minha_senha" 
			-p 15432:80 
			-d dpage/pgadmin4			

# No browser entre: https://localhost:15432
			
# Acessando o Postgre via command-line:
docker exec -it postgres-db psql -U postgre

```
---

- Imagem para servidor de aplicação

**config/Dockerfile**
```dockerfile
#
# Estágio de construção
FROM node:18-alpine AS builder

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

#
# Estágio de produção
FROM node:18-alpine

WORKDIR /usr/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/.env .env

EXPOSE 3000

CMD ["node", "dist/server.js"]

```
---

- Comandos:
```bash

```
---


### Passo 7.2 - Execução de container

- Imagem para servidor de aplicação

**config/docker-compose.yml**
```yaml

version: '3.8'

services:
  db:
    image: postgres:latest
    container_name: postgres_db
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      # Opcional: coloca seu script SQL na pasta init para criar as tabelas no boot
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  api:
    build: .
    container_name: node_api
    restart: always
    ports:
      - "3000:3000"
    environment:
      DB_HOST: ${DB_HOST}
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      DB_NAME: ${DB_NAME}
    depends_on:
      - db

volumes:
  postgres_data:
```
---

- Comandos:
```bash
docker-compose up
```
---
