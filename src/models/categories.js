// src/models/categories.js
import pool from './db.js';

export const getAllCategories = async () => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name');
        return result.rows;
    } catch (error) {
        console.error('Error in getAllCategories:', error);
        throw error;
    }
};

export const getCategoryById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error in getCategoryById:', error);
        throw error;
    }
};

export const getProjectsByCategoryId = async (categoryId) => {
    try {
        const query = `
            SELECT p.*, o.name as organization_name 
            FROM projects p
            JOIN project_categories pc ON p.id = pc.project_id
            JOIN organizations o ON p.organization_id = o.id
            WHERE pc.category_id = $1
            ORDER BY p.date
        `;
        const result = await pool.query(query, [categoryId]);
        return result.rows;
    } catch (error) {
        console.error('Error in getProjectsByCategoryId:', error);
        throw error;
    }
};