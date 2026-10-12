const categoryService = require('../services/categoryService');

async function getAll(req, res, next) {
  try {
    const { sortBy, sortOrder } = req.query;
    const categories = await categoryService.getAllCategories({ sortBy, sortOrder });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!req.body.category_name || req.body.category_name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }
    const created = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: created, message: 'Category created successfully' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!req.body.category_name || req.body.category_name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }
    const updated = await categoryService.updateCategory(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: updated, message: 'Category updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: `Category ${req.params.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
