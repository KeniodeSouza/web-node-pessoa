import * as Joi from 'joi';
import { IndicadorPessoaEnum } from '../enums/IndicadorPessoaEnum';

// Schema para o Parametro ID
export const pessoaIdSchema = Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()               
      .messages({
        'number.base': 'O ID deve ser um número.',
        'number.integer': 'O ID deve ser um número inteiro.',
        'number.positive': 'O ID deve ser um número maior que zero.',
        'any.required': 'O parâmetro ID é obrigatório.'      
      })
});

// Schema para o Parametro CPF
export const pessoaCpfSchema = Joi.object({
    cpf: Joi.string()
      .length(11)               // Tamanho fixo de 11 dígitos
      .pattern(/^\d+$/)         // Garante que seja estritamente numérico
      .invalid('00000000000')   // Impede que o CPF seja apenas zeros
      .required()               // Torna o parâmetro obrigatório
      .messages({
        'string.length': 'O CPF deve ter exatamente 11 dígitos.',
        'string.pattern.base': 'O CPF deve conter apenas números.',
        'any.invalid': 'CPF inválido (não pode ser apenas zeros).',
        'any.required': 'O parâmetro CPF é obrigatório.'
      })
});

// Schema para Criação
export const pessoaUpdateSchema = Joi.object({
    nomePessoa: Joi.string()
        .max(100),

    statusAtivo: Joi.boolean(),

    indicadorPessoa: Joi.string()
        .valid(...Object.values(IndicadorPessoaEnum))
        .messages({
            'any.only': 'Indicador de pessoa inválido'
        }),

    dataNascimento: Joi.date()
        .iso()
        .messages({
            'date.format': 'Data de nascimento deve estar no formato ISO (YYYY-MM-DD)'
        }),

    email: Joi.string()
        .max(150),

    complemento: Joi.string()
        .max(150),

    cep: Joi.number()
        .integer()
        .min(1000000000)    // Validação mínima para 11 dígitos
        .max(99999999999) 
        .messages({
            'any.required': 'O CEP é obrigatório',
            'number.base': 'O CEP deve ser um número'
        })

}).min(1); // Garante que pelo menos um campo seja enviado para atualizar

// Schema para Criação
export const pessoaCreateSchema = Joi.object({
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

    email: Joi.string()
        .max(150),

    complemento: Joi.string()
        .max(150),

    // Validamos o CEP ou o objeto simplificado dependendo do seu DTO
    cep: Joi.number()
        .integer()
        .min(1000000000)    // Validação mínima para 11 dígitos
        .max(99999999999) 
        .required()
        .messages({
            'any.required': 'O CEP é obrigatório',
            'number.base': 'O CEP deve ser um número'
        })

});

