import db from './db.js';

/**
 * Get all projects with their organization names
 * @returns {Promise<Array>} Array of project objects with organization info
 */
const getAllProjects = async() => {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            p.organization_id,
            o.name as organization_name
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        ORDER BY p.project_date DESC;
    `;

    const result = await db.query(query);
    return result.rows;
};

/**
 * Get projects by organization ID
 * @param {number} organizationId - The organization ID
 * @returns {Promise<Array>} Array of project objects
 */
const getProjectsByOrganizationId = async(organizationId) => {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            p.organization_id,
            o.name as organization_name
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE p.organization_id = $1
        ORDER BY p.project_date DESC;
    `;

    const result = await db.query(query, [organizationId]);
    return result.rows;
};

/**
 * Get a single project by ID
 * @param {number} projectId - The project ID
 * @returns {Promise<Object>} Project object with organization info
 */
const getProjectById = async(projectId) => {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            p.organization_id,
            o.name as organization_name,
            o.contact_email as organization_email
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows[0];
};

// Get upcoming projects (limit to specified number)
const getUpcomingProjects = async(numberOfProjects) => {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            p.organization_id,
            o.name as organization_name
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE p.project_date >= CURRENT_DATE
        ORDER BY p.project_date ASC
        LIMIT $1;
    `;

    const result = await db.query(query, [numberOfProjects]);
    return result.rows;
};

// Get project details by ID
const getProjectDetails = async(projectId) => {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            p.organization_id,
            o.name as organization_name
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows[0];
};

const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO project (title, description, location, project_date, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING project_id
    `;
    const values = [title, description, location, date, organizationId];
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }
    
    return result.rows[0].project_id;
};

// Update Project
const updateProject = async (projectId, title, description, location, date, organizationId) => {
    const query = `
        UPDATE project 
        SET 
            title = $1, 
            description = $2, 
            location = $3, 
            project_date = $4, 
            organization_id = $5
        WHERE project_id = $6
        RETURNING *
    `;
    const values = [title, description, location, date, organizationId, projectId];
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
        throw new Error('Failed to update project');
    }
    
    return result.rows[0];
};

// Export the model functions
export { 
    getAllProjects, 
    getProjectsByOrganizationId, 
    getProjectById,
    getUpcomingProjects,
    getProjectDetails,
    createProject,
    updateProject
};