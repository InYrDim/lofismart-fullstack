const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Failed_job',
  tableName: 'failed_job',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      unsigned: true,
    },
    validation_error: {
      type: 'text',
      nullable: false,
    },
    row_error: {
      type: 'int',
      default: 0,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },
  relations: {
    export: {
      type: 'many-to-one',
      target: 'SyncExport',
      joinColumn: {
        name: 'sync_export_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
    import: {
      type: 'many-to-one',
      target: 'SyncImport',
      joinColumn: {
        name: 'sync_import_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
  },
});
