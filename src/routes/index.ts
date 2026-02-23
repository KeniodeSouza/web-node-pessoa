import { Router } from 'express';
import pessoaRoutes from './pessoaRoutes';
import enderecoRoutes from './enderecoRoutes';

const router = Router();

// cada rota é montada em seu prefixo
router.use('/pessoa', pessoaRoutes);
router.use('/endereco', enderecoRoutes);

export default router;
