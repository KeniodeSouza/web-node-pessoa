import { Router } from 'express';
import { EnderecoService } from '../services/EnderecoService';

const router = Router();
const enderecoService = new EnderecoService();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', asyncHandler(async (req: any, res: any) => {
  const endereco = await enderecoService.criarEndereco(req.body);
  res.success(endereco, 'Endereço criado com sucesso');
}));

router.get('/pessoa/:pessoaId', asyncHandler(async (req:any, res:any) => {
  const enderecos = await enderecoService.listarEnderecosPorPessoa(Number(req.params.pessoaId));
  res.success(enderecos, 'Endereços encontrados');
}));

export default router;
