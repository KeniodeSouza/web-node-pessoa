import { AppError } from "../errors/AppError";

export enum IndicadorPessoaEnum {
  FISICA = 'F',
  JURIDICA = 'J',
  ESTRANGEIRA = 'E',
}

export const IndicadorPessoaLabel: Record<string, string> = {
  [IndicadorPessoaEnum.FISICA]: 'Pessoa Física',
  [IndicadorPessoaEnum.JURIDICA]: 'Pessoa Jurídica',
  [IndicadorPessoaEnum.ESTRANGEIRA]: 'Pessoa Estrangeira',
};

export const validarIndicadorPessoa = (valor: any): IndicadorPessoaEnum => {
  if (!Object.values(IndicadorPessoaEnum).includes(valor)) {
    throw new AppError(`Indicador '${valor}' inválido. Use: F=(Física), J=(Jurídica) ou E=(Estrangeira)`, 
                        400 );
  }
  return valor as IndicadorPessoaEnum;
};
