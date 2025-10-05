import React from 'react';
import '../styles/Quyche.css';

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;
const academicYear = `${currentYear} - ${nextYear}`;
const Quyche = () => {
  return (
    <div className="quyche-container">
      <section className="quyche-hero">
        <div className="hero-content">
          <h1>Quy chế thi tốt nghiệp THPT</h1>
          <p className="hero-subtitle">
           Năm học {academicYear}
          </p>
        </div>
      </section>
      
      <div className="quyche-section">
        <h2>1. Đối tượng dự thi</h2>
        <ul>
          <li>Học sinh đang học lớp 12 năm học {academicYear}</li>
          <li>Thí sinh tự do đã tốt nghiệp THPT các năm trước</li>
          <li>Thí sinh đã hoàn thành chương trình THPT nhưng chưa tốt nghiệp</li>
        </ul>
      </div>

      <div className="quyche-section">
        <h2>2. Các môn thi</h2>
        <div className="exam-subjects">
          <div className="subject-group">
            <h3>Bài thi bắt buộc:</h3>
            <ul>
              <li>Toán (90 phút)</li>
              <li>Ngữ văn (120 phút)</li>
              <li>Ngoại ngữ (60 phút)</li>
            </ul>
          </div>
          <div className="subject-group">
            <h3>Bài thi tự chọn (chọn 1 trong 2 tổ hợp):</h3>
            <ul>
              <li>Tổ hợp Khoa học Tự nhiên (Vật lý, Hóa học, Sinh học)</li>
              <li>Tổ hợp Khoa học Xã hội (Lịch sử, Địa lý, Giáo dục công dân)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="quyche-section">
        <h2>3. Lịch thi dự kiến</h2>
        <div className="exam-schedule">
          <div className="schedule-item">
            <h3>Ngày 01/07/2025 (Thứ Ba)</h3>
            <p>Sáng: Ngữ văn (120 phút)</p>
            <p>Chiều: Toán (90 phút)</p>
          </div>
          <div className="schedule-item">
            <h3>Ngày 02/07/2025 (Thứ Tư)</h3>
            <p>Sáng: Khoa học Tự nhiên hoặc Khoa học Xã hội (150 phút)</p>
            <p>Chiều: Ngoại ngữ (60 phút)</p>
          </div>
        </div>
      </div>

      <div className="quyche-section">
        <h2>4. Điều kiện xét tốt nghiệp</h2>
        <ul>
          <li>Điểm xét tốt nghiệp (ĐXTN) từ 5.0 điểm trở lên</li>
          <li>Không có môn thi nào bị điểm liệt (≤ 1.0 điểm)</li>
          <li>Điểm trung bình cả năm lớp 12 đạt từ 5.0 trở lên</li>
          <li>Hạnh kiểm đạt từ loại Trung bình trở lên</li>
        </ul>
      </div>

      <div className="quyche-section">
        <h2>5. Cách tính điểm xét tốt nghiệp</h2>
        <p className="formula">
          ĐXTN = (Tổng điểm 4 bài thi + Tổng điểm khuyến khích (nếu có)) / 4 + Điểm trung bình cả năm lớp 12 / 2
        </p>
        <p>Trong đó:</p>
        <ul>
          <li>Điểm bài thi: Tính theo thang điểm 10</li>
          <li>Điểm ưu tiên: Cộng theo khu vực, đối tượng theo quy định</li>
          <li>Điểm khuyến khích: Tối đa 2 điểm</li>
        </ul>
      </div>

      <div className="quyche-section">
        <h2>6. Những lưu ý quan trọng</h2>
        <ul>
          <li>Thí sinh phải có mặt tại phòng thi trước giờ phát đề ít nhất 15 phút</li>
          <li>Mang theo đầy đủ giấy tờ tùy thân và giấy báo dự thi</li>
          <li>Chỉ được sử dụng bút mực hoặc bút bi mực xanh/đen</li>
          <li>Nghiêm cấm mang tài liệu, thiết bị điện tử vào phòng thi</li>
          <li>Tuân thủ nghiêm nội quy phòng thi</li>
        </ul>
      </div>

      <div className="quyche-note">
        <p><strong>Lưu ý:</strong> Thông tin trên được cập nhật theo quy chế thi tốt nghiệp THPT năm 2025 của Bộ Giáo dục và Đào tạo. Thí sinh cần theo dõi thông báo chính thức từ đơn vị đăng ký dự thi.</p>
      </div>
    </div>
  );
};

export default Quyche;
