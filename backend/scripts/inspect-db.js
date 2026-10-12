/**
 * Database Inspector for EstateFlow
 * Safely inspects Oracle DB connection, schema tables, columns, constraints and row counts.
 * Run via: npm run inspect
 */
const { testConnection, executeQuery, closeDbPool, oracledb } = require('../src/config/db');

async function inspectDatabase() {
  console.log('====================================================');
  console.log('       ESTATEFLOW - ORACLE DATABASE INSPECTOR       ');
  console.log('====================================================\n');

  try {
    const connTest = await testConnection();
    console.log('Connection Test:');
    console.log(`  Status:         ${connTest.connected ? 'CONNECTED (HEALTHY)' : 'FAILED'}`);
    console.log(`  Mode:           ${connTest.mode}`);
    console.log(`  Connect String: ${connTest.connectString}`);
    console.log(`  Active Schema:  ${connTest.schema}\n`);

    if (!connTest.connected) {
      console.error(`Connection Error: ${connTest.error}`);
      process.exit(1);
    }

    const tables = ['AGENT', 'CATEGORY', 'PROPERTY', 'CLIENT', 'SHOWING', 'OFFER', 'TRANSACTION'];

    console.log('Table Row Counts:');
    for (const table of tables) {
      try {
        const countRes = await executeQuery(`SELECT COUNT(*) AS CNT FROM ${table}`);
        const count = countRes.rows[0].CNT;
        console.log(`  - ${table.padEnd(15)}: ${count} rows`);
      } catch (err) {
        console.log(`  - ${table.padEnd(15)}: ERROR (${err.message})`);
      }
    }

    console.log('\nColumn Metadata:');
    for (const table of tables) {
      console.log(`\n--- TABLE: ${table} ---`);
      const colRes = await executeQuery(
        `SELECT column_name, data_type, data_length, data_precision, data_scale, nullable 
         FROM all_tab_columns 
         WHERE owner = 'SYSTEM' AND table_name = :tbl 
         ORDER BY column_id`,
        { tbl: table }
      );
      for (const col of colRes.rows) {
        let typeStr = col.DATA_TYPE;
        if (col.DATA_PRECISION) {
          typeStr += `(${col.DATA_PRECISION}${col.DATA_SCALE ? ',' + col.DATA_SCALE : ''})`;
        } else if (col.DATA_LENGTH && col.DATA_TYPE.includes('CHAR')) {
          typeStr += `(${col.DATA_LENGTH})`;
        }
        console.log(`  ${col.COLUMN_NAME.padEnd(20)} ${typeStr.padEnd(15)} ${col.NULLABLE === 'N' ? 'NOT NULL' : 'NULLABLE'}`);
      }
    }

    console.log('\nForeign Key Constraints:');
    const fkRes = await executeQuery(
      `SELECT a.table_name, a.constraint_name, c_pk.table_name AS r_table_name, a.delete_rule
       FROM all_constraints a
       JOIN all_constraints c_pk ON a.r_constraint_name = c_pk.constraint_name AND a.r_owner = c_pk.owner
       WHERE a.owner = 'SYSTEM' 
         AND a.constraint_type = 'R'
         AND a.table_name IN ('AGENT', 'CATEGORY', 'PROPERTY', 'CLIENT', 'SHOWING', 'OFFER', 'TRANSACTION')
       ORDER BY a.table_name`
    );
    for (const fk of fkRes.rows) {
      console.log(`  ${fk.TABLE_NAME.padEnd(12)} -> REFERENCES ${fk.R_TABLE_NAME.padEnd(12)} [${fk.CONSTRAINT_NAME}] (ON DELETE ${fk.DELETE_RULE || 'RESTRICT'})`);
    }

    console.log('\nInspection complete.');
  } catch (err) {
    console.error('Fatal inspection error:', err.message);
  } finally {
    await closeDbPool();
  }
}

inspectDatabase();
