import * as Joi from 'joi';

export const EnderecoSchema = Joi.object({
   // O ID geralmente é gerado pelo banco, mas pode ser validado se vier em uma rota de update
    id: Joi.number()
        .integer()
        .positive(),

  // numeric(8,0) -> 8 dígitos exatos
    cep: Joi.number()
        .integer()
        .min(10000000)
        .max(99999999)
        .required()
        .messages({
            'any.required': 'O CEP é obrigatório',
            'number.min': 'O CEP deve ter 8 dígitos',
            'number.max': 'O CEP deve ter 8 dígitos',
        }),

    logradouro: Joi.string()
        .max(100)
        .required()
        .messages({
            'any.required': 'O logradouro é obrigatório',
            'string.max': 'O logradouro deve ter no máximo 100 caracteres',
        }),

    complemento: Joi.string()
        .max(100)
        .allow(null, '') // nullable: true na Entity
        .optional(),

    cidade: Joi.string()
        .max(100)
        .required()
        .messages({
            'any.required': 'A cidade é obrigatória'
        }),

  // char(2) -> Sigla do estado
    estado: Joi.string()
        .length(2)
        .uppercase()
        .required()
        .messages({
            'any.required': 'O estado é obrigatório',
            'string.length': 'O estado deve ser a sigla com 2 caracteres (ex: SP)',
        }),

  // Em geral, não validamos a lista de pessoas na criação de um endereço,
  // mas se necessário, validamos como um array de IDs ou objetos
  // pessoas: Joi.array().items(Joi.any()).optional()
});
