import { Router } from 'express';
import { Endereco } from '../entities/Endereco';
import { CustomResponse } from '../middlewares/responseHandler';
import { EnderecoService } from '../services/EnderecoService';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const enderecoService = new EnderecoService();

router.post('/', asyncHandler(async (
                                    req: Request, res: CustomResponse) => {
  const dados = req.body as Partial<Endereco>;
  const retorno = await enderecoService.criarEndereco(dados);
  res.success(retorno, 'Endereço criado com sucesso');
}));

router.get('/', asyncHandler(async (
                                    req: Request, res: CustomResponse) => {
  const retorno = await enderecoService.listarTodos();
  res.success(retorno, 'Endereços encontrados');
}));


router.get('/:id/pessoas', asyncHandler(async (
                                              req: Request, res: CustomResponse) => {
  const id = (req as any).id;
  const retorno = await enderecoService.listarEnderecosPorPessoa(Number(id));
  res.success(retorno, 'Endereços encontrados');
}));

export default router;
