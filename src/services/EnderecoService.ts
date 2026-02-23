import { EnderecoRepository } from '../repositories/EnderecoRepository';
import { Endereco } from '../entities/Endereco';
import { PessoaRepository } from '../repositories/PessoaRepository';
import { AppError } from '../errors/AppError';

export class EnderecoService {
  async criarEndereco(dados: Partial<Endereco>) {
    const endereco = EnderecoRepository.create(dados);
    return await EnderecoRepository.save(endereco);
  }

  async listarTodos() {
    const resultado = await EnderecoRepository.find();
    if (!resultado) {
      throw new AppError('Endereço não encontrado', 404);
    }

    return resultado;
  }

  async listarEnderecosPorPessoa(id: number) {

    const resultado = await EnderecoRepository.findOne({
        where: { id },
        relations: { pessoas: true, },
    });

    if (!resultado) {
      throw new AppError('Endereço não encontrado', 404);
    }

    return resultado;
  }
    
}
