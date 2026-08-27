// entities/User.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'CatApp',
  tableName: 'cat_app',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 4,
    },
    name: {
      type: 'varchar',
      length: 30,
      nullable: false,
    },
    data_watch: {
      type: 'json',
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
