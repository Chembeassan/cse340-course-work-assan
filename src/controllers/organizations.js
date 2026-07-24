import { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        const err = new Error('Failed to load organizations');
        err.status = 500;
        next(err);
    }
};

const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        const organizationDetails = await getOrganizationDetails(organizationId);
        
        if (!organizationDetails) {
            const err = new Error('Organization not found');
            err.status = 404;
            return next(err);
        }
        
        const projects = await getProjectsByOrganizationId(organizationId);
        const title = organizationDetails.name;
        
        res.render('organization', { title, organizationDetails, projects });
    } catch (error) {
        console.error('Error fetching organization details:', error);
        const err = new Error('Failed to load organization details');
        err.status = 500;
        next(err);
    }
};

// Define validation and sanitization rules for organization form
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

const processNewOrganizationForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Store form data in flash to repopulate the form
        req.flash('formData', req.body);
        
        // Redirect back to the new organization form
        return res.redirect('/new-organization');
    }

    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png';

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
    req.flash('success', 'Organization added successfully!');
    res.redirect(`/organization/${organizationId}`);
};

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    const formData = req.flash('formData') ? req.flash('formData')[0] : {};
    res.render('new-organization', { 
        title,
        formData: formData  
    });
};

// Display edit organization form
const showEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        const organizationDetails = await getOrganizationDetails(organizationId);
        
        if (!organizationDetails) {
            const err = new Error('Organization not found');
            err.status = 404;
            return next(err);
        }
        
        const title = `Edit ${organizationDetails.name}`;
        const formData = req.flash('formData') ? req.flash('formData')[0] : {};
        
        res.render('edit-organization', { 
            title, 
            organizationDetails,
            formData: formData
        });
    } catch (error) {
        console.error('Error fetching organization for edit:', error);
        const err = new Error('Failed to load organization for editing');
        err.status = 500;
        next(err);
    }
};

// Process edit organization form submission
const processEditOrganizationForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Store form data in flash to repopulate the form
        req.flash('formData', req.body);
        
        // Redirect back to the edit organization form
        return res.redirect(`/edit-organization/${req.params.id}`);
    }

    try {
        const organizationId = req.params.id;
        const { name, description, contactEmail } = req.body;
        const logoFilename = req.body.logoFilename || 'placeholder-logo.png';
        
        await updateOrganization(organizationId, name, description, contactEmail, logoFilename);
        
        req.flash('success', 'Organization updated successfully!');
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error('Error updating organization:', error);
        req.flash('error', 'Failed to update organization. Please try again.');
        res.redirect(`/edit-organization/${req.params.id}`);
    }
};

export { 
    showOrganizationsPage, 
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation
};