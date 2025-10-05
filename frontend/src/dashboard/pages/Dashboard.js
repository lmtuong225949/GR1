import React, { useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaWeibo,
  FaBook,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaAward,
  FaRunning,
  FaUserGraduate,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaAngleRight
} from 'react-icons/fa';

import '../styles/Dashboard.css';

import { SlArrowRight } from "react-icons/sl";

const Dashboard = () => {
  const location = useLocation();
  
  const scrollToSection = useCallback((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  const scrollToFeatures = useCallback(() => scrollToSection('features'), [scrollToSection]);
  const scrollToContact = useCallback(() => scrollToSection('contact'), [scrollToSection]);
  
  // Handle scroll to contact when navigating from other pages
  useEffect(() => {
    if (location.state?.scrollToContact) {
      const timer = setTimeout(() => {
        scrollToContact();
        window.history.replaceState({}, document.title);
      }, 100); // Small delay to ensure the component is fully mounted
      
      return () => clearTimeout(timer);
    }
  }, [location.state, scrollToContact]);
  return (
    <div className="outdashboard">
      <section className="hero">
        <div className="hero-header">
          <h1 className="hero-title">TRƯỜNG TRUNG HỌC PHỔ THÔNG TRẦN ĐẠI NGHĨA</h1>
          <p className="hero-desc">
          Chúng tôi cam kết cung cấp nền giáo dục toàn diện và hiện đại. Đồng hành cùng học sinh phát triển toàn diện về kiến thức, kỹ năng và nhân cách.
          </p>
          <div className="actions">
              <button className="btn btn-primary" onClick={scrollToFeatures}>Khám phá</button>
              <button className="btn btn-secondary" onClick={scrollToContact}>Liên hệ</button>
          </div>
        </div>
        <div className="media-placeholder" aria-label="Hình ảnh trường học">
          <img
            src="/khuon vien.jpg"
            alt="Khuôn viên trường"
          />
        </div>
      </section>

      <section id="features" className="features">
        <div className="features-header">
          <h2 className="features-title">Trải nghiệm học tập thông minh và thuận tiện</h2>
          <p className="features-desc">
            Chúng tôi tích hợp công nghệ để mang đến trải nghiệm học tập linh hoạt và hiệu quả cho học sinh.
          </p>
        <ul>
          <li><FaWeibo style={{ marginRight: 8 }} /> Hệ thống quản lý trực tuyến</li>
          <li><FaBook style={{ marginRight: 8 }} /> Tra cứu điểm số và học bạ dễ dàng</li>
          <li><FaChalkboardTeacher style={{ marginRight: 8 }} /> Hỗ trợ học tập trực tuyến</li>
        </ul>
        <div className="actions">
          <Link to="/dashboard/rules-test" className="btn btn-primary">Đăng ký</Link>
          <Link to="/dashboard/program" className="btn btn-secondary">Xem chi tiết <SlArrowRight /></Link>
        </div>
        </div>
        <div className="media-placeholder" aria-label="Hình ảnh trường học">
          <img
            src="/ai.png"
            alt="AI"
          />
        </div>
      </section>

      <section className="announcements">
        <div className="announcements-header">
          <h2 className="announcements-title">Môi trường học tập hiện đại và chuyên nghiệp</h2>
          <p className="announcements-desc">Chúng tôi cam kết cung cấp môi trường học tập hiện đại và chuyên nghiệp.</p>
          <Link to="/dashboard/program" className="btn btn-secondary">Tìm hiểu thêm <SlArrowRight /></Link>
        </div>
        <div className="media-placeholder" aria-label="Hình ảnh trường học">
          <img
            src="/hiendai.jpg"
            alt="Hiện đại"
          />
        </div>
      </section>

      <section className="updates">
        <div className="updates-header">
          <h2 className="updates-title">Cập nhật mới nhất dành cho học sinh và phụ huynh</h2>
          <p className="updates-desc">Thông tin quan trọng và kịp thời về các hoạt động của trường.</p>
        </div>
        <div className="updates-grid">
          <div className="updates-col">
            <div className="update-card">
              <h3><FaCalendarAlt /> Lịch học kỳ</h3>
              <p>Thông tin về lịch thi và lịch học chính thức.</p>
            </div>
            <div className="update-card">
              <h3><FaAward /> Học bổng</h3>
              <p>Các cơ hội học bổng cho học sinh xuất sắc.</p>
            </div>
          </div>

          <div className="updates-media" aria-label="Hình ảnh cập nhật">
            <img src="/tthg school.png" alt="Cập nhật nổi bật" />
          </div>

          <div className="updates-col">
            <div className="update-card">
              <h3><FaRunning /> Hoạt động ngoại khóa</h3>
              <p>Thông báo về các câu lạc bộ và hoạt động ngoại khóa.</p>
            </div>
            <div className="update-card">
              <h3><FaUserGraduate /> Tuyển sinh</h3>
              <p>Thông tin chi tiết về quy trình tuyển sinh.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="programs">
        <div className="programs-header">
          <h2 className="programs-title">Các chương trình học</h2>
          <p className="programs-desc">
            Đa dạng và chất lượng, phù hợp với nhu cầu học tập
          </p>
        </div>
      <div className="program-grid">
        <div className="program-card highlight">
          <span className="badge">Mới</span>
          <h3>Chương trình nâng cao toán và khoa học</h3>
          <p>Chương trình chuyên sâu dành cho học sinh đam mê Toán và Khoa học.</p>
          <Link to="/programs/math-science" className="program-link">
            Chi tiết <FaAngleRight />
          </Link>
        </div>

        <div className="program-card special">
          <span className="badge badge-special">Đặc biệt</span>
          <h3>Chương trình hướng nghiệp</h3>
          <p>Hỗ trợ học sinh khám phá định hướng nghề nghiệp tương lai.</p>
          <Link to ="/">Chi tiết <FaAngleRight /></Link>
        </div>

        <div className="program-card">
          <h3>Chương trình tiếng Anh tăng cường</h3>
          <p>Phát triển năng lực giao tiếp và chứng chỉ quốc tế.</p>
          <Link to="/programs/math-science" className="program-link">
            Chi tiết <FaAngleRight />
          </Link>
        </div>

        <div className="program-card">
          <h3>Chương trình giáo dục kỹ năng sống</h3>
          <p>Phát triển toàn diện về nhân cách và kỹ năng mềm.</p>
          <Link to="/programs/math-science" className="program-link">
            Chi tiết <FaAngleRight />
          </Link>
        </div>
      </div>
    </section>

    <section className="activitie">
      <div className="activitie-header">
        <h2 className="activitie-title">Hoạt động và thành tích</h2>
        <p className="activitie-desc">
          Cập nhật những sự kiện nổi bật và thành tích của trường
        </p>
      </div>
      
      <div className="activitie-container">
        <div className="activitie-content">
          <div className="activitie-grid">
            <div className="activitie-card">
              <h4>Học sinh đạt giải quốc gia môn Toán</h4>
              <p>Thành tích xuất sắc của học sinh trong kỳ thi Toán học.</p>
              <Link to="/activities/math-competition" className="read-more">
                Đọc thêm <FaAngleRight />
              </Link>
            </div>
            <div className="activitie-card">
              <h4>Chuyến dã ngoại khoa học</h4>
              <p>Trải nghiệm thực tế tại các địa điểm khoa học ngoài trường.</p>
              <Link to="/activities/math-competition" className="read-more">
                Đọc thêm <FaAngleRight />
              </Link>
            </div>
            <div className="activitie-card">
              <h4>Hội thi văn nghệ cuối năm</h4>
              <p>Ngày hội văn hóa và tài năng của học sinh.</p>
              <Link to="/activities/math-competition" className="read-more">
                Đọc thêm <FaAngleRight />
              </Link>
            </div>
            <div className="activitie-card">
              <h4>Chương trình mentor cho học sinh</h4>
              <p>Hỗ trợ định hướng và phát triển cá nhân.</p>
              <Link to="/activities/math-competition" className="read-more">
                Đọc thêm <FaAngleRight />
              </Link>
            </div>
          </div>
        </div>
        <div className="activitie-media">
          <img src="/thuong.jpg" alt="Hoạt động" />
        </div>
      </div>
    </section>

    <section className="events">
      <div className="events-header">
        <h2 className="events-title">Sự kiện</h2>
        <p className="events-desc">
          Cập nhật những sự kiện nổi bật và thành tích của trường
        </p>
      </div>
      <div className="event-grid">
          <div className="event-card">
            <div className="event-card-image">
              <img src="/ai.png" alt="Hội thảo khoa học" />
            </div>
            <div className="event-card-content">
              <h4>Hội thảo khoa học</h4>
              <p>Diễn đàn trao đổi và trình bày các đề tài nghiên cứu.</p>
              <Link to="/events/science-seminar" className="event-link">
                Xem chi tiết <FaAngleRight />
              </Link>
            </div>
          </div>
          <div className="event-card">
            <div className="event-card-image">
              <img src="/thuong.jpg" alt="Liên hoan văn nghệ" />
            </div>
            <div className="event-card-content">
              <h4>Liên hoan văn nghệ</h4>
              <p>Biểu diễn ca múa nhạc, kịch và các tiết mục do học sinh sáng tạo.</p>
              <Link to="/events/art-festival" className="event-link">
                Xem chi tiết <FaAngleRight />
              </Link>
            </div>
          </div>
        </div>
        <div className="view-more-container">
          <Link to="/events" className="view-more-btn">
            Xem thêm <SlArrowRight />
          </Link>
        </div>
    </section>

    <section className="teachers">
      <div className="teachers-header">
        <h2 className="teachers-title">Đội ngũ giáo viên</h2>
        <p className="teachers-desc">
          Những nhà giáo ưu tú, tận tâm và giàu kinh nghiệm
        </p>
      </div>

      <div className="teacher-grid">
        <div className="teacher-card">
          <h4>Nguyễn Văn An</h4>
          <p>Hiệu trưởng</p>
          <div className="social">
            <FaFacebook /> <FaTwitter /> <FaLinkedin />
          </div>
        </div>
        <div className="teacher-card">
          <h4>Trần Thị Bích</h4>
          <p>Phó hiệu trưởng</p>
          <div className="social">
            <FaFacebook /> <FaTwitter /> <FaLinkedin />
          </div>
        </div>
        <div className="teacher-card">
          <h4>Lê Văn Cường</h4>
          <p>Trưởng bộ môn Toán</p>
          <div className="social">
            <FaFacebook /> <FaTwitter /> <FaLinkedin />
          </div>
        </div>
      </div>
    </section>

    <section id="contact" className="contact">
      <div className="contact-container">
        <form className="form contact-form">
          <h2 className="section-title">Liên hệ</h2>
          <input className="form-input" placeholder="Họ và tên" />
          <input className="form-input" placeholder="Email" />
          <textarea className="form-textarea" rows={4} placeholder="Nội dung" />
          <button className="btn btn-primary" type="button">Gửi liên hệ</button>
        </form>
        <div className="contact-info">
          <h2 className="contact-title">Thông tin liên hệ</h2>
          <p><strong>Trường THPT Trần Đại Nghĩa</strong></p>
          <p><i className="fas fa-envelope"></i> Email: <a href="mailto:Tdn@school.edu.vn">Tdn@school.edu.vn</a></p>
          <p><i className="fas fa-phone"></i> Điện thoại: <a href="tel:+0345678921">0345678921</a></p>
          <p><i className="fas fa-fax"></i> Fax: (024) 3858 0013</p>
          <p><i className="fas fa-map-marker-alt"></i> Địa chỉ: 1 Đường Trần Đại Nghĩa, Quận Hai Bà Trưng, Thành phố Hà Nội</p>
          <div className="contact-hours">
            <p><strong>Giờ làm việc:</strong></p>
            <p>Thứ 2 - Thứ 6: 7:00 - 17:30</p>
            <p>Thứ 7: 7:00 - 11:30</p>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};
export default Dashboard;