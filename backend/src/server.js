const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  next();
});

// Routes
app.use('/api/users', require('./routes/UsersRoutes'));
app.use('/api/teachers', require('./routes/TeacherRoutes'));
app.use('/api/students', require('./routes/StudentRoutes'));
app.use('/api/classes', require('./routes/ClassRoutes.js'));
app.use('/api/schedules/generate', require('./routes/ScheduleRoutes'));
app.use('/api/auth', require('./routes/AuthRoutes'));
app.use('/api/scores', require('./routes/ScoreRoutes'));
app.use('/api/notifications', require('./routes/NotificationRoutes'));
app.use('/api/roles', require('./routes/RoleRoues'));
app.use('/api/myclass', require('./routes/MyclassRoutes'));
app.use('/api/assignments', require('./routes/AssignmentRoutes'));
app.use('/api/schedules', require('./routes/ScheduleRoutes'));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/learning", require("./uploads/UploadRoutes"));

app.get('/', (req, res) => {
  res.send('Hệ thống đang chạy');
});

// Hàm khởi động server
function startServer() {
  app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
  });
}

// Nếu chạy file này trực tiếp thì tự động gọi startServer()
if (require.main === module) {
  startServer();
}

module.exports = { startServer, app };