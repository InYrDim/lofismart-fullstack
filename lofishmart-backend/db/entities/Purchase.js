// entities/User.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Purchase',
  tableName: 'purchase',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 16,
    },
    batch: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    barcode: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    unit: {
      type: 'enum',
      enum: ['1', '2'],
      default: '1',
      comment: 'Satuan produk (2 = per item, 1 = per kilogram)',
    },
    qty: {
      type: 'double',
      default: 0,
    },
    price: {
      type: 'double',
      default: 0,
    },
    expired_at: {
      type: 'timestamp',
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
    image_proof: {
      type: 'text',
      nullable: true,
      comment: 'URL/path bukti foto nota/penerimaan barang',
    },
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
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: {
        name: 'product_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
    warehouse: {
      type: 'many-to-one',
      target: 'Profile',
      joinColumn: {
        name: 'warehouse_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
    supplier: {
      type: 'many-to-one',
      target: 'Supplier',
      joinColumn: {
        name: 'supplier_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
  },
});
