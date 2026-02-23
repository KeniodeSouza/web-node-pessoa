import { AppDataSource } from '../db/data-source';
import { Endereco } from '../entities/Endereco';

export const EnderecoRepository = AppDataSource.getRepository(Endereco);

