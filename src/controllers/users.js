import bcrypt from 'bcrypt';
import { createUser, getUserByEmail, authenticateUser, getAllUsers } from '../models/users.js';
import { body, validationResult } from 'express-validator';
import { getUserVolunteerProjects } from '../models/volunteers.js';

const saltRounds = 10;

// ===== MIDDLEWARE =====

/**
 * Middleware to require login for protected routes
 */
const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'Please log in to access this page.');
        return res.redirect('/login');
    }
    next();
};

/**
 * Middleware factory to require a specific role
 */
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'Please log in to access this page.');
            return res.redirect('/login');
        }
        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }
        next();
    };
};

// ===== REGISTRATION =====

/**
 * Display the user registration form
 */
const showUserRegistrationForm = (req, res) => {
    const title = 'Register';
    const formData = req.flash('formData') ? req.flash('formData')[0] : {};
    res.render('register', { title, formData });
};

/**
 * Process user registration form submission
 */
const processUserRegistrationForm = async (req, res) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        req.flash('formData', req.body);
        return res.redirect('/register');
    }

    try {
        const { name, email, password } = req.body;
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            req.flash('error', 'Email already registered. Please use a different email.');
            req.flash('formData', req.body);
            return res.redirect('/register');
        }
        const passwordHash = await bcrypt.hash(password, saltRounds);
        await createUser(name, email, passwordHash);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Registration failed. Please try again.');
        req.flash('formData', req.body);
        res.redirect('/register');
    }
};

// ===== LOGIN =====

/**
 * Display the login form
 */
const showLoginForm = (req, res) => {
    const title = 'Login';
    const formData = req.flash('formData') ? req.flash('formData')[0] : {};
    res.render('login', { title, formData });
};

/**
 * Process login form submission
 */
const processLoginForm = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authenticateUser(email, password);
        if (user) {
            req.session.user = {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role_id: user.role_id,
                role_name: user.role_name
            };
            console.log('User logged in:', user.email);
            req.flash('success', `Welcome back, ${user.name}!`);
            return res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password. Please try again.');
            req.flash('formData', req.body);
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/login');
    }
};

/**
 * Process logout
 */
const processLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            req.flash('error', 'Logout failed. Please try again.');
            return res.redirect('/');
        }
        req.flash('success', 'You have been logged out successfully.');
        res.redirect('/login');
    });
};

// ===== DASHBOARD =====

/**
 * Display the user dashboard with volunteer projects
 */
const showDashboard = async (req, res) => {
    try {
        const user = req.session.user;
        const userId = user.user_id;
        const volunteerProjects = await getUserVolunteerProjects(userId);
        const title = 'Dashboard';
        res.render('dashboard', { 
            title, 
            name: user.name, 
            email: user.email,
            role: user.role_name,
            volunteerProjects: volunteerProjects
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        req.flash('error', 'Failed to load dashboard.');
        res.redirect('/');
    }
};

// ===== USERS LIST =====

/**
 * Display all users (admin only)
 */
const showUsersPage = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        const title = 'Manage Users';
        res.render('users', { 
            title, 
            users,
            currentUser: req.session.user
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        const err = new Error('Failed to load users');
        err.status = 500;
        next(err);
    }
};

// ===== VALIDATION =====

const userRegistrationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

// ===== EXPORTS =====

export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    userRegistrationValidation,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard,
    showUsersPage 
};