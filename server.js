import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js';
import flash from './src/middleware/flash.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Set up session management
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

// Use flash message middleware
app.use(flash);

// Configure Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log all incoming requests
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

// Middleware to make NODE_ENV available to all templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = process.env.NODE_ENV;
    next();
});

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// IMPORTANT: Use routes BEFORE static files
app.use(router);

// Static files AFTER routes
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);
    
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };
    
    res.status(status).render(`errors/${template}`, context);
});

app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});