import * as Joi from 'joi';
import { IndicadorPessoaEnum } from '../enums/IndicadorPessoaEnum';

export const PessoaSchema = Joi.object({
  // O ID geralmente é gerado pelo banco, mas pode ser validado se vier em uma rota de update
    id: Joi.number()
        .integer()
        .positive(),

    nomePessoa: Joi.string()
        .max(100)
        .required()
        .messages({
            'any.required': 'O nome da pessoa é obrigatório',
            'string.max': 'O nome da Pessoa deve ter no máximo 100 caracteres'
        }),

    statusAtivo: Joi.boolean()
        .default(true),

    indicadorPessoa: Joi.string()
        .valid(...Object.values(IndicadorPessoaEnum))
        .default(IndicadorPessoaEnum.FISICA)
        .messages({
            'any.only': 'Indicador de pessoa inválido'
        }),

    // Validamos apenas o ID do endereço ou o objeto simplificado dependendo do seu DTO
    id_endereco: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'O Id do Endereço é obrigatório',
            'number.base': 'O Id do Endereço deve ser um número'
        }),

    // CPF como numeric(11,0) no TypeORM/DB
    cpf: Joi.number()
        .integer()
        .min(10000000000) // Validação mínima para 11 dígitos
        .max(99999999999) 
        .required()
        .messages({
            'any.required': 'O CPF é obrigatório',
            'number.base': 'O CPF deve ser um número'
        }),

    dataNascimento: Joi.date()
        .iso()
        .required()
        .messages({
            'date.format': 'Data de nascimento deve estar no formato ISO (YYYY-MM-DD)'
        }),

});