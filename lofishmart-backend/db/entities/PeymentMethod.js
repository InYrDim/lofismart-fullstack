// entities/User.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PeymentMethod',
  tableName: 'payment_method',
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
    icon: {
      type: 'varchar',
      length: 100,
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
