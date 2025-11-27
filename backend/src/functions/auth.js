const { app } = require('@azure/functions');
const { registerUser, loginUser, generateToken } = require('../auth');

app.http('register', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { email, password, name } = body;

      if (!email || !password || !name) {
        return {
          status: 400,
          jsonBody: { error: 'Email, password, and name are required' }
        };
      }

      const user = await registerUser(email, password, name);
      const token = generateToken(user);

      return {
        status: 201,
        jsonBody: {
          user: {
            id: user.Id,
            email: user.Email,
            name: user.Name,
            avatar: user.Avatar
          },
          token
        },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    } catch (err) {
      context.error('Register error:', err);
      return {
        status: 400,
        jsonBody: { error: err.message || 'Registration failed' },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  }
});

app.http('login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return {
          status: 400,
          jsonBody: { error: 'Email and password are required' }
        };
      }

      const user = await loginUser(email, password);
      const token = generateToken(user);

      return {
        status: 200,
        jsonBody: {
          user: {
            id: user.Id,
            email: user.Email,
            name: user.Name,
            avatar: user.Avatar
          },
          token
        },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    } catch (err) {
      context.error('Login error:', err);
      return {
        status: 401,
        jsonBody: { error: 'Invalid credentials' },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  }
});

