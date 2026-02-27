import { Router } from 'express';
import { PessoaController } from '../controllers/PessoaController';
import { validateRequest } from '../middlewares/validateRequest';
import { pessoaIdSchema, pessoaCpfSchema, pessoaCreateSchema } from '../schemas/pessoa.schema';

const router = Router();
const controller = new PessoaController();

// Rotas específicas da entidade
router.get('/', controller.getAll);
router.get('/:id', 
                validateRequest(pessoaIdSchema, 'params'), controller.getOne);
router.get('/cpf/:cpf',  
                validateRequest(pessoaCpfSchema, 'params'), controller.getForCpf);
                
// Atualização da base de dados
// router.post('/', validateRequest(pessoaCreateSchema, 'body')), controller.createNew);
router.post('/', controller.createNew);

export default router;
