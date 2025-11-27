const { registerUser, generateToken } = require('../src/auth');

module.exports = async function (context, req) {
    context.log('Register function triggered');

    // Manejar OPTIONS para CORS
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: ''
        };
        return;
    }

    try {
        const { email, password, name } = req.body || {};

        if (!email || !password || !name) {
            context.res = {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Email, password, and name are required' })
            };
            return;
        }

        const user = await registerUser(email, password, name);
        const token = generateToken(user);

        context.res = {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                user: {
                    id: user.Id,
                    email: user.Email,
                    name: user.Name,
                    avatar: user.Avatar
                },
                token
            })
        };
    } catch (err) {
        context.log.error('Register error:', err);
        context.res = {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: err.message || 'Registration failed' })
        };
    }
};

