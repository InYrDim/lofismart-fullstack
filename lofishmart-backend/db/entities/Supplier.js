const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Supplier',
  tableName: 'supplier',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 8,
    },
    corporation: {
      type: 'varchar',
      length: 60,
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 60,
      nullable: false,
    },    
    email: {
      type: 'varchar',
      length: 150,
      unique: true,
      nullable: true,
    },
    phone_number: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    address: {
      type: 'text',
      nullable: true,
    },
    city: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    pos: {
      type: 'varchar',
      length: 10,
      nullable: true,
    },
    bank: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    no_rek: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
    deleted_at: {
      type: 'timestamp',
      deleteDate: true,
    },
  },
});
