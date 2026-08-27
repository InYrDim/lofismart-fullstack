// entities/User.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'SellingServiceDetail',
  tableName: 'selling_service_detail',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 24,
    },
    qty: {
      type: 'int',
      default: 0,
      comment: 'quota voucher',
    },
    mod_price: {
      type: 'double',
      default: 0,
    },
    total_price: {
      type: 'double',
      default: 0,
      comment: 'price * weight/pcs'
    },
    note: {
      type: 'text',
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
  },
  relations: {
    selling: {
      type: 'many-to-one',
      target: 'Selling',
      joinColumn: {
        name: 'selling_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
      eager: true,
    },
    service: {
      type: 'many-to-one',
      target: 'Service',
      joinColumn: {
        name: 'service_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    }
  }
});
