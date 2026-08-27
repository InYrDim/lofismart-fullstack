const {
  EntitySchema
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'HasPermit',
  tableName: 'has_permit',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 8,
    },
  },
  relations: {
    role: {
      type: 'many-to-one',
      target: 'Role',
      joinColumn: {
        name: 'role_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
      eager: true,
    },
    permission: {
      type: 'many-to-one',
      target: 'Permission',
      joinColumn: {
        name: 'permission_id',
        referencedColumnName: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
      eager: true,
    },
  },
});