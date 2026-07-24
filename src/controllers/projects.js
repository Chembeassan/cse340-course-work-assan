import { getAllProjects, getProjectDetails, createProject } from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';
import { getCategoriesByProjectId } from '../models/categories.js';  // ADD THIS IMPORT
import { body, validationResult } from 'express-validator';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

/**
 * Display the projects list page with upcoming projects
 */
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        console.error('Error fetching upcoming projects:', error);
        const err = new Error('Failed to load projects');
        err.status = 500;
        next(err);
    }
};

/**
 * Display the project details page
 */
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);
        
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        
        // FIX: Use the correct imported function name
        const categories = await getCategoriesByProjectId(projectId);
        const title = project.title;
        
        res.render('project', { title, project, categories });
    } catch (error) {
        console.error('Error fetching project details:', error);
        const err = new Error('Failed to load project details');
        err.status = 500;
        next(err);
    }
};

const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';
        const formData = req.flash('formData') ? req.flash('formData')[0] : {};
        res.render('new-project', { 
            title, 
            organizations,
            formData: formData
        });
    } catch (error) {
        console.error('Error fetching organizations for new project:', error);
        const err = new Error('Failed to load new project form');
        err.status = 500;
        next(err);
    }
};

// Process New Project Form
const processNewProjectForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Store form data in flash to repopulate the form
        req.flash('formData', req.body);
        
        // Redirect back to the new project form
        return res.redirect('/new-project');
    }

    try {
        const { title, description, location, date, organizationId } = req.body;
        
        const projectId = await createProject(title, description, location, date, organizationId);
        req.flash('success', 'Project added successfully!');
        res.redirect('/projects');
    } catch (error) {
        console.error('Error creating project:', error);
        req.flash('error', 'Failed to create project. Please try again.');
        res.redirect('/new-project');
    }
};

// Project Validation Rules
const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Project title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Project title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required')
        .isLength({ max: 1000 })
        .withMessage('Project description cannot exceed 1000 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Project location is required')
        .isLength({ max: 200 })
        .withMessage('Project location cannot exceed 200 characters'),
    body('date')
        .notEmpty()
        .withMessage('Project date is required')
        .isISO8601()
        .withMessage('Please provide a valid date'),
    body('organizationId')
        .notEmpty()
        .withMessage('Organization is required')
        .isInt()
        .withMessage('Invalid organization selection')
];

// exports
export { 
    showProjectsPage, 
    showProjectDetailsPage,
    showNewProjectForm,     
    processNewProjectForm,  
    projectValidation      
};