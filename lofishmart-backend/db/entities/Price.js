const {
  EntitySchema
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'Price',
  tableName: 'price',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 16,
    },
    initial: {
      type: 'double',
      default: 0,
      comment: 'Harga beli',
    },
    selling: {
      type: 'double',
      default: 0,
      comment: 'Harga jual',
    },
    disc: {
      type: 'double',
      default: 0,
      comment: 'Disc',
    },
    barcode: {
      type: 'varchar',
      length: 10,
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
    grade: {
      type: 'many-to-one',
      target: 'Grade',
      joinColumn: {
        name: 'grade_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
      eager: true,
    },
    size: {
      type: 'many-to-one',
      target: 'Size',
      joinColumn: {
        name: 'size_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
      eager: true,
    },
  },
});