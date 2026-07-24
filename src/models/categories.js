import db from './db.js';

// Get all categories
const getAllCategories = async () => {
    const query = `
        SELECT 
            category_id,
            name,
            description,
            created_at
        FROM category
        ORDER BY name
    `;
    const result = await db.query(query);
    return result.rows;
};

// Get category by ID
const getCategoryById = async (categoryId) => {
    const query = `
        SELECT 
            category_id,
            name,
            description,
            created_at
        FROM category
        WHERE category_id = $1
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows[0];
};

// Get projects by category ID
const getProjectsByCategoryId = async (categoryId) => {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            p.organization_id,
            o.name as organization_name
        FROM project p
        JOIN project_category pc ON p.project_id = pc.project_id
        JOIN organization o ON p.organization_id = o.organization_id
        WHERE pc.category_id = $1
        ORDER BY p.project_date DESC
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows;
};

// Get categories by project ID
const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT 
            c.category_id,
            c.name,
            c.description
        FROM category c
        JOIN project_category pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
};

// Assign a single category to a project
const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO project_category (project_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT (project_id, category_id) DO NOTHING
    `;
    await db.query(query, [projectId, categoryId]);
};

// Update all category assignments for a project
const updateCategoryAssignments = async (projectId, categoryIds) => {
    // First, delete all existing assignments
    const deleteQuery = `
        DELETE FROM project_category
        WHERE project_id = $1
    `;
    await db.query(deleteQuery, [projectId]);

    // Then, insert new assignments
    if (categoryIds && categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
            await assignCategoryToProject(projectId, categoryId);
        }
    }
};

// Create a new category
const createCategory = async (name) => {
    const query = `
        INSERT INTO category (name)
        VALUES ($1)
        RETURNING category_id
    `;
    const result = await db.query(query, [name]);
    
    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }
    
    return result.rows[0].category_id;
};

// Update an existing category
const updateCategory = async (categoryId, name) => {
    const query = `
        UPDATE category 
        SET name = $1
        WHERE category_id = $2
        RETURNING *
    `;
    const result = await db.query(query, [name, categoryId]);
    
    if (result.rows.length === 0) {
        throw new Error('Failed to update category');
    }
    
    return result.rows[0];
};

export { 
    getAllCategories, 
    getCategoryById, 
    getProjectsByCategoryId,
    getCategoriesByProjectId,
    updateCategoryAssignments,
    createCategory,    
    updateCategory     
};