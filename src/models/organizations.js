import db from './db.js';

const getAllOrganizations = async() => {
    const query = `
        SELECT 
            organization_id,
            name,
            description,
            contact_email,
            logo_filename
        FROM public.organization
        ORDER BY name;
    `;
    const result = await db.query(query);
    return result.rows;
};

const getOrganizationDetails = async (organizationId) => {
    const query = `
        SELECT
            organization_id,
            name,
            description,
            contact_email,
            logo_filename
        FROM public.organization
        WHERE organization_id = $1;
    `;
    const queryParams = [organizationId];
    const result = await db.query(query, queryParams);
    return result.rows.length > 0 ? result.rows[0] : null;
};

const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
        INSERT INTO organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id
    `;
    const queryParams = [name, description, contactEmail, logoFilename];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create organization');
    }

    return result.rows[0].organization_id;
};

export { 
    getAllOrganizations, 
    getOrganizationDetails,
    createOrganization
};