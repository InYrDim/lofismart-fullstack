// entities/User.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Voucher',
  tableName: 'voucher',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 10,
      comment: 'used as barcode to'
    },
    name: {
      type: 'varchar',
      length: 60,
      nullable: false,
    },
    desc: {
      type: 'text',
      nullable: true,
    },
    is_fix_disc: {
      type: 'enum',
      enum: ['1', '2'],
      default: '1',
      comment: 'Order (1 = yes, 2 = no)',
    },
    min_price: {
      type: 'double',
      default: 0,
      comment: 'Minimum belanja',
    },
    percent_disc: {
      type: 'double',
      default: 0,
      comment: 'not fix disc*, disc % by buying',
    },
    max_disc: {
      type: 'double',
      default: 0,
      comment: 'cap disc from % or fix_disc',
    },
    image: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    qty: {
      type: 'int',
      default: 0,
      comment: 'quota voucher',
    },
    used: {
      type: 'int',
      default: 0,
    },
    status: {
      type: 'enum',
      enum: ['1', '2', '3', '4'],
      default: '1',
      comment: 'Order (1=activ, 2=non activ, 3=expire, 4=outquota)',
    },
    started_at: {
      type: 'timestamp',
      createDate: true,
    },
    expired_at: {
      type: 'timestamp',
      deleteDate: true,
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
