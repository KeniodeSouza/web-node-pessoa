import { AppDataSource } from '../db/data-source';
import { Pessoa } from '../entities/Pessoa';

export const PessoaRepository = AppDataSource.getRepository(Pessoa);
