import { DataSource } from 'typeorm';
import { NodeEntity } from './src/nodes/entities/node.entity';
import { NodeHierarchyEntity } from './src/nodes/entities/node-hierarchy.entity';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'caian',
  password: '3119',
  database: 'hierarchy_management',
  entities: [NodeEntity, NodeHierarchyEntity],
  migrations: ['./src/migrations/*.ts'],
});
