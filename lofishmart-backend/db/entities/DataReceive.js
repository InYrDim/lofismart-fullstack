const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'DataReceive',
  tableName: 'data_receive',
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
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
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
