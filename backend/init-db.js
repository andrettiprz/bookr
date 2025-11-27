// Script temporal para inicializar la base de datos
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: process.env.SQL_SERVER || 'bookr-sql-server.database.windows.net',
  database: process.env.SQL_DATABASE || 'bookr-sql-db',
  user: process.env.SQL_USER || 'bookradmin',
  password: process.env.SQL_PASSWORD || 'Bookr@2024!SQL',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  }
};

async function initDatabase() {
  try {
    console.log('Conectando a SQL Server...');
    console.log(`Server: ${config.server}`);
    console.log(`Database: ${config.database}`);
    console.log(`User: ${config.user}`);
    
    const pool = await sql.connect(config);
    console.log('✅ Conectado exitosamente');

    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Ejecutando script de schema...');
    
    // Dividir el schema en statements individuales
    const statements = schema
      .split('GO')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      console.log(`Ejecutando statement ${i + 1}/${statements.length}...`);
      await pool.request().query(statements[i]);
    }

    console.log('✅ Base de datos inicializada exitosamente');
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

initDatabase();

