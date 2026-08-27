const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'SyncExport',
  tableName: 'sync_export',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      unsigned: true,
    },
    file_name: {
      type: 'varchar',
      length: 200,
      nullable: false,
    },
    type_job: {
      type: 'varchar',
      length: 200,
      nullable: false,
      comment: 'name table',
    },
    processed_row: {
      type: 'int',
      default: 0,
    },
    total_row: {
      type: 'int',
      default: 0,
    },
    failed_row: {
      type: 'int',
      default: 0,
    },
    from_row: {
      type: 'timestamp',
    },
    to_row: {
      type: 'timestamp',
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  }
});
