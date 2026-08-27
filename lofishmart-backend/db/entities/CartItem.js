// entities/User.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'CartItem',
  tableName: 'cart_item',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      unsigned: true,
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
      deleteDate: true,
    },
  },
  relations: {
    price: {
      type: 'many-to-one',
      target: 'Price',
      joinColumn: {
        name: 'price_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
      eager: true,
    },
    weight_scale: {
      type: 'many-to-one',
      target: 'WeightScale',
      joinColumn: {
        name: 'weight_scale_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
      eager: true,
    },
  },
});
