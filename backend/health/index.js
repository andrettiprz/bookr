module.exports = async function (context, req) {
    context.log('Health check triggered');

    const healthInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: {
            hasSQL_SERVER: !!process.env.SQL_SERVER,
            hasSQL_DATABASE: !!process.env.SQL_DATABASE,
            hasSQL_USER: !!process.env.SQL_USER,
            hasSQL_PASSWORD: !!process.env.SQL_PASSWORD,
            SQL_SERVER: process.env.SQL_SERVER,
            SQL_DATABASE: process.env.SQL_DATABASE,
            SQL_USER: process.env.SQL_USER
        }
    };

    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(healthInfo)
    };
};

