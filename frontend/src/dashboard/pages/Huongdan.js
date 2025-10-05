import React from 'react';
import { FaInfoCircle, FaCalendarAlt, FaFileAlt, FaUserGraduate, FaSchool, FaClipboardCheck, FaMoneyBillWave } from 'react-icons/fa';
import '../styles/Huongdan.css';
const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;
const academicYear = `${currentYear} - ${nextYear}`;
const Huongdan = () => {
  return (
    <div className="huongdan-container">
      <div className="huongdan-title">
        <h1>Hướng dẫn đăng ký tuyển sinh Lớp 10 </h1>
        <p> Năm học {academicYear}</p>
      </div>
      
      <div className="huongdan-section">
        <h2>THÔNG TIN CHUNG</h2>
        <p>Trường THPT Trần Đại Nghĩa thông báo kế hoạch tuyển sinh vào lớp 10 năm học {academicYear} với những thông tin cụ thể như sau:</p>
        <div className="class-info">
          <div className="class-card">
            <h4><FaUserGraduate className="icon" /> Chỉ tiêu tuyển sinh</h4>
            <p>Tổng chỉ tiêu: 275 học sinh, chia thành 10 lớp 10.</p>
            <div className="class-stats">
              <div className="stat">
                <span className="stat-value">10</span>
                <span className="stat-label">Lớp 10</span>
              </div>
              <div className="stat">
                <span className="stat-value">275</span>
                <span className="stat-label">Học sinh</span>
              </div>
              <div className="stat">
                <span className="stat-value">27</span>
                <span className="stat-label">HS/lớp</span>
              </div>
            </div>
          </div>
          
          <div className="class-card">
            <h4><FaSchool className="icon" /> Các hệ đào tạo</h4>
            <ul>
              <li>Lớp chuyên: 04 lớp (120 học sinh)</li>
              <li>Lớp đại trà: 06 lớp (155 học sinh)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="huongdan-section">
        <h2>ĐIỀU KIỆN DỰ TUYỂN</h2>
        <div className="requirements-list">
          <ul>
            <li>Đã tốt nghiệp THCS hoặc tương đương</li>
            <li>Tuổi đời tính đến ngày 01/09/{academicYear} từ 15 đến 17 tuổi</li>
            <li>Xếp loại hạnh kiểm, học lực cả năm học lớp 9 từ Khá trở lên</li>
            <li>Điểm trung bình môn Toán, Ngữ văn, Ngoại ngữ năm học lớp 9 đạt từ 6.5 trở lên</li>
          </ul>
        </div>

        <div className="important-note">
          <h4><FaInfoCircle className="icon" /> Lưu ý quan trọng</h4>
          <p>Đối với lớp chuyên, thí sinh cần tham dự kỳ thi tuyển sinh riêng do Sở Giáo dục và Đào tạo tổ chức.</p>
        </div>
      </div>

      <div className="huongdan-section">
        <h2>HỒ SƠ ĐĂNG KÝ DỰ TUYỂN</h2>
        <div className="requirements-list">
          <ul>
            <li>Đơn đăng ký dự tuyển (theo mẫu của nhà trường)</li>
            <li>Bản sao giấy khai sinh hợp lệ</li>
            <li>Bản sao học bạ THCS (có công chứng)</li>
            <li>Bằng tốt nghiệp THCS (bản sao công chứng) hoặc giấy chứng nhận tốt nghiệp tạm thời</li>
            <li>Giấy chứng nhận ưu tiên, khuyến khích (nếu có)</li>
            <li>04 ảnh 3x4 (ghi rõ họ tên, ngày tháng năm sinh sau ảnh)</li>
          </ul>
        </div>
      </div>

      <div className="huongdan-section">
        <h2>QUY TRÌNH ĐĂNG KÝ TRỰC TUYẾN</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-content">
              <h3><FaInfoCircle className="icon" /> Bước 1: Truy cập cổng thông tin</h3>
              <p>Truy cập website chính thức của trường tại https://thpttrandainghi@edu.vn và chọn mục "Đăng ký tuyển sinh lớp 10".</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-content">
              <h3><FaUserGraduate className="icon" /> Bước 2: Điền thông tin đăng ký</h3>
              <p>Khai báo đầy đủ thông tin cá nhân, thông tin phụ huynh và nguyện vọng đăng ký.</p>
              <p className="important-note" style={{margin: '10px 0', padding: '10px'}}>
                <FaInfoCircle className="icon" /> Mỗi thí sinh được đăng ký tối đa 3 nguyện vọng theo thứ tự ưu tiên.
              </p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-content">
              <h3><FaFileAlt className="icon" /> Bước 3: Tải lên hồ sơ</h3>
              <p>Tải lên các tài liệu đã được scan (định dạng PDF hoặc JPG, dung lượng không quá 5MB/tệp):</p>
              <ul>
                <li>Học bạ THCS</li>
                <li>Giấy khai sinh</li>
                <li>Các giấy tờ ưu tiên (nếu có)</li>
              </ul>
            </div>
          </div>
          
          <div className="step">
            <div className="step-content">
              <h3><FaClipboardCheck className="icon" /> Bước 4: Xác nhận và nộp hồ sơ</h3>
              <p>Kiểm tra lại toàn bộ thông tin đã nhập, ký xác nhận và nộp hồ sơ trực tuyến.</p>
              <p>Sau khi nộp, hệ thống sẽ gửi mã số hồ sơ và hướng dẫn nộp lệ phí qua email đăng ký.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-content">
              <h3><FaMoneyBillWave className="icon" /> Bước 5: Nộp lệ phí</h3>
              <p>Thực hiện thanh toán lệ phí dự tuyển theo một trong các hình thức:</p>
              <ul>
                <li>Chuyển khoản ngân hàng</li>
                <li>Thanh toán trực tuyến qua cổng thanh toán</li>
                <li>Nộp tiền mặt tại văn phòng nhà trường</li>
              </ul>
              <p>Lệ phí dự tuyển: 100.000 VNĐ/hồ sơ (miễn phí đối với học sinh thuộc diện chính sách).</p>
            </div>
          </div>
        </div>
      </div>

      <div className="huongdan-section">
        <h2>LỊCH TRÌNH TUYỂN SINH</h2>
        <div className="important-note">
          <h4><FaCalendarAlt className="icon" /> Thời gian thực hiện</h4>
          <ul>
            <li><strong>01/04 - 30/04/2025:</strong> Nhận hồ sơ đăng ký dự tuyển</li>
            <li><strong>10/05/2025:</strong> Công bố danh sách thí sinh đủ điều kiện dự thi</li>
            <li><strong>01/06/2025:</strong> Tổ chức thi tuyển (nếu có)</li>
            <li><strong>15/06/2025:</strong> Công bố kết quả trúng tuyển</li>
            <li><strong>20/06 - 30/06/2025:</strong> Xác nhận nhập học và hoàn thiện thủ tục</li>
          </ul>
        </div>
      </div>

      <div className="huongdan-section">
        <h2>ĐIỂM TRÚNG TUYỂN</h2>
        <p>Điểm trúng tuyển được tính theo công thức:</p>
        <p style={{ 
          backgroundColor: '#f0f7ff', 
          padding: '15px', 
          borderRadius: '6px', 
          fontFamily: 'monospace',
          borderLeft: '4px solid #3498db'
        }}>
          Điểm xét tuyển = (Điểm TB môn Toán + Điểm TB môn Văn + Điểm TB môn Ngoại ngữ) x 2 + Điểm ưu tiên (nếu có)
        </p>
        <p>Trong đó:</p>
        <ul>
          <li>Điểm trung bình môn tính theo kết quả học tập năm học lớp 9</li>
          <li>Điểm ưu tiên theo quy định của Bộ Giáo dục và Đào tạo</li>
        </ul>
      </div>

      <div className="huongdan-section">
        <h2>LIÊN HỆ</h2>
        <p>Mọi thắc mắc xin vui lòng liên hệ:</p>
        <ul>
          <li>Phòng Đào tạo - Trường THPT Trần Đại Nghĩa</li>
          <li>Địa chỉ: 123 Đường Trần Đại Nghĩa, Quận Hoàn Kiếm, Hà Nội</li>
          <li>Điện thoại: 024 3822 2222</li>
          <li>Email: thpttrandai nghi a@gmail.com</li>
          <li>Thời gian làm việc: Thứ 2 đến thứ 7, sáng từ 7h30 - 11h30, chiều từ 13h30 - 17h00</li>
        </ul>
      </div>
    </div>
  );
};

export default Huongdan;
