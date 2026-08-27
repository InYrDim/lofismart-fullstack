const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Member',
  tableName: 'member',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 10,
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },    
    email: {
      type: 'varchar',
      length: 150,
      unique: true,
      nullable: true,
    },
    identity_type: {
      type: 'enum',
      enum: ['1', '2', '3'],
      default: '1',
      comment: 'ktp, paspor, other',
    },
    identity_number: {
      type: 'varchar',
      length: 30,
      unique: true,
    },
    address: {
      type: 'text',
      nullable: true,
    },
    maps: {
      type: 'text',
      nullable: true,
    },
    phone_number: {
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
    deleted_at: {
      type: 'timestamp',
      deleteDate: true,
    },
  },
});
