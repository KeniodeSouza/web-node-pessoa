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
  logging: false,                         // Exibe Query na console: true ou nao false
  synchronize: false,                    // True: Não existencia de tabela. False: Tabelas ja criadas
});

