const sql = require('mssql');
const fs = require('fs');
const path = require('path');

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
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

module.exports = async function (context, req) {
    context.log('InitDB function triggered');

    let pool = null;
    
    try {
        context.log('Conectando a SQL Server...');
        pool = await sql.connect(config);
        context.log('✅ Conectado exitosamente');

        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        context.log('Ejecutando script de schema...');
        
        // Dividir el schema en statements individuales
        const statements = schema
            .split('GO')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        context.log(`Total statements: ${statements.length}`);

        for (let i = 0; i < statements.length; i++) {
            context.log(`Ejecutando statement ${i + 1}/${statements.length}...`);
            try {
                await pool.request().query(statements[i]);
                context.log(`✅ Statement ${i + 1} ejecutado`);
            } catch (err) {
                if (err.message.includes('There is already an object') || 
                    err.message.includes('already exists')) {
                    context.log(`⚠️  Statement ${i + 1} - objeto ya existe, continuando...`);
                } else {
                    context.log.error(`❌ Error en statement ${i + 1}:`, err.message);
                    throw err;
                }
            }
        }

        // Insertar usuario demo
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE Id = '00000000-0000-0000-0000-000000000001')
                BEGIN
                    INSERT INTO [dbo].[Users] (Id, Email, PasswordHash, Name, Avatar)
                    VALUES ('00000000-0000-0000-0000-000000000001', 'demo@bookr.com', 'demo', 'Usuario Demo', '👤')
                END
            `);
            context.log('✅ Usuario demo creado');
        } catch (err) {
            context.log('⚠️  Usuario demo ya existe');
        }

        await pool.close();

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                message: 'Base de datos inicializada exitosamente',
                statements: statements.length
            })
        };
    } catch (err) {
        context.log.error('InitDB error:', err.message);
        
        if (pool) {
            try {
                await pool.close();
            } catch (closeErr) {
                context.log.error('Error closing pool:', closeErr);
            }
        }
        
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: err.message,
                details: err.toString()
            })
        };
    }
};
