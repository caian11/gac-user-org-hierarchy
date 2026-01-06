import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('nodes')
export class NodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'USER' | 'GROUP';

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
