import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ChuongTrinh.css';

const ChuongTrinh = () => {
  return (
    <div className="programs-container">
      {/* Hero Section */}
      <section className="programs-hero">
        <div className="programs-hero-content">
          <h1>Chương trình đào tạo</h1>
          <p className="hero-subtitle">Khám phá các chương trình học tập đa dạng và chất lượng cao tại trường chúng tôi</p>
        </div>
      </section>

      {/* Academic Programs */}
      <section className="academic-programs">
        <h2>Chương trình học chính khóa</h2>
        <p className="section-intro">Các chương trình học được thiết kế theo chuẩn của Bộ Giáo dục và Đào tạo, kết hợp với những phương pháp giảng dạy tiên tiến.</p>
        
        <div className="programs-grid">
          {/* Program 1 */}
          <div className="program-card">
            <div className="program-icon">🔬</div>
            <h3>Khoa học Tự nhiên</h3>
            <p>Chương trình chuyên sâu về Toán, Lý, Hóa, Sinh với phương pháp giảng dạy hiện đại, phát triển tư duy phân tích và nghiên cứu khoa học.</p>
            <Link to="/chuong-trinh/khoa-hoc-tu-nhien" className="program-link">
              Tìm hiểu thêm <span>→</span>
            </Link>
          </div>

          {/* Program 2 */}
          <div className="program-card">
            <div className="program-icon">📚</div>
            <h3>Khoa học Xã hội</h3>
            <p>Chương trình chú trọng phát triển năng lực ngôn ngữ, tư duy phản biện và hiểu biết sâu sắc về văn hóa, xã hội, lịch sử.</p>
            <Link to="/chuong-trinh/khoa-hoc-xa-hoi" className="program-link">
              Tìm hiểu thêm <span>→</span>
            </Link>
          </div>

          {/* Program 3 */}
          <div className="program-card">
            <div className="program-icon">🌍</div>
            <h3>Chương trình Quốc tế</h3>
            <p>Chương trình song ngữ, giảng dạy theo tiêu chuẩn quốc tế, giúp học sinh phát triển toàn diện và hội nhập toàn cầu.</p>
            <Link to="/chuong-trinh/quoc-te" className="program-link">
              Tìm hiểu thêm <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Extracurricular Activities */}
      <section className="extracurricular">
        <h2>Hoạt động ngoại khóa</h2>
        <p className="section-intro">Các câu lạc bộ và hoạt động ngoại khóa đa dạng, phát triển kỹ năng mềm và tài năng toàn diện.</p>
        
        <div className="activities-grid">
          <div className="activity-card">
            <h3>Thể thao</h3>
            <p>Bóng đá, bóng rổ, cầu lông, bơi lội, và nhiều môn thể thao khác.</p>
          </div>
          <div className="activity-card">
            <h3>Nghệ thuật</h3>
            <p>Âm nhạc, hội họa, kịch nghệ, khiêu vũ và nhiều bộ môn nghệ thuật khác.</p>
          </div>
          <div className="activity-card">
            <h3>Khoa học - Công nghệ</h3>
            <p>Lập trình, robot, nghiên cứu khoa học và các dự án sáng tạo.</p>
          </div>
          <div className="activity-card">
            <h3>Xã hội - Tình nguyện</h3>
            <p>Các hoạt động cộng đồng, tình nguyện và phát triển kỹ năng lãnh đạo.</p>
          </div>
        </div>
      </section>

      {/* Special Programs */}
      <section className="special-programs">
        <h2>Chương trình đặc biệt</h2>
        <div className="special-programs-grid">
          <div className="special-program">
            <h3>Chương trình tư vấn hướng nghiệp</h3>
            <p>Định hướng nghề nghiệp, tư vấn chọn ngành, chọn trường phù hợp với năng lực và sở thích của học sinh.</p>
          </div>
          <div className="special-program">
            <h3>Chương trình phát triển kỹ năng sống</h3>
            <p>Rèn luyện các kỹ năng mềm cần thiết như giao tiếp, làm việc nhóm, quản lý thời gian, giải quyết vấn đề.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="programs-cta">
        <h2>Bạn cần tư vấn thêm về chương trình học?</h2>
        <p>Đội ngũ tư vấn viên của chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        <Link to="/lien-he" className="btn btn-primary">Liên hệ ngay</Link>
      </section>
    </div>
  );
};

export default ChuongTrinh;
