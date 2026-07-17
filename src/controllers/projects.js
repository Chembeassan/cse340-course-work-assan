import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';
import { getCategoriesByProject } from '../models/category.js';

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
        
        const categories = await getCategoriesByProject(projectId);
        const title = project.title;
        
        res.render('project', { title, project, categories });
    } catch (error) {
        console.error('Error fetching project details:', error);
        const err = new Error('Failed to load project details');
        err.status = 500;
        next(err);
    }
};

export { showProjectsPage, showProjectDetailsPage };