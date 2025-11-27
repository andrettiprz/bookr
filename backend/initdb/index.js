const { query } = require('../src/database');
const fs = require('fs');
const path = require('path');

module.exports = async function (context, req) {
    context.log('InitDB function triggered');

    try {
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        context.log('Ejecutando script de schema...');
        
        // Dividir el schema en statements individuales
        const statements = schema
            .split('GO')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (let i = 0; i < statements.length; i++) {
            context.log(`Ejecutando statement ${i + 1}/${statements.length}...`);
            try {
                await query(statements[i]);
            } catch (err) {
                // Ignorar errores de "objeto ya existe"
                if (!err.message.includes('There is already an object')) {
                    throw err;
                }
                context.log(`Statement ${i + 1} - objeto ya existe, continuando...`);
            }
        }

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: 'Base de datos inicializada exitosamente',
                statements: statements.length
            })
        };
    } catch (err) {
        context.log.error('InitDB error:', err);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: err.message })
        };
    }
};

