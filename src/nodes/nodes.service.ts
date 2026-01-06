import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { NodeEntity } from './entities/node.entity';
import { NodeHierarchyEntity } from './entities/node-hierarchy.entity';
import { trace, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class NodesService {
  private readonly tracer = trace.getTracer('nodes-service');
  constructor(
    @InjectRepository(NodeEntity) private nodesRepo: Repository<NodeEntity>,
    @InjectRepository(NodeHierarchyEntity)
    private hierarchyRepo: Repository<NodeHierarchyEntity>,
    private dataSource: DataSource,
  ) {}

  async createUser(name: string, email: string) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(NodeEntity, { where: { email } });
      if (existing) throw new ConflictException('Email already exists');

      const user = await manager.save(NodeEntity, {
        name,
        email,
        type: 'USER',
      });

      await manager.save(NodeHierarchyEntity, {
        ancestor_id: user.id,
        descendant_id: user.id,
        depth: 0,
      });

      return user;
    });
  }

  async createGroup(name: string, parentId?: string) {
    return this.dataSource.transaction(async (manager) => {
      const group = await manager.save(NodeEntity, { name, type: 'GROUP' });

      await manager.save(NodeHierarchyEntity, {
        ancestor_id: group.id,
        descendant_id: group.id,
        depth: 0,
      });

      if (parentId) {
        await this.addRelation(parentId, group.id, manager);
      }
      return group;
    });
  }

  async addRelation(
    ancestorId: string,
    descendantId: string,
    manager: EntityManager = this.dataSource.manager,
  ) {
    return this.tracer.startActiveSpan('nodes.addRelation', async (span) => {
      span.setAttributes({ ancestorId, descendantId });

      try {
        const cycle = await manager.findOne(NodeHierarchyEntity, {
          where: { ancestor_id: descendantId, descendant_id: ancestorId },
        });

        if (cycle) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: 'Cycle detected',
          });
          throw new BadRequestException('Cycle detected');
        }

        await manager.query(
          `
          INSERT INTO node_hierarchy (ancestor_id, descendant_id, depth)
          SELECT p.ancestor_id, c.descendant_id, p.depth + c.depth + 1
          FROM node_hierarchy p, node_hierarchy c
          WHERE p.descendant_id = $1 AND c.ancestor_id = $2
          ON CONFLICT DO NOTHING
        `,
          [ancestorId, descendantId],
        );
      } finally {
        span.end();
      }
    });
  }

  async getUserOrganizations(userId: string) {
    return this.dataSource.query(
      `
      SELECT n.id, n.name, h.depth
      FROM nodes n
             JOIN node_hierarchy h ON n.id = h.ancestor_id
      WHERE h.descendant_id = $1 AND n.type = 'GROUP' AND h.depth >= 1
      ORDER BY h.depth ASC
    `,
      [userId],
    );
  }

  async getAncestors(nodeId: string) {
    return this.dataSource.query(
      `
      SELECT n.id, n.name, h.depth
      FROM nodes n
             JOIN node_hierarchy h ON n.id = h.ancestor_id
      WHERE h.descendant_id = $1 AND h.depth >= 1
      ORDER BY h.depth ASC
    `,
      [nodeId],
    );
  }

  async getDescendants(nodeId: string) {
    return this.dataSource.query(
      `
      SELECT n.id, n.name, h.depth
      FROM nodes n
             JOIN node_hierarchy h ON n.id = h.descendant_id
      WHERE h.ancestor_id = $1 AND h.depth >= 1
      ORDER BY h.depth ASC
    `,
      [nodeId],
    );
  }
}
