import { validarIndicadorPessoa } from '../enums/IndicadorPessoaEnum';
import { AppError } from '../errors/AppError';
import { PessoaRepository } from '../repositories/PessoaRepository';

export class PessoaService {
  private repository: PessoaRepository;

  constructor() {
    this.repository = new PessoaRepository();
  }

  async criarNovo(dados: any) {
    const retorno = await this.repository.criarNovo(dados);
    if (!retorno) 
        throw new AppError('Pessoa não criado', 404);

    return retorno;
  }

  async listarTodos() {
    const lista = await this.repository.findAll();
    
    if (!lista || lista.length === 0) {
      throw new AppError('Nenhuma pessoa encontrada', 404);
    }
    
    return lista;
  }

  async obterPorId(id: number) {
    const retorno = await this.repository.findById(id);
    if (!retorno) 
        throw new AppError('Pessoa não encontrada', 404);

    return retorno;
  }

  async obterPorCpf(cpf: any) {
    const retorno = await this.repository.findByCpf(cpf);
  
    if (!retorno) {
      throw new AppError(`Pessoa com CPF ${cpf} não encontrada`, 404);
    }

    return retorno;
  }

}