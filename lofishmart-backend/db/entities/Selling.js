const {
  EntitySchema
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'Selling',
  tableName: 'selling',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 20,
    },
    payment_id: {
      type: 'varchar',
      length: 200,
      nullable: true,
    },
    total_weight_qty: {
      type: 'double',
      default: 0,
    },
    totol_pcs_qty: {
      type: 'double',
      default: 0,
    },
    price: {
      type: 'double',
      default: 0,
    },
    per_item_disc: {
      type: 'double',
      default: 0,
    },
    voucher_disc: {
      type: 'double',
      default: 0,
    },
    total_disc: {
      type: 'double',
      default: 0,
    },
    tax_price: {
      type: 'double',
      default: 0,
    },
    total_price: {
      type: 'double',
      default: 0,
    },
    payed_money: {
      type: 'double',
      default: 0,
    },
    change_money: {
      type: 'double',
      default: 0,
    },
    is_paid: {
      type: 'enum',
      enum: ['1', '2', '3', '4'],
      default: '1',
      comment: 'Status pembayaran (1 = overview, 2 = unpaid, 3 = paid)',
    },
    online_order: {
      type: 'enum',
      enum: ['1', '2', '3'],
      default: '1',
      comment: 'Order (1 = offline, 2 = offline, 3 = other)',
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
    deleted_at: {
      type: 'timestamp',
      deleteDate: true,
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
    member: {
      type: 'many-to-one',
      target: 'Member',
      joinColumn: {
        name: 'member_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
    payment: {
      type: 'many-to-one',
      target: 'PeymentMethod',
      joinColumn: {
        name: 'payment_method_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
    voucher: {
      type: 'many-to-one',
      target: 'Voucher',
      joinColumn: {
        name: 'voucher_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
  },
});