import db from '../config/db.js';

export const getAllCategories = async () => {
    const query = 'SELECT * FROM categories';
    const [rows] = await db.query(query);
    
    return rows;
};

export const getCategoryById = async (id) => {
    const query = 'SELECT * FROM categories WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    
    return rows[0];
};

export const createCategory = async (category_name) => {
    const query = 'INSERT INTO categories (category_name) VALUES (?)';
    const [result] = await db.query(query, [category_name]);
    
    return result;
};

export const updateCategory = async (id, category_name) => {
    const query = 'UPDATE categories SET category_name = ? WHERE id = ?';
    const [result] = await db.query(query, [category_name, id]);
    
    return result;
};

export const deleteCategory = async (id) => {
    const query = 'DELETE FROM categories WHERE id = ?';
    const [result] = await db.query(query, [id]);
    
    return result;
};
