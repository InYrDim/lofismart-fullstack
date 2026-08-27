const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Service',
  tableName: 'service',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 6,
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
    },
    unit: {
      type: 'enum',
      enum: ['1', '2'],
      default: '1',
      comment: 'Satuan produk (2 = per item, 1 = per kilogram)',
    },
    price: {
      type: 'double',
      default: 0,
      comment: 'Harga layanan',
    },
    disc: {
      type: 'double',
      default: 0,
      comment: 'Diskon layanan',
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
});
