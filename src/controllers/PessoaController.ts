import { Router, Request, Response, NextFunction } from 'express';
import { PessoaService } from '../services/PessoaService';
import { AppError } from '../errors/AppError';
import { validarIndicadorPessoa } from '../enums/IndicadorPessoaEnum';

const router = Router();
const service = new PessoaService();

// Helper para tratar erros assíncronos
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Rota: Criar Pessoa
router.post('/', asyncHandler(async (req: Request, res: any) => {
    const dados = req.body;
    
    if (!dados.indicador_pessoa){
      throw new AppError('Indicador de Pessoa é obrigatório', 422);
    }
    const enumValue = validarIndicadorPessoa(dados.indicador_pessoa);

    if (!dados.cpf) 
      throw new AppError('CPF é obrigatório', 422);
    // Tratamento do CPF para garantir que chegue como número limpo
    if (dados.cpf) {
      dados.cpf = String(dados.cpf).replace(/\D/g, '');
    }

    if (!dados.cep) 
      throw new AppError('CEP é obrigatório', 422);
    // Tratamento do CEP para garantir que chegue como número limpo
    if (dados.cep) {
      dados.cep = String(dados.cep).replace(/\D/g, '');
    }

    const retorno = await service.criarPessoa(dados);
    res.success(retorno, 'Pessoa criada com sucesso');
}));

// Rota: Listar Todas
router.get('/', asyncHandler(async (req: Request, res: any) => {
  const lista = await service.listarTodos();
  res.success(lista, 'Pessoas listadas com sucesso');
}));

// Rota: Obter por ID
router.get('/:id', asyncHandler(async (req: Request, res: any) => {
  const retorno = await service.obterPorId(Number(req.params.id));
  res.success(retorno, 'Pessoa encontrada');
}));

// Rota: Obter por CPF
// Exemplo de chamada: GET /pessoas/cpf/16981545004
router.get('/cpf/:cpf', asyncHandler(async (req: Request, res: any) => {
  const { cpf } = req.params;
  if (!cpf) 
    throw new AppError('CPF não informado', 400);

  const pessoa = await service.obterPorCpf(cpf);
  res.success(pessoa, 'Pessoa encontrada com sucesso');
}));

export default router;
