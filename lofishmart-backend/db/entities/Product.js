const {
  EntitySchema
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'Product',
  tableName: 'product',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 8,
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    barcode: {
      type: 'varchar',
      length: 30,
      nullable: true,
      unique: true,
    },
    unit: {
      type: 'enum',
      enum: ['1', '2'],
      default: '1',
      comment: 'Satuan produk (2 = per item, 1 = per kilogram)',
    },
    is_non_stock: {
      type: 'enum',
      enum: ['1', '2'],
      default: '1',
      comment: 'Satuan produk (1 = ready, 2 = pre order/kosong)',
    },
    is_show: {
      type: 'enum',
      enum: ['1', '2'],
      default: '1',
      comment: 'Tampilkan (1 = show, 2 = hide)',
    },
    image: {
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
    deleted_at: {
      type: 'timestamp',
      deleteDate: true,
    },
  },
  relations: {
    category: {
      type: 'many-to-one',
      target: 'Category',
      joinColumn: {
        name: 'category_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
      eager: true,
    },
  },
});