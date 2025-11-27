const { loginUser, generateToken } = require('../src/auth');

module.exports = async function (context, req) {
    context.log('Login function triggered');

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
        const { email, password } = req.body || {};

        if (!email || !password) {
            context.res = {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Email and password are required' })
            };
            return;
        }

        const user = await loginUser(email, password);
        const token = generateToken(user);

        context.res = {
            status: 200,
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
        context.log.error('Login error:', err);
        context.res = {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Invalid credentials' })
        };
    }
};

