import { Request, Response, NextFunction } from 'express';
import { Repository, EntityTarget, ObjectLiteral, DeepPartial } from 'typeorm';
import { AppDataSource } from '../db/data-source';

export abstract class BaseController<T extends ObjectLiteral> {
    protected repository: Repository<T>;

    constructor(entity: EntityTarget<T>) {
        this.repository = AppDataSource.getRepository(entity);
    }

    // LISTAR TODOS
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.repository.find();
            return res.json(data);
        } catch (error) {
            next(error);
        }
    };

    // OBTER UM POR ID
    getOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.repository.findOneBy({ id: id as any });
            
            if (!result) {
                return res.status(404).json({ message: 'Registro não encontrado' });
            }
            
            return res.json(result);
        } catch (error) {
            next(error);
        }
    };

    // CRIAR NOVO (POST)
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const entityData = req.body;
            // O método .create() apenas instancia, o .save() persiste no banco
            const newItem = this.repository.create(entityData as DeepPartial<T>);
            const result = await this.repository.save(newItem);
            
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    // ATUALIZAR (PUT/PATCH)
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Verificamos se o registro existe antes de tentar atualizar
            const item = await this.repository.findOneBy({ id: id as any });
            if (!item) {
                return res.status(404).json({ message: 'Registro não encontrado para atualização' });
            }

            // O método .merge() combina os dados novos com os existentes
            this.repository.merge(item, updateData);
            const result = await this.repository.save(item);

            return res.json(result);
        } catch (error) {
            next(error);
        }
    };

    // DELETAR
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const deleteResult = await this.repository.delete(id);

            if (deleteResult.affected === 0) {
                return res.status(404).json({ message: 'Registro não encontrado para exclusão' });
            }

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}