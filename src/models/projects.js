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
const getProjectsByOrganization = async(organizationId) => {
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

export { getAllProjects, getProjectsByOrganization, getProjectById };