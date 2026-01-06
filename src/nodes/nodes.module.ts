import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodesService } from './nodes.service';
import { NodesController } from './nodes.controller';
import { NodeEntity } from './entities/node.entity';
import { NodeHierarchyEntity } from './entities/node-hierarchy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NodeEntity, NodeHierarchyEntity])],
  controllers: [NodesController],
  providers: [NodesService],
})
export class NodesModule {}
