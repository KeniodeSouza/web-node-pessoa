import { Router } from 'express';
import { EnderecoController } from '../controllers/EnderecoController';
import { validateRequest } from '../middlewares/validateRequest';
import { enderecoIdSchema, enderecoCepSchema, enderecoCreateSchema, enderecoUpdateSchema } from '../schemas/endereco.schema';

const router = Router();
const controller = new EnderecoController();

// Rotas específicas da entidade
router.get('/', 
                controller.getAll);
router.get('/:id', 
                validateRequest(enderecoIdSchema, 'params'), 
                controller.getForId);
router.get('/cep/:cep',
                validateRequest(enderecoCepSchema, 'params'), 
                controller.getForCep);

// Atualização da base de dados 
router.post('/', 
                validateRequest(enderecoCreateSchema, 'body'), 
                controller.create);

router.put('/:id', 
                validateRequest(enderecoIdSchema, 'params'),
                validateRequest(enderecoUpdateSchema, 'body'), 
                controller.update);
// router.delete('/:id', controller.delete);

export default router;

