import { 
    getAllCategories, 
    getCategoryById, 
    getProjectsByCategoryId,
    getCategoriesByProjectId,
    updateCategoryAssignments
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js'; 

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
        
    
        res.render('category', { title, category, projects });
    } catch (error) {
        console.error('Error fetching category details:', error);
        const err = new Error('Failed to load category details');
        err.status = 500;
        next(err);
    }
};

// Show Assign Categories Form
const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        
        // Get project details
        const project = await getProjectDetails(projectId);
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        
        // Get all categories
        const allCategories = await getAllCategories();
        
        // Get categories already assigned to this project
        const assignedCategories = await getCategoriesByProjectId(projectId);
        const assignedCategoryIds = assignedCategories.map(c => c.category_id);
        
        const title = 'Assign Categories to Project';
        
        res.render('assign-categories', {
            title,
            project,
            allCategories,
            assignedCategoryIds
        });
    } catch (error) {
        console.error('Error loading assign categories form:', error);
        const err = new Error('Failed to load assign categories form');
        err.status = 500;
        next(err);
    }
};

//  Process Assign Categories Form
const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        
        // Get selected category IDs from form (could be undefined if none selected)
        let categoryIds = req.body.categoryIds;
        
        // If only one category is selected, it comes as a string, not an array
        if (categoryIds && !Array.isArray(categoryIds)) {
            categoryIds = [categoryIds];
        }
        
        // If no categories selected, pass empty array
        if (!categoryIds) {
            categoryIds = [];
        }
        
        // Update category assignments
        await updateCategoryAssignments(projectId, categoryIds);
        
        req.flash('success', 'Categories updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error updating category assignments:', error);
        req.flash('error', 'Failed to update categories. Please try again.');
        res.redirect(`/project/${projectId}/assign-categories`);
    }
};


export { 
    showCategoriesPage, 
    showCategoryDetailsPage,
    showAssignCategoriesForm,     
    processAssignCategoriesForm    
};
