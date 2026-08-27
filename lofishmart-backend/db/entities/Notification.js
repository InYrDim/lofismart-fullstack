const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Notification',
  tableName: 'notification',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 8,
    },
    type: {
      type: 'enum',
      enum: ['1', '2', '3'],
      default: '1',
      comment: 'info, success, warning, danger',
    },
    message: {
      type: 'text',
      nullable: true,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    read_at: {
      type: 'timestamp',
      updateDate: true,
    },
  },
  relations: {
    profile: {
      type: 'many-to-one',
      target: 'Profile',
      joinColumn: {
        name: 'profile_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      nullable: true,
      eager: true,
    },
  },
});
