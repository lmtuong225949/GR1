import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './News.css';

const newsList = [
  {
    id: 1,
    title: "Bộ GD&ĐT công bố phương án thi tốt nghiệp THPT 2025",
    date: "2025-05-12",
    summary: "Phương án thi năm 2025 sẽ giữ ổn định, tiếp tục đổi mới theo hướng đánh giá năng lực toàn diện học sinh.",
  },
  {
    id: 2,
    title: "Nhiều trường THPT triển khai học trực tuyến kết hợp trực tiếp",
    date: "2025-05-10",
    summary: "Mô hình kết hợp này giúp học sinh linh hoạt tiếp cận kiến thức và nâng cao hiệu quả học tập.",
  },
  {
    id: 3,
    title: "Hướng dẫn tuyển sinh lớp 10 năm học 2025-2026",
    date: "2025-05-08",
    summary: "Sở GD&ĐT các tỉnh bắt đầu ban hành kế hoạch tuyển sinh vào lớp 10 với nhiều điều chỉnh phù hợp.",
  },
  {
    id: 4,
    title: "THPT chuyên đẩy mạnh đào tạo học sinh giỏi quốc gia",
    date: "2025-05-06",
    summary: "Các trường chuyên đang đầu tư mạnh cho chương trình bồi dưỡng học sinh giỏi cấp quốc gia.",
  },
  {
    id: 5,
    title: "Học sinh THPT được khuyến khích nghiên cứu khoa học",
    date: "2025-05-05",
    summary: "Bộ GD&ĐT phát động cuộc thi nghiên cứu khoa học kỹ thuật trong học sinh THPT toàn quốc.",
  },
  {
    id: 6,
    title: "Thi thử tốt nghiệp THPT: Kết quả cho thấy cần tăng cường ôn tập",
    date: "2025-05-03",
    summary: "Kết quả thi thử ở nhiều trường cho thấy cần điều chỉnh phương pháp ôn tập phù hợp hơn.",
  },
  {
    id: 7,
    title: "Ứng dụng công nghệ thông tin trong quản lý trường THPT",
    date: "2025-05-01",
    summary: "Các trường đang từng bước số hóa quản lý hồ sơ, thời khóa biểu và kết quả học tập.",
  },
  {
    id: 8,
    title: "Thí điểm tích hợp giáo dục kỹ năng sống trong chương trình THPT",
    date: "2025-04-30",
    summary: "Một số trường đã triển khai mô hình lồng ghép kỹ năng mềm vào môn học chính khóa.",
  },
];

function News() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // lưu object user, không chỉ username

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi phân tích dữ liệu user:", e);
      }
    }
  }, []);

  const handleLoginLogout = () => {
    if (user) {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <div>
      {/* Header đơn giản */}
      <div className="simple-header">
        <div className="school-name">TRƯỜNG THPT CHUYÊN TTHG</div>
        <div className="user-actions">
          <span className="username">{user ? `Xin chào, ${user.username}` : "Khách"}</span>
          <button className="login-btn" onClick={handleLoginLogout}>
            {user ? "Đăng xuất" : "Đăng nhập"}
          </button>
        </div>
      </div>

      <div className="news-container">
        <h2>Tin Tức Giáo Dục THPT</h2>
        <div className="news-scroll">
          {newsList.map((item) => (
            <div key={item.id} className="news-item">
              <h3>{item.title}</h3>
              <p><strong>{item.date}</strong></p>
              <p>{item.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default News;