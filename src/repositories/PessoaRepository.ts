import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../db/data-source';
import { Pessoa } from '../entities/Pessoa';
import { IndicadorPessoaEnum } from '../enums/IndicadorPessoaEnum';

export class PessoaRepository {
    private repo: Repository<Pessoa>;
     private dataSource: DataSource;

    constructor() {
        this.dataSource = AppDataSource;
        this.repo = this.dataSource.getRepository(Pessoa);
    }
    
    async create(dados: any) {
        // Usamos query parameters ($1, $2...) para evitar SQL Injection
        const sql = `
            WITH dados (indicador_pessoa, nome_pessoa, cpf, email, data_nascimento, cep) AS (
                VALUES (
                    $1::char(1),        -- indicador_pessoa vindo do Enum
                    $2::varchar, 
                    $3::numeric(11),    
                    $4::varchar, 
                    $5::date, 
                    $6::numeric(8) 
                )
            )
            INSERT INTO teste.pessoa (indicador_pessoa, nome_pessoa, cpf, email, data_nascimento, id_endereco)
                SELECT dd.tipo_pessoa, dd.nome_pessoa, dd.cpf, dd.email, dd.data_nascimento, te.id
                FROM dados dd
                    INNER JOIN teste.endereco te 
                        ON te.cpf = dd.cpf
            RETURNING *;
            `;

        const values = [
                    dados.IndicadorPessoaEnum,  // O valor será 'F' ou 'J'//
                    dados.nome_pessoa,
                    dados.cpf,
                    dados.email,
                    dados.data_nascimento,
                    dados.cep
                ];

        // Executa a query bruta e retorna o resultado
        const result = await this.dataSource.query(sql, values);
        return result[0]; // Retorna a pessoa inserida (devido ao RETURNING *)    }
    }

    async findAll() {
        return await this.repo.find({
            relations: { endereco: true },
            order: { nomePessoa: "ASC" },
        });
    }

    async findById(id: number) {
        return await this.repo.findOne({
            where: { id },
            relations: ['endereco'], // Ajustado para singular conforme seu find anterior
        });
    }
 
    async findByCpf(cpf: any) {
        return await this.repo.findOne({
            where: { cpf },
            relations: ['endereco'] // Incluindo relações se necessário
        });
    }  
}
