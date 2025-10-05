import React, { useState } from 'react';
import '../styles/TuyenSinh.css';
import { FaUser,
         FaSchool, 
         FaIdCard, 
         FaCheck, 
         FaArrowLeft, 
         FaArrowRight, 
         FaPaperPlane, 
         FaFileUpload,
         FaInfoCircle } from 'react-icons/fa';

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;
const academicYear = `${currentYear} - ${nextYear}`;
const TuyenSinh = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Thông tin cá nhân
    hoTen: '',
    gioiTinh: '',
    ngaySinh: '',
    noiSinh: '',
    danToc: '',
    hoKhau: '',
    diaChi: '',
    dienThoai: '',
    email: '',
    
    // Thông tin phụ huynh
    tenCha: '',
    ngheNghiepCha: '',
    sdtCha: '',
    tenMe: '',
    ngheNghiepMe: '',
    sdtMe: '',
    
    // Thông tin học tập
    truongTHCS: '',
    namTotNghiep: '2025',
    hanhKiem: '',
    hocLuc: '',
    
    // Nguyện vọng
    nguyenVong1: '',
    nguyenVong2: '',
    nguyenVong3: '',
    
    // Tài liệu đính kèm
    hoSoDinhKem: [],
    
    // Xác nhận
    xacNhan: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      hoSoDinhKem: [...e.target.files]
    }));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h2><FaUser className="icon" /> Thông tin cá nhân</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Họ và tên <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="hoTen" 
                  value={formData.hoTen} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Giới tính <span className="required">*</span></label>
                <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} required>
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Ngày sinh <span className="required">*</span></label>
                <input 
                  type="date" 
                  name="ngaySinh" 
                  value={formData.ngaySinh} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Nơi sinh <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="noiSinh" 
                  value={formData.noiSinh} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Dân tộc <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="danToc" 
                  value={formData.danToc} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Hộ khẩu thường trú <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="hoKhau" 
                  value={formData.hoKhau} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Địa chỉ liên hệ <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="diaChi" 
                  value={formData.diaChi} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Số điện thoại <span className="required">*</span></label>
                <input 
                  type="tel" 
                  name="dienThoai" 
                  value={formData.dienThoai} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="btn-next" onClick={nextStep}>
                Tiếp theo <FaArrowRight />
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="form-step">
            <h2><FaUser className="icon" /> Thông tin phụ huynh</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Họ và tên cha</label>
                <input 
                  type="text" 
                  name="tenCha" 
                  value={formData.tenCha} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label>Nghề nghiệp</label>
                <input 
                  type="text" 
                  name="ngheNghiepCha" 
                  value={formData.ngheNghiepCha} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label>Số điện thoại</label>
                <input 
                  type="tel" 
                  name="sdtCha" 
                  value={formData.sdtCha} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label>Họ và tên mẹ</label>
                <input 
                  type="text" 
                  name="tenMe" 
                  value={formData.tenMe} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label>Nghề nghiệp</label>
                <input 
                  type="text" 
                  name="ngheNghiepMe" 
                  value={formData.ngheNghiepMe} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label>Số điện thoại</label>
                <input 
                  type="tel" 
                  name="sdtMe" 
                  value={formData.sdtMe} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="btn-prev" onClick={prevStep}>
                <FaArrowLeft /> Quay lại
              </button>
              <button type="button" className="btn-next" onClick={nextStep}>
                Tiếp theo <FaArrowRight />
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="form-step">
            <h2><FaSchool className="icon" /> Thông tin học tập</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Trường THCS <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="truongTHCS" 
                  value={formData.truongTHCS} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Năm tốt nghiệp <span className="required">*</span></label>
                <select name="namTotNghiep" value={formData.namTotNghiep} onChange={handleChange} required>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Hạnh kiểm năm lớp 9 <span className="required">*</span></label>
                <select name="hanhKiem" value={formData.hanhKiem} onChange={handleChange} required>
                  <option value="">Chọn hạnh kiểm</option>
                  <option value="Tốt">Tốt</option>
                  <option value="Khá">Khá</option>
                  <option value="Trung bình">Trung bình</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Học lực năm lớp 9 <span className="required">*</span></label>
                <select name="hocLuc" value={formData.hocLuc} onChange={handleChange} required>
                  <option value="">Chọn học lực</option>
                  <option value="Giỏi">Giỏi</option>
                  <option value="Khá">Khá</option>
                  <option value="Trung bình">Trung bình</option>
                </select>
              </div>
              
              <div className="form-group full-width">
                <label>Điểm trung bình các môn năm lớp 9</label>
                <div className="scores-grid">
                  <div className="score-item">
                    <label>Toán</label>
                    <input type="number" step="0.1" min="0" max="10" />
                  </div>
                  <div className="score-item">
                    <label>Ngữ văn</label>
                    <input type="number" step="0.1" min="0" max="10" />
                  </div>
                  <div className="score-item">
                    <label>Ngoại ngữ</label>
                    <input type="number" step="0.1" min="0" max="10" />
                  </div>
                  <div className="score-item">
                    <label>Vật lý</label>
                    <input type="number" step="0.1" min="0" max="10" />
                  </div>
                  <div className="score-item">
                    <label>Hóa học</label>
                    <input type="number" step="0.1" min="0" max="10" />
                  </div>
                  <div className="score-item">
                    <label>Sinh học</label>
                    <input type="number" step="0.1" min="0" max="10" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="btn-prev" onClick={prevStep}>
                <FaArrowLeft /> Quay lại
              </button>
              <button type="button" className="btn-next" onClick={nextStep}>
                Tiếp theo <FaArrowRight />
              </button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="form-step">
            <h2><FaIdCard className="icon" /> Nguyện vọng đăng ký</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nguyện vọng 1 <span className="required">*</span></label>
                <select name="nguyenVong1" value={formData.nguyenVong1} onChange={handleChange} required>
                  <option value="">Chọn nguyện vọng</option>
                  <option value="Lớp chuyên Toán">Lớp chuyên Toán</option>
                  <option value="Lớp chuyên Văn">Lớp chuyên Văn</option>
                  <option value="Lớp chuyên Anh">Lớp chuyên Anh</option>
                  <option value="Lớp chuyên Lý">Lớp chuyên Lý</option>
                  <option value="Lớp chuyên Hóa">Lớp chuyên Hóa</option>
                  <option value="Lớp chất lượng cao">Lớp chất lượng cao</option>
                  <option value="Lớp đại trà">Lớp đại trà</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Nguyện vọng 2</label>
                <select name="nguyenVong2" value={formData.nguyenVong2} onChange={handleChange}>
                  <option value="">Chọn nguyện vọng (nếu có)</option>
                  <option value="Lớp chuyên Toán">Lớp chuyên Toán</option>
                  <option value="Lớp chuyên Văn">Lớp chuyên Văn</option>
                  <option value="Lớp chuyên Anh">Lớp chuyên Anh</option>
                  <option value="Lớp chuyên Lý">Lớp chuyên Lý</option>
                  <option value="Lớp chuyên Hóa">Lớp chuyên Hóa</option>
                  <option value="Lớp chất lượng cao">Lớp chất lượng cao</option>
                  <option value="Lớp đại trà">Lớp đại trà</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Nguyện vọng 3</label>
                <select name="nguyenVong3" value={formData.nguyenVong3} onChange={handleChange}>
                  <option value="">Chọn nguyện vọng (nếu có)</option>
                  <option value="Lớp chuyên Toán">Lớp chuyên Toán</option>
                  <option value="Lớp chuyên Văn">Lớp chuyên Văn</option>
                  <option value="Lớp chuyên Anh">Lớp chuyên Anh</option>
                  <option value="Lớp chuyên Lý">Lớp chuyên Lý</option>
                  <option value="Lớp chuyên Hóa">Lớp chuyên Hóa</option>
                  <option value="Lớp chất lượng cao">Lớp chất lượng cao</option>
                  <option value="Lớp đại trà">Lớp đại trà</option>
                </select>
              </div>
              
              <div className="form-group full-width">
                <p className="note">
                  <FaInfoCircle /> Lưu ý: Mỗi thí sinh được đăng ký tối đa 3 nguyện vọng theo thứ tự ưu tiên.
                </p>
              </div>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="btn-prev" onClick={prevStep}>
                <FaArrowLeft /> Quay lại
              </button>
              <button type="button" className="btn-next" onClick={nextStep}>
                Tiếp theo <FaArrowRight />
              </button>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="form-step">
            <h2><FaFileUpload className="icon" /> Tài liệu đính kèm</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Hồ sơ đính kèm <span className="required">*</span></label>
                <div className="file-upload">
                  <input 
                    type="file" 
                    id="hoSoDinhKem" 
                    name="hoSoDinhKem" 
                    onChange={handleFileChange} 
                    multiple 
                    required 
                  />
                  <label htmlFor="hoSoDinhKem">
                    <FaFileUpload /> Chọn tệp tải lên
                  </label>
                  {formData.hoSoDinhKem.length > 0 && (
                    <div className="file-list">
                      <p>Đã chọn {formData.hoSoDinhKem.length} tệp:</p>
                      <ul>
                        {Array.from(formData.hoSoDinhKem).map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="file-note">
                  <FaInfoCircle /> Các tài liệu cần có: Học bạ THCS (bản scan), Giấy khai sinh, Bằng tốt nghiệp THCS hoặc Giấy chứng nhận tốt nghiệp tạm thời, Giấy chứng nhận ưu tiên (nếu có).
                </p>
              </div>
              
              <div className="form-group full-width">
                <div className="confirmation">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      name="xacNhan" 
                      checked={formData.xacNhan} 
                      onChange={handleChange} 
                      required 
                    />
                    <span className="checkmark"></span>
                    Tôi xác nhận rằng tất cả thông tin trên là chính xác và tôi sẽ chịu trách nhiệm nếu có bất kỳ thông tin sai lệch nào.
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="btn-prev" onClick={prevStep}>
                <FaArrowLeft /> Quay lại
              </button>
              <button type="button" className="btn-submit" onClick={nextStep} disabled={!formData.xacNhan}>
                <FaPaperPlane /> Gửi đơn đăng ký
              </button>
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="form-step success-message">
            <div className="success-icon">
              <FaCheck />
            </div>
            <h2>ĐĂNG KÝ THÀNH CÔNG!</h2>
            <p>Cảm ơn bạn đã đăng ký tuyển sinh vào lớp 10 năm học 2025-2026 tại Trường THPT [TÊN TRƯỜNG].</p>
            <p>Mã số hồ sơ của bạn là: <strong>TS2025-{Math.floor(10000 + Math.random() * 90000)}</strong></p>
            <p>Vui lòng ghi nhớ mã số này để tra cứu thông tin tuyển sinh.</p>
            <div className="next-steps">
              <h3>Bước tiếp theo:</h3>
              <ol>
                <li>Kiểm tra email để xác nhận đơn đăng ký</li>
                <li>Nộp lệ phí dự tuyển trong vòng 3 ngày làm việc</li>
                <li>Chuẩn bị hồ sơ bản cứng để đối chiếu khi cần thiết</li>
                <li>Theo dõi thông báo về lịch thi (nếu có) trên website của trường</li>
              </ol>
            </div>
            <button 
              type="button" 
              className="btn-print"
              onClick={() => window.print()}
            >
              In phiếu đăng ký
            </button>
          </div>
        );
        
      default:
        return <div>Bước không hợp lệ</div>;
    }
  };

  return (
    <div className="tuyensinh-container">
      <div className="tuyensinh-header">
        <h1> ĐĂNG KÝ TUYỂN SINH VÀO LỚP 10</h1>
        <p>Năm học {academicYear} - Trường THPT Trần Đại Nghĩa</p>
      </div>
      
      <div className="progress-bar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`progress-step ${i < step ? 'completed' : ''} ${i === step ? 'active' : ''}`}
          >
            <div className="step-number">{i < step ? <FaCheck /> : i}</div>
            <div className="step-label">
              {i === 1 && 'Thông tin cá nhân'}
              {i === 2 && 'Phụ huynh'}
              {i === 3 && 'Học tập'}
              {i === 4 && 'Nguyện vọng'}
              {i === 5 && 'Xác nhận'}
            </div>
          </div>
        ))}
      </div>
      
      <div className="form-container">
        {renderStep()}
      </div>
      
      <div className="tuyensinh-footer">
        <p><FaInfoCircle /> Mọi thắc mắc vui lòng liên hệ Phòng Tuyển sinh - Trường THPT chuyên TTHG</p>
        <p>Điện thoại: 0243.8222.222 - Email: tuyensinh@thptchuyen.tthg.edu.vn</p>
      </div>
    </div>
  );
};

export default TuyenSinh;