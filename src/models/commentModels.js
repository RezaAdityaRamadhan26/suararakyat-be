import db from '../config/db.js';

export const getCommentsByReportId = async (reportId) => {
    const query = `
        SELECT 
            c.id,
            c.body,
            c.created_at,
            u.username AS pengomentar
        FROM 
            comments c
        JOIN 
            users u ON c.user_id = u.id
        WHERE 
            c.public_report_id = ?
        ORDER BY 
            c.created_at ASC
    `;
    const [rows] = await db.query(query, [reportId]);
    
    return rows;
};

export const getCommentById = async (id) => {
    const query = 'SELECT * FROM comments WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    
    return rows[0];
};

export const createComment = async (body, user_id, public_report_id) => {
    const query = `
        INSERT INTO comments 
        (body, user_id, public_report_id) 
        VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [body, user_id, public_report_id]);
    
    return result;
};

export const deleteComment = async (id) => {
    const query = 'DELETE FROM comments WHERE id = ?';
    const [result] = await db.query(query, [id]);
    
    return result;
};

export const isCommentOwner = async (commentId, userId) => {
    const query = 'SELECT id FROM comments WHERE id = ? AND user_id = ?';
    const [rows] = await db.query(query, [commentId, userId]);
    
    return rows.length > 0;
};
