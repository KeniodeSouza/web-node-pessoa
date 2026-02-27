import { Repository, DataSource } from 'typeorm';
import { AppDataSource } from '../db/data-source';
import { Endereco } from '../entities/Endereco';

export class EnderecoRepository {
    private repo: Repository<Endereco>;
     private dataSource: DataSource;

    constructor() {
        this.dataSource = AppDataSource;
        this.repo = this.dataSource.getRepository(Endereco);
    }

    async findAll() {
        return await this.repo.find({
            order: { logradouro: "ASC" },
        });
    }

    async findById(id: number) {
        return await this.repo.findOne({
            where: { id }
        });
    }
 
    async findByCep(cep: any) {
        return await this.repo.findOne({
            where: { cep }
        });
    }  

    async insert(dados: Partial<Endereco>) {
        const instance = this.repo.create(dados);
        return await this.repo.save(instance);
    }

    async update(id: number, dados: Partial<Endereco>) {
        // Usar preload é uma forma elegante de preparar um update no TypeORM
        const dadosAtualizar = await this.repo.preload({
                                                id: id,
                                                ...dados
                                            });

        if (!dadosAtualizar) {
            throw new Error(`Endereço com ID ${id} não encontrado.`);
        }                                            

        return await this.repo.save(dadosAtualizar);
    }

}    