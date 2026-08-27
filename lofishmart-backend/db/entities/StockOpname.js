const {
  EntitySchema
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'StockOpname',
  tableName: 'stock_opname',
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
    status: {
      type: 'enum',
      enum: ['1', '2', '3'],
      default: '1',
      comment: 'Status (1 = overview, 1 = approved, 3 = pending)',
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
    approved_at: {
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
  },
});