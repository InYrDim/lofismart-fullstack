const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'StockTransfer',
  tableName: 'stock_transfer',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 16,
    },
    qty: {
      type: 'double',
      default: 0,
      comment: 'Jumlah yang dikirim dari gudang',
    },
    unit: {
      type: 'enum',
      enum: ['1', '2'],
      default: '1',
      comment: 'Satuan: 1=KG, 2=Ekor',
    },
    status: {
      type: 'enum',
      enum: ['SENDING', 'WAITING_VERIFICATION', 'DONE', 'CANCELLED'],
      default: 'SENDING',
    },
    notes: {
      type: 'varchar',
      length: 500,
      nullable: true,
      comment: 'Catatan dari pengirim',
    },
    verified_qty: {
      type: 'double',
      nullable: true,
      comment: 'Qty yang diterima setelah verifikasi SPVR',
    },
    verified_notes: {
      type: 'varchar',
      length: 500,
      nullable: true,
      comment: 'Catatan penerimaan dari SPVR',
    },
    sent_at: {
      type: 'timestamp',
      nullable: true,
      comment: 'Waktu status berubah ke WAITING_VERIFICATION',
    },
    verified_at: {
      type: 'timestamp',
      nullable: true,
      comment: 'Waktu status berubah ke DONE',
    },
    transfer_group: {
      type: 'varchar',
      length: 36,
      nullable: true,
      comment: 'ID grup untuk batch transfer order',
    },
    image_proof: {
      type: 'varchar',
      length: 500,
      nullable: true,
      comment: 'Bukti foto penerimaan',
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
    source_stock: {
      type: 'many-to-one',
      target: 'Stock',
      joinColumn: {
        name: 'source_stock_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
    target_market: {
      type: 'many-to-one',
      target: 'Profile',
      joinColumn: {
        name: 'target_market_id',
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
    created_by: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'created_by_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
    verified_by: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'verified_by_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: false,
    },
  },
});
