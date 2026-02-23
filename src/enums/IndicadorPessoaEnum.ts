import { AppError } from "../errors/AppError";

export enum IndicadorPessoaEnum {
  FISICA = '1',
  JURIDICA = '2',
  ESTRANGEIRA = '3',
}

export const IndicadorPessoaLabel: Record<string, string> = {
  [IndicadorPessoaEnum.FISICA]: 'Pessoa Física',
  [IndicadorPessoaEnum.JURIDICA]: 'Pessoa Jurídica',
  [IndicadorPessoaEnum.ESTRANGEIRA]: 'Pessoa Estrangeira',
};

export const validarIndicadorPessoa = (valor: any): IndicadorPessoaEnum => {
  if (!Object.values(IndicadorPessoaEnum).includes(valor)) {
    throw new AppError(
      `Indicador '${valor}' inválido. Use: 1 (Física), 2 (Jurídica) ou 3 (Estrangeira)`, 
      400
    );
  }
  return valor as IndicadorPessoaEnum;
};
