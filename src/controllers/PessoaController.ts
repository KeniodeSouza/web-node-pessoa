import { Router, Request, Response, NextFunction } from 'express';
import { PessoaService } from '../services/PessoaService';
import { Pessoa } from '../entities/Pessoa';
import { BaseController } from './BaseController';

const router = Router();
const service = new PessoaService();

export class PessoaController extends BaseController<Pessoa> {
	private service = new PessoaService();

    constructor() {
        super(Pessoa);
        this.service = new PessoaService();
    }

    // Sobrescreve ou adiciona o método de criação com lógica de negócio
    createNew = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Os dados já chegam validados pelo Middleware do Joi
            const result = await this.service.createNew(req.body);
            return res.status(201).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.findAll();
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    getForId = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        try {
            const result = await this.service.findById(id);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };


    getForCpf = async (req: Request, res: Response, next: NextFunction) => {
        const { cpf } = req.params;

        try {
            const result = await this.service.findByCpf(cpf);
            return res.status(201).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    };



}
