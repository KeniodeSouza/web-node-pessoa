import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IndicadorPessoaEnum } from '../enums/IndicadorPessoaEnum';
import { Endereco } from './Endereco';

@Entity({ name: 'pessoa', schema: 'teste' })
@Unique(['cpf'])    // CONSTRAINT uq_pessoa
export class Pessoa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome_pessoa', type: 'varchar', length: 100 })
  nomePessoa: string;

  @Column({ name: 'status_ativo', type: 'boolean', default: true })
  statusAtivo: boolean;

  @Column({ name: 'indicador_pessoa', type: 'char', length: 1,
                    enum: IndicadorPessoaEnum, default: IndicadorPessoaEnum.FISICA })
  indicadorPessoa: IndicadorPessoaEnum;

  @Column({ name: 'id_endereco', type: 'int4', nullable: true })
  idEndereco: number | null;

  @Column({ type: 'numeric', precision: 11, scale: 0 })
  cpf: number;

  @Column({ name: 'data_nascimento', type: 'date' })
  dataNascimento: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  complemento: string | null;

  // RELACIONAMENTO: Muitas pessoas para UM endereço
  @ManyToOne(() => Endereco, (endereco) => endereco.pessoas)
  @JoinColumn({ name: 'id_endereco' }) // A FK fica aqui na tabela Pessoa
  endereco: Endereco;

}
