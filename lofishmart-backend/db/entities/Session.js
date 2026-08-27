const {
  EntitySchema
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'Session',
  tableName: 'session',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 16,
    },
    ip_address: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    user_agent: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    payload: {
      type: 'text',
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    expired_at: {
      type: 'timestamp',
      nullable: true
    }
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
      eager: false,
    },
  },
});