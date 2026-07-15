import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';

// Constant for number of upcoming projects to display
const NUMBER_OF_UPCOMING_PROJECTS = 5;

// Controller for the projects list page (shows upcoming projects)
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

// NEW: Controller for the project details page
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        
        // Get project details
        const project = await getProjectDetails(projectId);
        
        // If project doesn't exist, return 404
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        
        const title = project.title;
        res.render('project', { title, project });
    } catch (error) {
        console.error('Error fetching project details:', error);
        const err = new Error('Failed to load project details');
        err.status = 500;
        next(err);
    }
};

// Export controller functions
export { showProjectsPage, showProjectDetailsPage };