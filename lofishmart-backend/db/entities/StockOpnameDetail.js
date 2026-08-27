const {
  EntitySchema
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'StockOpnameDetail',
  tableName: 'stock_opname_detail',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 16,
    },
    current_stock: {
      type: 'double',
      default: 0,
    },
    actual_stock: {
      type: 'double',
      default: 0,
    },
    missing_stock: {
      type: 'double',
      default: 0,
    },
    barcode: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    adjustment_type: {
      type: 'enum',
      enum: ['1', '2', '3', '4'],
      default: '1',
      comment: 'Satuan produk (1 = expired, 2 = broken, 3 = other)',
    },
    attachment: {
      type: 'varchar',
      length: 200,
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
    stockOpname: {
      type: 'many-to-one',
      target: 'StockOpname',
      joinColumn: {
        name: 'stock_opname_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
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
  },
});