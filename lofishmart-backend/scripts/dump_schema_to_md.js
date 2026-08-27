require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        const [tables] = await connection.execute(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_type = 'BASE TABLE'
        `, [process.env.DB_NAME]);

        let markdown = "# Database Schema Reference\\n\\n";
        markdown += "Automatically generated from the database schema.\\n\\n";

        for (const row of tables) {
            const tableName = row.TABLE_NAME || row.table_name;
            markdown += `## Table: \`${tableName}\`\\n\\n`;

            const [columns] = await connection.execute(`
                SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA, COLUMN_COMMENT
                FROM information_schema.columns
                WHERE table_schema = ? AND table_name = ?
                ORDER BY ORDINAL_POSITION
            `, [process.env.DB_NAME, tableName]);

            markdown += "| Column | Type | Nullable | Default | Key/Extra | Comment |\\n";
            markdown += "|---|---|---|---|---|---|\\n";

            for (const col of columns) {
                const name = col.COLUMN_NAME || col.column_name;
                const type = col.COLUMN_TYPE || col.column_type;
                const isNullable = (col.IS_NULLABLE || col.is_nullable) === 'YES' ? 'Yes' : 'No';
                const defaultVal = col.COLUMN_DEFAULT || col.column_default || 'NULL';
                const key = col.COLUMN_KEY || col.column_key;
                const extra = col.EXTRA || col.extra;
                const comment = col.COLUMN_COMMENT || col.column_comment;

                const keyAttr = [];
                if (key === 'PRI') keyAttr.push('PK');
                if (key === 'UNI') keyAttr.push('UNIQUE');
                if (key === 'MUL') keyAttr.push('FK/IDX');
                if (extra) keyAttr.push(extra);

                const keyStr = keyAttr.length > 0 ? keyAttr.join(', ') : '';

                markdown += `| \`${name}\` | \`${type}\` | ${isNullable} | ${defaultVal} | ${keyStr} | ${comment} |\\n`;
            }

            markdown += "\\n";

            const [fks] = await connection.execute(`
                SELECT k.COLUMN_NAME, k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME
                FROM information_schema.table_constraints t
                JOIN information_schema.key_column_usage k
                USING(constraint_name,table_schema,table_name)
                WHERE t.constraint_type = 'FOREIGN KEY'
                  AND t.table_schema = ? AND t.table_name = ?
            `, [process.env.DB_NAME, tableName]);

            if (fks.length > 0) {
                markdown += "**Relations:**\\n";
                for (const fk of fks) {
                    const colName = fk.COLUMN_NAME || fk.column_name;
                    const refTable = fk.REFERENCED_TABLE_NAME || fk.referenced_table_name;
                    const refCol = fk.REFERENCED_COLUMN_NAME || fk.referenced_column_name;
                    markdown += `- \`${colName}\` -> \`${refTable}.${refCol}\`\\n`;
                }
                markdown += "\\n";
            }
            
            markdown += "\\n---\\n\\n";
        }

        const fs = require('fs');
        fs.writeFileSync('DATABASE_SCHEMA.md', markdown);
        console.log('Schema successfully dumped to DATABASE_SCHEMA.md');

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

run();
