const sql = require('mssql');

let pool = null;

const config = {
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function getConnection() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('Connected to SQL Server');
    } catch (err) {
      console.error('SQL Connection Error:', err);
      throw err;
    }
  }
  return pool;
}

async function query(queryString, params = {}) {
  const pool = await getConnection();
  const request = pool.request();
  
  // Add parameters
  Object.keys(params).forEach(key => {
    request.input(key, params[key]);
  });
  
  const result = await request.query(queryString);
  return result.recordset;
}

async function execute(procedureName, params = {}) {
  const pool = await getConnection();
  const request = pool.request();
  
  Object.keys(params).forEach(key => {
    request.input(key, params[key]);
  });
  
  const result = await request.execute(procedureName);
  return result.recordset;
}

module.exports = {
  getConnection,
  query,
  execute,
  sql
};

