import { Test, TestingModule } from '@nestjs/testing';
import { NodesService } from './nodes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NodeEntity } from './entities/node.entity';
import { NodeHierarchyEntity } from './entities/node-hierarchy.entity';
import { DataSource } from 'typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('NodesService', () => {
  let service: NodesService;
  let dataSource: DataSource;

  const mockNodeRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockHierarchyRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockEntityManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    query: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockEntityManager)),
    query: jest.fn(),
    manager: mockEntityManager,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodesService,
        {
          provide: getRepositoryToken(NodeEntity),
          useValue: mockNodeRepo,
        },
        {
          provide: getRepositoryToken(NodeHierarchyEntity),
          useValue: mockHierarchyRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<NodesService>(NodesService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockEntityManager.findOne.mockResolvedValue({ id: '1' });

      await expect(service.createUser('Test', 'test@test.com')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create a user and its self-reference hierarchy', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.save.mockResolvedValueOnce({
        id: 'uuid-1',
        name: 'Test',
        email: 'test@test.com',
      });

      const result = await service.createUser('Test', 'test@test.com');

      expect(result.id).toBe('uuid-1');
      expect(mockEntityManager.save).toHaveBeenCalledTimes(2); // User + Hierarchy
    });
  });

  describe('addRelation', () => {
    it('should throw BadRequestException if a cycle is detected', async () => {
      mockEntityManager.findOne.mockResolvedValue({
        ancestor_id: 'child',
        descendant_id: 'parent',
      });

      await expect(
        service.addRelation('parent', 'child', mockEntityManager as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should execute the hierarchical insert query', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      await service.addRelation(
        'parent-id',
        'child-id',
        mockEntityManager as any,
      );

      expect(mockEntityManager.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO node_hierarchy'),
        ['parent-id', 'child-id'],
      );
    });
  });

  describe('getUserOrganizations', () => {
    it('should call dataSource.query with correct parameters', async () => {
      const mockResult = [{ id: '1', name: 'Org' }];
      mockDataSource.query.mockResolvedValue(mockResult);

      const result = await service.getUserOrganizations('user-id');

      expect(result).toBe(mockResult);
      expect(mockDataSource.query).toHaveBeenCalled();
    });
  });
});
