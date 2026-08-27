const {
  EntitySchema
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'Stock',
  tableName: 'stock',
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
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
    expired_at: {
      type: 'timestamp',
      nullable: true,
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
      onDelete: 'CASCADE',
      nullable: false,
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
    market: {
      type: 'many-to-one',
      target: 'Profile',
      joinColumn: {
        name: 'market_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
    purchase: {
      type: 'many-to-one',
      target: 'Purchase',
      joinColumn: {
        name: 'purchase_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
  },
});