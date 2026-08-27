// entities/User.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Grade',
  tableName: 'grade',
  columns: {
    // id: {
    //   primary: true,
    //   type: 'int',
    //   generated: true,
    // },
    // email: {
    //   type: 'varchar',
    //   length: 150,
    //   unique: true,
    //   nullable: false,
    // },
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
    barcode: {
      type: 'varchar',
      length: 2,
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
