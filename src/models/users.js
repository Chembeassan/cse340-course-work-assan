import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Create a new user in the database
 */
const createUser = async (name, email, passwordHash) => {
    const roleQuery = `SELECT role_id FROM roles WHERE role_name = 'user'`;
    const roleResult = await db.query(roleQuery);
    
    if (roleResult.rows.length === 0) {
        throw new Error('Default role "user" not found. Please run the role setup SQL.');
    }
    
    const roleId = roleResult.rows[0].role_id;
    
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id
    `;
    const values = [name, email, passwordHash, roleId];
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }
    
    return result.rows[0].user_id;
};

/**
 * Get a user by email
 */
const getUserByEmail = async (email) => {
    const query = `
        SELECT 
            u.user_id,
            u.name,
            u.email,
            u.password_hash,
            u.role_id,
            r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Find a user by email (for authentication)
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT 
            u.user_id, 
            u.name, 
            u.email, 
            u.password_hash, 
            u.role_id,
            r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Verify password
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticate user
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
        return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export { 
    createUser, 
    getUserByEmail,
    authenticateUser
};