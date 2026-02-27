import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../db/data-source';
import { Pessoa } from '../entities/Pessoa';

export class PessoaRepository {
    private repo: Repository<Pessoa>;
     private dataSource: DataSource;

    constructor() {
        this.dataSource = AppDataSource;
        this.repo = this.dataSource.getRepository(Pessoa);
    }
    
    async criarNovo(dados: any) {
        // Usamos query parameters ($1, $2...) para evitar SQL Injection
        const sql = `
            WITH dados (indicador_pessoa, nome_pessoa, cpf, email, data_nascimento, complemento, cep) AS (
                VALUES (
                    $1::char(1),        -- indicador_pessoa 
                    $2::varchar,        -- Nome completo da pessoa 
                    $3::numeric(11),    -- CPF da pessoa 
                    $4::varchar,        -- Email de contato
                    $5::date,           -- Data de Nascimento da pessoa
                    $6::varchar,        -- Complemento do endereco
                    $7::numeric(8)      -- Cep do Endereço da Pessoa
                )
            )
            INSERT INTO teste.pessoa (indicador_pessoa, nome_pessoa, cpf, email, data_nascimento, complemento, id_endereco)
                SELECT dd.indicador_pessoa, dd.nome_pessoa, dd.cpf, dd.email, dd.data_nascimento, dd.complemento, te.id
                FROM dados dd
                    INNER JOIN teste.endereco te 
                        ON te.cep = dd.cep
            RETURNING *;
            `;

        const values = [
                    dados.indicadorPessoa,      // O valor será 'F' ou 'J'//
                    dados.nomePessoa,
                    dados.cpf,
                    dados.email,
                    dados.dataNascimento,
                    dados.complemento,
                    dados.cep
                ];

        // Executa a query bruta e retorna o resultado
        const result = await this.dataSource.query(sql, values);
        return result[0];   // Retorna os dados do registro inserido (devido ao RETURNING *)    }
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
