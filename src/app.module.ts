import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodesModule } from './nodes/nodes.module';
import { NodeEntity } from './nodes/entities/node.entity';
import { NodeHierarchyEntity } from './nodes/entities/node-hierarchy.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'caian',
      password: '3119',
      database: 'hierarchy_management',
      entities: [NodeEntity, NodeHierarchyEntity],
      synchronize: true,
    }),
    NodesModule,
  ],
})
export class AppModule {}
