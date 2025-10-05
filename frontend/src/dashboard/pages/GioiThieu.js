import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GioiThieu.css';
const GioiThieu = () => {
  const navigate = useNavigate();
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Trường THPT Trần Đại Nghĩa</h1>
          <p className="hero-subtitle">Trường trung học phổ thông Trần Đại Nghĩa là một trong những trường trung học hàng đầu tại Việt Nam.</p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="about-section">
        <div className="about-content">
          <h2>Giới thiệu về trường</h2>
          <p>Được thành lập từ năm 2022, Trường trung học phổ thông Trần Đại Nghĩa là một trong những trường trung học hàng đầu về đào tạo và giáo dục tại Việt Nam.</p>
          <p>Đội ngũ cán bộ giáo viên giàu kinh nghiệm, cơ sở vật chất hiện đại, chương trình đào tạo tiên tiến, chúng tôi tự hào là trường THPT chất lượng cao với nhiều học sinh đạt điểm số cao trong các kỳ thi. Không chỉ phát triển về kiến thức, chúng tôi còn phát triển toàn diện về kỹ năng mềm, phẩm chất, đạo đức....</p>
          <p>Trường trung học phổ thông Trần Đại Nghĩa cam kết cung cấp nền giáo dục toàn diện và hiện đại.</p>
        </div>
        <div className="about-image">
          <img src="/gtschool.jpg" alt="Trường Đại học Công nghệ Thông tin" />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="mission">
          <h3>Sứ mệnh</h3>
          <p>Đào tạo thế hệ học sinh phát triển toàn diện về đức - trí - thể - mỹ, trang bị kiến thức vững vàng, kỹ năng sống cần thiết và phẩm chất đạo đức tốt đẹp, sẵn sàng trở thành công dân toàn cầu trong tương lai.</p>
        </div>
        <div className="vision">
          <h3>Tầm nhìn</h3>
          <p>Đến năm 2030, trở thành ngôi trường THPT chuyên chất lượng cao hàng đầu khu vực, nơi đào tạo những thế hệ học sinh ưu tú, có năng lực học tập xuất sắc, phẩm chất đạo đức tốt và khả năng hội nhập quốc tế.</p>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values">
        <h2>Giá trị cốt lõi</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🎯</div>
            <h4>Chất lượng</h4>
            <p>Cam kết chất lượng đào tạo và nghiên cứu đạt chuẩn quốc tế</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💡</div>
            <h4>Sáng tạo</h4>
            <p>Khuyến khích tư duy đổi mới, sáng tạo trong giảng dạy và học tập</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h4>Hợp tác</h4>
            <p>Thúc đẩy liên kết, trao đổi, hợp tác giữa nhà trường với các doanh nghiệp và các trường đại học lớn</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🌐</div>
            <h4>Hội nhập</h4>
            <p>Hướng tới chuẩn mực giáo dục tiên tiến của khu vực và thế giới</p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <h2>Công nghệ giáo dục</h2>
        <p className="tech-intro">Chúng tôi tích hợp công nghệ để mang đến trải nghiệm học tập linh hoạt và hiệu quả cho học sinh.</p>
        
        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-icon">💻</div>
            <h3>Hệ thống quản lý trực tuyến</h3>
            <p>Quản lý thông tin học tập, lịch học và giao tiếp giữa nhà trường, giáo viên và phụ huynh một cách hiệu quả.</p>
          </div>
          
          <div className="tech-card">
            <div className="tech-icon">📊</div>
            <h3>Tra cứu điểm số và học bạ</h3>
            <p>Hệ thống theo dõi kết quả học tập trực tuyến, giúp phụ huynh và học sinh dễ dàng cập nhật tiến độ học tập.</p>
          </div>
          
          <div className="tech-card">
            <div className="tech-icon">🌐</div>
            <h3>Hỗ trợ học tập trực tuyến</h3>
            <p>Nền tảng học tập điện tử với kho tài liệu phong phú, bài giảng trực tuyến và bài tập tương tác.</p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta">
        <h2>Bạn muốn tìm hiểu thêm?</h2>
        <p>Hãy liên hệ với chúng tôi để được tư vấn chi tiết về các chương trình đào tạo</p>
        <button 
          onClick={() => {
            navigate('/', { state: { scrollToContact: true } });
          }} 
          className="btn btn-primary"
        >
          Liên hệ ngay
        </button>
      </section>
    </div>
  );
};

export default GioiThieu;
