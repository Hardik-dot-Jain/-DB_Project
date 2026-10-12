const { executeQuery } = require('../config/db');

async function getAllCategories(options = {}) {
  const sortMap = {
    category_id: 'category_id',
    category_name: 'category_name',
    description: 'description'
  };
  const sortCol = sortMap[options.sortBy] || 'category_id';
  const sortDir = (options.sortOrder || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const sql = `
    SELECT category_id, category_name, description 
    FROM category 
    ORDER BY ${sortCol} ${sortDir}
  `;
  const result = await executeQuery(sql);
  return result.rows;
}

async function getCategoryById(id) {
  const sql = `
    SELECT category_id, category_name, description 
    FROM category 
    WHERE category_id = :id
  `;
  const result = await executeQuery(sql, { id: Number(id) });
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function createCategory(data) {
  let categoryId = Number(data.category_id);
  if (!categoryId || isNaN(categoryId)) {
    const maxRes = await executeQuery(`SELECT NVL(MAX(category_id), 100) + 1 AS NEXT_ID FROM category`);
    categoryId = maxRes.rows[0].NEXT_ID;
  }

  const sql = `
    INSERT INTO category (category_id, category_name, description)
    VALUES (:category_id, :category_name, :description)
  `;

  await executeQuery(sql, {
    category_id: categoryId,
    category_name: data.category_name,
    description: data.description || null
  }, { autoCommit: true });

  return getCategoryById(categoryId);
}

async function updateCategory(id, data) {
  const sql = `
    UPDATE category 
    SET category_name = :category_name,
        description = :description
    WHERE category_id = :id
  `;

  await executeQuery(sql, {
    id: Number(id),
    category_name: data.category_name,
    description: data.description || null
  }, { autoCommit: true });

  return getCategoryById(id);
}

async function deleteCategory(id) {
  const propCheck = await executeQuery(
    `SELECT COUNT(*) AS CNT FROM property WHERE category_id = :id`,
    { id: Number(id) }
  );
  if (propCheck.rows[0].CNT > 0) {
    const err = new Error(`Cannot delete Category ID ${id}: Currently used by ${propCheck.rows[0].CNT} property listing(s).`);
    err.statusCode = 409;
    throw err;
  }

  const sql = `DELETE FROM category WHERE category_id = :id`;
  const result = await executeQuery(sql, { id: Number(id) }, { autoCommit: true });
  return result.rowsAffected > 0;
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
