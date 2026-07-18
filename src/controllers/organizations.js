import { getAllOrganizations, getOrganizationDetails, createOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

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

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    res.render('new-organization', { title });
};

const processNewOrganizationForm = async (req, res, next) => {
    try {
        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png';
        
        const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
        
        req.flash('success', 'Organization added successfully!');
        
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error('Error creating organization:', error);
        const err = new Error('Failed to create organization');
        err.status = 500;
        next(err);
    }
};

export { 
    showOrganizationsPage, 
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm
};