import db from '../config/db.js';

export const findUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await db.query(query, [username]);
    return rows[0];
};

export const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.query(query, [email]);
    return rows[0];
};

export const findUserById = async (id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
};

export const createUser = async (username, email, password, role = 'user') => {
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [username, email, password, role]);
    return result;
};

export const getAllUsers = async () => {
    const query = 'SELECT id, username, email, role FROM users';
    const [rows] = await db.query(query);
    return rows;
};

export const updateUser = async (id, username, email, password, role) => {
    let query = 'UPDATE users SET username = ?, email = ?, role = ?';
    let params = [username, email, role];

    if (password) {
        query += ', password = ?';
        params.push(password);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await db.query(query, params);
    return result;
};

export const deleteUser = async (id) => {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
};
