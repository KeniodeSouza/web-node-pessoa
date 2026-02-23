import { Router } from 'express';
import { PessoaService } from '../services/PessoaService';

const router = Router();
const pessoaService = new PessoaService();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', asyncHandler(async (req: any, res: any) => {
  const pessoa = await pessoaService.criarPessoa(req.body);
  res.success(pessoa, 'Pessoa criada com sucesso');
}));

router.get('/:id', asyncHandler(async (req: any, res: any) => {
  const pessoa = await pessoaService.obterPessoa(Number(req.params.id));
  res.success(pessoa, 'Pessoa encontrada');
}));

export default router;
