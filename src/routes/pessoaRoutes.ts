import { Router } from 'express';
import { PessoaService } from '../services/PessoaService';
import { asyncHandler } from '../utils/asyncHandler';
import { CustomResponse } from '../middlewares/responseHandler';
import { Pessoa } from '../entities/Pessoa';

const router = Router();
const pessoaService = new PessoaService();

/**
 * Cria um novo registro de Pessoa
 */
router.post('/', asyncHandler(async (req: Request, res: CustomResponse) => {
  const dados = req.body as Partial<Pessoa>;
  const retorno = await pessoaService.criarPessoa(dados);
  res.success(retorno, 'Pessoa criada com sucesso');
}));

/**
 * Lista todos os registros de Pessoa
 */
router.get('/', asyncHandler(async (req: Request, res: CustomResponse) => {
  const retorno = await pessoaService.listarTodos();
console.log('pessoas', retorno);  
  res.success(retorno, 'Pessoas encontrada');
}));

/**
 * Busca o registro id de Pessoa
 */
router.get('/:id', asyncHandler(async (req: Request, res: CustomResponse) => {
  const id = (req as any).id;
  const retorno = await pessoaService.obterPessoa(Number(id));
  res.success(retorno, 'Pessoa encontrada');
}));

export default router;

