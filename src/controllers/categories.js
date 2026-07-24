import { 
    getAllCategories, 
    getCategoryById, 
    getProjectsByCategoryId,
    getCategoriesByProjectId,
    updateCategoryAssignments,
    createCategory,     
    updateCategory     
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

/**
 * Display the categories list page
 */
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
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
        
        const projects = await getProjectsByCategoryId(categoryId);
        const title = category.name;
        
        res.render('category', { title, category, projects });
    } catch (error) {
        console.error('Error fetching category details:', error);
        const err = new Error('Failed to load category details');
        err.status = 500;
        next(err);
    }
};

/**
 * Display the assign categories form
 */
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

/**
 * Process the assign categories form
 */
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

// Category Validation Rules
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
];

//  Show New Category Form
const showNewCategoryForm = async (req, res) => {
    const title = 'Add New Category';
    const formData = req.flash('formData') ? req.flash('formData')[0] : {};
    res.render('new-category', { 
        title,
        formData: formData
    });
};

// Process New Category Form
const processNewCategoryForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Store form data in flash to repopulate the form
        req.flash('formData', req.body);
        
        // Redirect back to the new category form
        return res.redirect('/new-category');
    }

    try {
        const { name } = req.body;
        await createCategory(name);
        req.flash('success', 'Category added successfully!');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error creating category:', error);
        req.flash('error', 'Failed to create category. Please try again.');
        res.redirect('/new-category');
    }
};

// Show Edit Category Form
const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryById(categoryId);
        
        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        
        const title = `Edit ${category.name}`;
        const formData = req.flash('formData') ? req.flash('formData')[0] : {};
        
        res.render('edit-category', {
            title,
            category,
            formData: formData
        });
    } catch (error) {
        console.error('Error fetching category for edit:', error);
        const err = new Error('Failed to load edit category form');
        err.status = 500;
        next(err);
    }
};

// Process Edit Category Form
const processEditCategoryForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Store form data in flash to repopulate the form
        req.flash('formData', req.body);
        
        // Redirect back to the edit category form
        return res.redirect(`/edit-category/${req.params.id}`);
    }

    try {
        const categoryId = req.params.id;
        const { name } = req.body;
        
        await updateCategory(categoryId, name);
        
        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        console.error('Error updating category:', error);
        req.flash('error', 'Failed to update category. Please try again.');
        res.redirect(`/edit-category/${req.params.id}`);
    }
};

// Update exports
export { 
    showCategoriesPage, 
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,       
    processNewCategoryForm,    
    showEditCategoryForm,       
    processEditCategoryForm,   
    categoryValidation          
};