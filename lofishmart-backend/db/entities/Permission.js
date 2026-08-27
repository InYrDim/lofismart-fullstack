const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Permission',
  tableName: 'permission',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 4,
    },
    name: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    guard_name: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});
