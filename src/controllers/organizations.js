// Import model functions
import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

// Controller for the organizations list page
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

// Controller for the organization details page
const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        
        // Get organization details
        const organizationDetails = await getOrganizationDetails(organizationId);
        
        // If organization doesn't exist, return 404
        if (!organizationDetails) {
            const err = new Error('Organization not found');
            err.status = 404;
            return next(err);
        }
        
        // Get projects for this organization 
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

// Export controller functions
export { showOrganizationsPage, showOrganizationDetailsPage };