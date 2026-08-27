// entities/User.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'CashDrawer',
  tableName: 'cash_drawer',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      unsigned: true,
    },
    is_open: {
      type: 'enum',
      enum: ['1', '2'],
      default: '1',
      comment: 'Order (1 = yes, 2 = no)',
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
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
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
  },
});
