import db from './db.js';

/**
 * Add a user as a volunteer for a project
 */
const addVolunteer = async (userId, projectId) => {
    const query = `
        INSERT INTO project_volunteers (user_id, project_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, project_id) DO NOTHING
        RETURNING volunteer_id
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rows.length > 0 ? result.rows[0].volunteer_id : null;
};

/**
 * Remove a user as a volunteer from a project
 */
const removeVolunteer = async (userId, projectId) => {
    const query = `
        DELETE FROM project_volunteers
        WHERE user_id = $1 AND project_id = $2
        RETURNING volunteer_id
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rows.length > 0;
};

/**
 * Check if a user is already a volunteer for a project
 */
const isUserVolunteer = async (userId, projectId) => {
    const query = `
        SELECT volunteer_id FROM project_volunteers
        WHERE user_id = $1 AND project_id = $2
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rows.length > 0;
};

/**
 * Get all projects a user has volunteered for
 */
const getUserVolunteerProjects = async (userId) => {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            o.name as organization_name,
            pv.volunteered_at
        FROM project_volunteers pv
        JOIN project p ON pv.project_id = p.project_id
        JOIN organization o ON p.organization_id = o.organization_id
        WHERE pv.user_id = $1
        ORDER BY p.project_date ASC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Get count of volunteers for a project
 */
const getVolunteerCount = async (projectId) => {
    const query = `
        SELECT COUNT(*) as count
        FROM project_volunteers
        WHERE project_id = $1
    `;
    const result = await db.query(query, [projectId]);
    return parseInt(result.rows[0].count);
};

export {
    addVolunteer,
    removeVolunteer,
    isUserVolunteer,
    getUserVolunteerProjects,
    getVolunteerCount
};