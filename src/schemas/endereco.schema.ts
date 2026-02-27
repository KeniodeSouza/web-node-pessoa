import * as Joi from 'joi';

// Schema do parametro ID
export const enderecoIdSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
});

// Schema do Parametro CEP
export const enderecoCepSchema = Joi.object({
  params: Joi.object({
    cep: Joi.string()
      .length(8)               
      .pattern(/^\d+$/)         // Garante que seja estritamente numérico
      .invalid('00000000000')   // Impede que o CPF seja apenas zeros
      .required()               
      .messages({
        'string.length': 'O CEP deve ter exatamente 8 dígitos.',
        'string.pattern.base': 'O CEP deve conter apenas números.',
        'any.invalid': 'CEP inválido (não pode ser apenas zeros).',
        'any.required': 'O parâmetro CEP é obrigatório.'
      })
  })
});

// Schema para os dados de Criação
export const enderecoCreateSchema = Joi.object({
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

});

// Schema para os dados de atualização
export const enderecoUpdateSchema = Joi.object({
    cep: Joi.string()
        .length(8)               
        .pattern(/^\d+$/)         // Garante que seja estritamente numérico
        .invalid('00000000000')   // Impede que o CPF seja apenas zeros
        .messages({
            'string.length': 'O CEP deve ter exatamente 8 dígitos.',
            'string.pattern.base': 'O CEP deve conter apenas números.',
            'any.invalid': 'CEP inválido (não pode ser apenas zeros).'
        }),

    logradouro: Joi.string()
        .max(100)
        .messages({
            'string.max': 'O logradouro deve ter no máximo 100 caracteres',
        }),

    cidade: Joi.string()
        .max(100)
        .messages({
            'string.max': 'A cidade deve ter no máximo 150 caracteres'
        }),

    // char(2) -> Sigla do estado
    estado: Joi.string()
        .length(2)
        .uppercase()
        .messages({
            'string.length': 'O estasdo deve ser a sigla com 2 caracteres (ex: SP)',
        })
}).min(1); // Garante que pelo menos um campo seja enviado para atualizar
