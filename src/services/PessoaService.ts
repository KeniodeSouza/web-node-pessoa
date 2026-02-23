import { validarIndicadorPessoa } from '../enums/IndicadorPessoaEnum';
import { AppError } from '../errors/AppError';
import { PessoaRepository } from '../repositories/PessoaRepository';

export class PessoaService {
  async criarPessoa(dados: any) {
  // Validação centralizada usando o Enum
    const indicadorPessoa = validarIndicadorPessoa(dados.indicador_pessoa);    
    if (!dados.cpf) throw new AppError('CPF é obrigatório', 422);
    const pessoa = PessoaRepository.create(dados);
    return await PessoaRepository.save(pessoa);
  }

  async listarTodos() {
    const pessoas = await PessoaRepository.find({
      relations: {
                  endereco: true, // Nome da propriedade definida na Entity Pessoa
      },
      order: { nomePessoa: "ASC" },
    });

    if (!pessoas || pessoas.length === 0) {
      throw new AppError('Nenhuma pessoa encontrada', 404);
    }

    if (!pessoas) throw new AppError('Pessoa não encontrada', 404);
    return pessoas;
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
