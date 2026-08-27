const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'DataChange',
  tableName: 'data_change',
  columns: {
    id: {
      primary: true,
      type: 'bigint',
      generated: true,
      unsigned: true,
    },
    branch_id: {
      nullable: false,
      type: 'varchar',
      length: 30,
      comment: 'profile id',
      nullable: true
    },
    table_name: {
      nullable: false,
      type: 'varchar',
      length: 30,
    },
    pk_id: {
      nullable: false,
      type: 'varchar',
      length: 30,
      nullable: true
    },
    action: {
      type: 'enum',
      enum: ['INSERT', 'UPDATE', 'DELETE', 'SOFDEL', 'EDIT'],
    },
    attachment: {
      type: 'json',
      nullable: true,
    },
    sync_status: {
      type: 'enum',
      enum: ['PENDING', 'SENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    payload: {
      type: 'json',
      nullable: true,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },
});
