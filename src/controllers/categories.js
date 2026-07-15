// Import any needed model functions
import { getAllCategoriesWithCounts } from '../models/category.js';

// Define any controller functions
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

// Export any controller functions
export { showCategoriesPage };