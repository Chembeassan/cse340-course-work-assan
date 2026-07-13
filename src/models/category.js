// src/models/category.js
import db from './db.js';  // Import the default export

/**
 * Get all categories
 * @returns {Promise<Array>} Array of category objects
 */
const getAllCategories = async () => {
    const sql = `
        SELECT 
            category_id,
            name,
            description,
            created_at
        FROM category
        ORDER BY name ASC
    `;
    
    const result = await db.query(sql);  // Use db.query
    return result.rows;
};

/**
 * Get category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Category object
 */
const getCategoryById = async (id) => {
    const sql = `
        SELECT 
            category_id,
            name,
            description,
            created_at
        FROM category
        WHERE category_id = $1
    `;
    
    const result = await db.query(sql, [id]);
    return result.rows[0];
};

/**
 * Get all categories with project counts
 * @returns {Promise<Array>} Array of category objects with project counts
 */
const getAllCategoriesWithCounts = async () => {
    const sql = `
        SELECT 
            c.category_id,
            c.name,
            c.description,
            c.created_at,
            COUNT(pc.project_id) AS project_count
        FROM category c
        LEFT JOIN project_category pc ON c.category_id = pc.category_id
        GROUP BY c.category_id, c.name, c.description, c.created_at
        ORDER BY c.name ASC
    `;
    
    const result = await db.query(sql);
    return result.rows;
};

/**
 * Get categories for a specific project
 * @param {number} projectId - Project ID
 * @returns {Promise<Array>} Array of category objects
 */
const getCategoriesByProject = async (projectId) => {
    const sql = `
        SELECT 
            c.category_id,
            c.name,
            c.description
        FROM category c
        JOIN project_category pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name ASC
    `;
    
    const result = await db.query(sql, [projectId]);
    return result.rows;
};

/**
 * Get projects for a specific category
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>} Array of project objects
 */
const getProjectsByCategory = async (categoryId) => {
    const sql = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            o.name as organization_name
        FROM project p
        JOIN project_category pc ON p.project_id = pc.project_id
        JOIN organization o ON p.organization_id = o.organization_id
        WHERE pc.category_id = $1
        ORDER BY p.project_date DESC
    `;
    
    const result = await db.query(sql, [categoryId]);
    return result.rows;
};

export { 
    getAllCategories, 
    getCategoryById, 
    getCategoriesByProject,
    getProjectsByCategory,
    getAllCategoriesWithCounts  // Add this export
};