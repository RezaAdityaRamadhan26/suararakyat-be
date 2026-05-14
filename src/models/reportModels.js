import db from '../config/db.js';

export const getAllReports = async () => {
    const query = `
        SELECT 
            pr.id,
            pr.header,
            pr.body,
            pr.image,
            pr.status,
            pr.created_at,
            u.username AS pelapor,
            c.category_name AS kategori
        FROM 
            public_reports pr
        JOIN 
            users u ON pr.user_id = u.id
        JOIN 
            categories c ON pr.category_id = c.id
        ORDER BY 
            pr.created_at DESC
    `;
    const [rows] = await db.query(query);
    
    return rows;
};

export const getReportById = async (id) => {
    const query = `
        SELECT 
            pr.id,
            pr.header,
            pr.body,
            pr.image,
            pr.status,
            pr.created_at,
            u.username AS pelapor,
            c.category_name AS kategori,
            get_total_comments(pr.id) AS total_komentar
        FROM 
            public_reports pr
        JOIN 
            users u ON pr.user_id = u.id
        JOIN 
            categories c ON pr.category_id = c.id
        WHERE 
            pr.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    
    return rows[0];
};

export const createReport = async (header, body, user_id, category_id, image) => {
    const query = `
        INSERT INTO public_reports 
        (header, body, user_id, category_id, image, status) 
        VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    const [result] = await db.query(query, [header, body, user_id, category_id, image]);
    
    return result;
};

export const updateReportStatus = async (id, status) => {
    const query = 'UPDATE public_reports SET status = ? WHERE id = ?';
    const [result] = await db.query(query, [status, id]);
    
    return result;
};

export const deleteReport = async (id) => {
    const query = 'DELETE FROM public_reports WHERE id = ?';
    const [result] = await db.query(query, [id]);
    
    return result;
};

export const isReportOwner = async (reportId, userId) => {
    const query = 'SELECT id FROM public_reports WHERE id = ? AND user_id = ?';
    const [rows] = await db.query(query, [reportId, userId]);
    
    return rows.length > 0;
};
