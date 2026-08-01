import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Create a new user in the database
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} passwordHash - Hashed password
 * @returns {Promise<number>} The new user's ID
 */
const createUser = async (name, email, passwordHash) => {
    // Get the "user" role ID (role_id = 1 for standard users)
    const roleQuery = `SELECT role_id FROM roles WHERE role_name = 'user'`;
    const roleResult = await db.query(roleQuery);
    
    if (roleResult.rows.length === 0) {
        throw new Error('Default role "user" not found. Please run the role setup SQL.');
    }
    
    const roleId = roleResult.rows[0].role_id;
    
    // Insert the new user
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
 * @param {string} email - User's email address
 * @returns {Promise<Object>} User object or null
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

// ===== AUTHENTICATION FUNCTIONS =====

/**
 * Find a user by email (internal use only)
 * @param {string} email - User's email address
 * @returns {Promise<Object|null>} User object or null
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT user_id, name, email, password_hash, role_id 
        FROM users 
        WHERE email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Verify a password against a hash (internal use only)
 * @param {string} password - Plain text password
 * @param {string} passwordHash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticate a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object|null>} User object without password_hash, or null if authentication fails
 */
const authenticateUser = async (email, password) => {
    // Find the user by email
    const user = await findUserByEmail(email);
    if (!user) {
        return null; // User not found
    }

    // Verify the password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
        return null; // Invalid password
    }

    // Remove password_hash from user object
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export { 
    createUser, 
    getUserByEmail,
    authenticateUser  // Export only this for the controller
};