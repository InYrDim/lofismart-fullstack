// entities/User.js
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
	name: "SellingProductDetail",
	tableName: "selling_product_detail",
	columns: {
		id: {
			primary: true,
			type: "varchar",
			length: 24,
		},
		qty: {
			type: "int",
			default: 0,
			comment: "quota voucher",
		},
		mod_price: {
			type: "double",
			default: 0,
			comment: "if grade is 3-4",
		},
		total_price: {
			type: "double",
			default: 0,
			comment: "price * weight/pcs",
		},
		total_weight: {
			type: "double",
			default: 0,
			comment: "total weight of the item",
		},
		note: {
			type: "text",
			nullable: true,
		},
		created_at: {
			type: "timestamp",
			createDate: true,
		},
		updated_at: {
			type: "timestamp",
			updateDate: true,
		},
	},
	relations: {
		selling: {
			type: "many-to-one",
			target: "Selling",
			joinColumn: {
				name: "selling_id",
				referencedColumnName: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
			nullable: false,
			eager: true,
		},
		price: {
			type: "many-to-one",
			target: "Price",
			joinColumn: {
				name: "price_id",
				referencedColumnName: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
			nullable: true,
			eager: true,
		},
		stock: {
			type: "many-to-one",
			target: "Stock",
			joinColumn: {
				name: "stock_id",
				referencedColumnName: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
			nullable: true,
			eager: true,
		},
	},
});
