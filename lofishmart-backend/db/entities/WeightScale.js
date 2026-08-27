// entities/User.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'WeightScale',
  tableName: 'weight_scale',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      unsigned: true,
    },
    name: {
      type: 'varchar',
      length: 30,
      nullable: false,
    },
    status: {
      type: 'enum',
      enum: ['1', '2', '3'],
      default: '1',
      comment: 'Order (1 = activ connect, 2 = disconnect, 3 = non activ)',
    },
    mac_ip: {
      type: 'varchar',
      length: 30,
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
});
