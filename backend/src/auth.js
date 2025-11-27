const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign(
    { id: user.Id, email: user.Email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

async function registerUser(email, password, name) {
  const passwordHash = await hashPassword(password);
  
  const result = await query(`
    INSERT INTO [dbo].[Users] (Email, PasswordHash, Name)
    OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.Name, INSERTED.CreatedAt
    VALUES (@email, @passwordHash, @name)
  `, {
    email: { type: require('mssql').VarChar, value: email },
    passwordHash: { type: require('mssql').VarChar, value: passwordHash },
    name: { type: require('mssql').VarChar, value: name }
  });
  
  return result[0];
}

async function loginUser(email, password) {
  const users = await query(`
    SELECT Id, Email, PasswordHash, Name, Avatar, CreatedAt
    FROM [dbo].[Users]
    WHERE Email = @email AND IsActive = 1
  `, {
    email: { type: require('mssql').VarChar, value: email }
  });
  
  if (users.length === 0) {
    throw new Error('Invalid credentials');
  }
  
  const user = users[0];
  const isValid = await comparePassword(password, user.PasswordHash);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  delete user.PasswordHash;
  return user;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  registerUser,
  loginUser
};

