import { getAllCategoriesWithCounts, getCategoryById, getProjectsByCategory } from '../models/category.js';

/**
 * Display the categories list page
 */
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategoriesWithCounts();
        console.log('Categories loaded:', categories.length);
        const title = 'Service Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        const err = new Error('Failed to load categories');
        err.status = 500;
        next(err);
    }
};

/**
 * Display the category details page
 */
const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryById(categoryId);
        
        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        
        const projects = await getProjectsByCategory(categoryId);
        const title = category.name;
        
        // THIS LINE WAS MISSING - ADD IT!
        res.render('category', { title, category, projects });
    } catch (error) {
        console.error('Error fetching category details:', error);
        const err = new Error('Failed to load category details');
        err.status = 500;
        next(err);
    }
};

export { showCategoriesPage, showCategoryDetailsPage };