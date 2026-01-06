import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NodeEntity } from './node.entity';

@Entity('node_hierarchy')
export class NodeHierarchyEntity {
  @PrimaryColumn()
  ancestor_id: string;

  @PrimaryColumn()
  descendant_id: string;

  @Column()
  depth: number;

  @ManyToOne(() => NodeEntity)
  @JoinColumn({ name: 'ancestor_id' })
  ancestor: NodeEntity;

  @ManyToOne(() => NodeEntity)
  @JoinColumn({ name: 'descendant_id' })
  descendant: NodeEntity;
}
