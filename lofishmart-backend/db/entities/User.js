const {
  EntitySchema
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'user',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 8,
    },
    name: {
      type: 'varchar',
      length: 150,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 150,
      unique: true,
      nullable: false,
    },
    username: {
      type: 'varchar',
      length: 30,
      unique: true,
      nullable: false,
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    remember_token: {
      type: 'varchar',
      length: 150,
      nullable: true,
      comment: 'auto login'
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
    permissions: {
      type: 'json',
      nullable: true,
    },
    image: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    market_id: {
      type: 'varchar',
      length: 12,
      nullable: true,
    },
    role_id: {
      type: 'varchar',
      length: 8,
      nullable: true,
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
    },
  },
});