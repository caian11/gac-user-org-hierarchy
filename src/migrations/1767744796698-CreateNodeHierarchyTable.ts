import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateNodeHierarchyTable1786170010000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'node_hierarchy',
        columns: [
          {
            name: 'ancestor_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'descendant_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'depth',
            type: 'int',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('node_hierarchy', [
      new TableForeignKey({
        name: 'FK_node_hierarchy_ancestor',
        columnNames: ['ancestor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'nodes',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_node_hierarchy_descendant',
        columnNames: ['descendant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'nodes',
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('node_hierarchy');
  }
}
