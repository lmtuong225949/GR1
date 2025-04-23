const db = require('../config/db');

const login = (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi máy chủ' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
        }

        const user = results[0];
        
        // Phân quyền theo role
        switch (user.role) {
            case 'ADMIN':
                return res.json({ message: 'Đăng nhập thành công với quyền ADMIN', user });
            case 'STAFF':
                return res.json({ message: 'Đăng nhập thành công với quyền STAFF', user });
            case 'USER':
                return res.json({ message: 'Đăng nhập thành công với quyền USER', user });
            default:
                return res.status(403).json({ message: 'Không có quyền truy cập' });
        }
    });
};

module.exports = {
    login
};
