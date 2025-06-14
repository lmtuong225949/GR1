# GR1 - Hệ thống quản lý học sinh

## Mô tả
Hệ thống quản lý học sinh là một ứng dụng web giúp quản lý thông tin học sinh, giáo viên và quản trị viên. Hệ thống được phát triển với React.js cho frontend và Node.js với Express.js cho backend.

## Cấu trúc dự án

LM_tuong_GR1/
├── frontend/          # Frontend React application
│   ├── public/       # Static files (index.html, favicon, etc.)
│   ├── src/          # Source code
│   │   ├── admin/    # Admin pages
│   │   │   ├── components/  # Admin-specific components
│   │   │   ├── pages/      # Admin pages
│   │   │   └── styles/       # Admin styles
│   │   ├── teacher/    # Teacher pages
│   │   │   ├── components/  # Teacher-specific components
│   │   │   ├── pages/      # Teacher pages
│   │   │   └── styles/       # Teacher styles
│   │   └── student/    # Student pages
│   │   │   ├── components/  # Student-specific components
│   │   │   ├── pages/      # Student pages
│   │   │   └── styles/       # Student styles
│   │   └── App.js          # Main application component
│   └── package.json
├── backend/          # Backend Node.js application
│   ├── src/         # Source code
│   │   ├── controllers/ # API controllers
│   │   │   ├── UserController.js # User management
│   │   │   ├── ClassController.js # Class management
│   │   │   └── SubjectController.js # Subject management
│   │   ├── routes/    # API routes
│   │   │   ├── users.js      # User routes
│   │   │   ├── classes.js    # Class routes
│   │   │   └── subjects.js   # Subject routes
│   │   ├── config/    # Configuration files
│   │   │   ├── db.js    # Database configuration
│   │   │   └── auth.js  # Authentication configuration
│   │   └── middleware/ # Middleware functions
│   │       ├── auth.js  # Authentication middleware
│   │       └── error.js # Error handling middleware
│   └── package.json
└── package.json


## Yêu cầu hệ thống
- Node.js >= 14.x
- npm >= 6.x
- PostgreSQL >= 12.x
- npm

## Cài đặt và chạy

### 1. Cài đặt các thư viện
bash
# Cài đặt thư viện cho backend
npm install

# Chuyển đến thư mục frontend và cài đặt thư viện
npm install


### 2. Cấu hình cơ sở dữ liệu
- Tạo cơ sở dữ liệu PostgreSQL
- Cập nhật thông tin kết nối cơ sở dữ liệu trong file `backend/config/db.js`

### 3. Chạy ứng dụng
# Chạy backend
npm run dev

# Trong một terminal mới, chạy frontend
npm start

## Tính năng chính
- Quản lý tài khoản người dùng (học sinh, giáo viên, quản trị viên)
- Thêm, sửa, xóa tài khoản
- Đổi mật khẩu
- Khóa/mở tài khoản
- Quản lý thông tin cá nhân

## Công nghệ sử dụng
- Frontend:
  - React.js
  - React Router
  - Axios
  - Material-UI

- Backend:
  - Node.js
  - Express.js
  - PostgreSQL
  - JWT
  - bcrypt

##  Thông tin tài khoản
tk: admin mk: 123456
tk: teacher mk: 123456
tk: hocsinh01 mk: 123456
tk: hocsinh02 mk: 123456
