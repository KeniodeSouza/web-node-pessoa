import { Router, Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { Endereco } from '../entities/Endereco';
import { Pessoa } from '../entities/Pessoa';
import { EnderecoService } from '../services/EnderecoService';

const router = Router();
const service = new EnderecoService();

export class EnderecoController extends BaseController<Pessoa> {
	  private service = new EnderecoService();

    constructor() {
        super(Endereco);
        this.service = new EnderecoService();
    }

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.findAll();
            return res.status(200).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    }

    getForId = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const idNum = Number(id);
    
        try {
            // Os dados já chegam validados pelo Middleware do Joi
            const result = await this.service.findById(idNum);
            return res.status(200).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    }

    getForCep = async (req: Request, res: Response, next: NextFunction) => {
        const { cep } = req.params;
    
        try {
            // Os dados já chegam validados pelo Middleware do Joi
            const result = await this.service.findByCep(cep);
            return res.status(200).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    }    

    // Sobrescreve ou adiciona o método de criação com lógica de negócio
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Os dados já chegam validados pelo Middleware do Joi
            const result = await this.service.criar(req.body);
            return res.status(201).json(result);
        } catch (error) {
            next(error); // Erro capturado pelo errorHandler centralizado
        }
    };
 
    // Implementação do Update
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const result = await this.service.atualizar(id, req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    };

}