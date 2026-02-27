import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Pessoa } from './Pessoa';

@Entity({ name: 'endereco', schema: 'teste' })
@Unique(['cep']) // Adicionada a CONSTRAINT endereco_unique UNIQUE (cep)
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 8, scale: 0 })
  cep: number;

  @Column({ type: 'varchar', length: 100 })
  logradouro: string;

  @Column({ type: 'varchar', length: 100 })
  bairro: string;

  @Column({ type: 'varchar', length: 100 })
  cidade: string;

  @Column({ type: 'char', length: 2 })
  estado: string;

  // Relacionamento: Um endereço para MUITAS pessoas
  @OneToMany(() => Pessoa, (pessoa) => pessoa.endereco)
  pessoas: Pessoa[];

}
