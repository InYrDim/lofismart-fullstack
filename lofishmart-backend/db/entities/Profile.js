const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Profile',
  tableName: 'profile',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 8,
    },
    name: {
      type: 'varchar',
      length: 60,
      nullable: false,
    },    
    address: {
      type: 'text',
      nullable: true,
    },
    maps: {
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
    timezone: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    time_dif: {
      type: 'int',
      default: 0,
    },
    type: {
      type: 'enum',
      enum: ['GUDANG', 'OUTLET'],
      default: 'OUTLET',
    },
    phone_number: {
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
