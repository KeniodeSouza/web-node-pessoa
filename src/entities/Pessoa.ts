import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
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

  // CONSTRAINT fk_pessoa_endereco 
  @OneToOne(() => Endereco, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_endereco' })
  endereco: Endereco;
  
}
