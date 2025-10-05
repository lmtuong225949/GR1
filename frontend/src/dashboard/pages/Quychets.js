import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaDownload } from 'react-icons/fa';
import '../styles/Quychets.css';

const Quychets = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const academicYear = `${currentYear} - ${nextYear}`;

  const admissionMethods = [
    {
      title: "1. Thi tuyển",
      description: "Đánh giá năng lực qua các bài thi:",
      items: [
        "Môn bắt buộc: Toán, Ngữ văn, Ngoại ngữ",
        "Môn chuyên: Dành cho học sinh đăng ký vào lớp chuyên"
      ],
      note: "Lịch thi sẽ được công bố trên website chính thức của trường."
    },
    {
      title: "2. Xét tuyển học bạ",
      description: "Dành cho học sinh có kết quả học tập và rèn luyện tốt:",
      items: [
        "Điểm trung bình các môn học từ 8.0 trở lên",
        "Hạnh kiểm xếp loại Tốt trong các năm THCS",
        "Ưu tiên học sinh đạt giải tại các kỳ thi học sinh giỏi"
      ]
    },
    {
      title: "3. Tuyển thẳng",
      description: "Áp dụng cho trường hợp đặc biệt:",
      items: [
        "Học sinh đạt giải Nhất, Nhì, Ba cấp tỉnh/thành phố trở lên",
        "Học sinh dân tộc thiểu số có thành tích nổi bật",
        "Học sinh khuyết tật có nguyện vọng học hòa nhập"
      ]
    }
  ];

  const registrationSchedule = [
    { date: `01/04/${currentYear}`, event: "Nhận hồ sơ đăng ký" },
    { date: `15/05/${currentYear}`, event: "Kết thúc đăng ký NV1, NV2" },
    { date: `20/05 - 25/05/${currentYear}`, event: "Điều chỉnh nguyện vọng" },
    { date: `30/05/${currentYear}`, event: "Công bố kết quả đợt 1" }
  ];

  const requiredDocuments = [
    "Bản sao giấy khai sinh (công chứng)",
    "Học bạ THCS (bản chính)",
    "Bằng tốt nghiệp THCS (công chứng)",
    "Đơn đăng ký dự tuyển (theo mẫu)",
    "Giấy chứng nhận ưu tiên/khuyến khích (nếu có)",
    "04 ảnh thẻ 3x4 (ghi rõ họ tên, ngày sinh phía sau)"
  ];

  return (
    <div className="admissions-container">
      <section className="admissions-hero">
        <div className="hero-content">
          <h1>Thông tin tuyển sinh vào lớp 10</h1>
          <p className="hero-subtitle">
            Thông tin tuyển sinh vào lớp 10 năm học {academicYear}
          </p>
        </div>
      </section>

      <div className="admissions-content">
        {/* Eligibility Section */}
        <section className="section-card">
          <div className="section-header">
            <h2>Đối tượng tuyển sinh</h2>
          </div>
          <div className="section-body">
            <p>Nhà trường tiếp nhận hồ sơ của các thí sinh đáp ứng đủ các điều kiện sau:</p>
            <ul className="info-list">
              <li><strong>Hoàn thành chương trình THCS</strong>, có bằng tốt nghiệp hoặc giấy chứng nhận tốt nghiệp tạm thời.</li>
              <li><strong>Độ tuổi phù hợp</strong> theo quy định hiện hành của Bộ Giáo dục và Đào tạo.</li>
              <li><strong>Thuộc khu vực tuyển sinh</strong> theo quy định (nếu có).</li>
            </ul>
            <div className="note-box">
              <p>💡 <em>Học sinh có thể nộp hồ sơ ngay khi có giấy chứng nhận tốt nghiệp tạm thời, không cần chờ bằng chính thức.</em></p>
            </div>
          </div>
        </section>

        {/* Admission Methods */}
        <section className="section-card">
          <div className="section-header">
            <h2>Phương thức tuyển sinh</h2>
          </div>
          <div className="section-body">
            <p>Năm học {academicYear}, nhà trường triển khai các phương thức xét tuyển sau:</p>
            
            {admissionMethods.map((method, index) => (
              <div key={index} className="method-card">
                <h3>{method.title}</h3>
                <p>{method.description}</p>
                <ul className="info-list">
                  {method.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                {method.note && <p className="method-note">{method.note}</p>}
              </div>
            ))}
            
            <div className="note-box info">
              <p><em>Thí sinh có thể đăng ký đồng thời nhiều phương thức để tăng cơ hội trúng tuyển.</em></p>
            </div>
          </div>
        </section>

        {/* Registration Timeline */}
        <section className="section-card">
          <div className="section-header">
            <h2>Lịch trình đăng ký</h2>
          </div>
          <div className="section-body">
            <div className="timeline">
              {registrationSchedule.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-date">{item.date}</div>
                  <div className="timeline-content">{item.event}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Required Documents */}
        <section className="section-card">
          <div className="section-header">
            <h2>Hồ sơ đăng ký</h2>
          </div>
          <div className="section-body">
            <p>Hồ sơ đăng ký dự tuyển bao gồm:</p>
            <ul className="document-list">
              {requiredDocuments.map((doc, index) => (
                <li key={index}>
                  <span className="doc-icon">•</span> {doc}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Cần thêm thông tin tuyển sinh?</h2>
          <p>Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ.</p>
          <div className="cta-buttons">
            <Link to="/dashboard" className="btn btn-primary">
              <FaFileAlt className="btn-icon" /> Đăng ký tư vấn
            </Link>
            <Link to="/tai-lieu" className="btn btn-secondary">
              <FaDownload className="btn-icon" /> Tải tài liệu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Quychets;
