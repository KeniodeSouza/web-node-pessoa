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
