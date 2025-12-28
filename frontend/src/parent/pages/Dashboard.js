import React, { useState, useEffect } from "react";
import { User, Info, Clock, MapPin, Phone, Mail } from "lucide-react";
import "../styles/Dashboard.css"; 

const ParentDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState({
    name: "",
    class: "",
    studentId: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    parentName: "",
    parentPhone: "",
    email: "",
    avatar: null,
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.id) throw new Error("Vui lòng đăng nhập để xem thông tin học sinh.");

        const studentId = user.mahs?.trim();
        if (!studentId) throw new Error("Không tìm thấy mã học sinh. Vui lòng đăng nhập lại.");

        const response = await fetch(`http://localhost:5000/api/parents/student/${studentId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("Không tìm thấy thông tin học sinh.");
          throw new Error(`Lỗi máy chủ (${response.status}).`);
        }

        const data = await response.json();

        setStudentData({
          name: data.ho_ten || "Chưa cập nhật",
          class: data.tenlop || "Chưa xác định",
          studentId: data.mahs || "N/A",
          dateOfBirth: data.ngaysinh ? new Date(data.ngaysinh).toLocaleDateString() : "Chưa cập nhật",
          gender: data.gioitinh || "Chưa cập nhật",
          address: data.diachi || "Chưa cập nhật",
          parentName: data.ten_phu_huynh || "Chưa cập nhật",
          parentPhone: data.sdt_phu_huynh || "Chưa cập nhật",
          email: data.email_phu_huynh || "Chưa cập nhật",
          avatar: null,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // ==== LOADING STATE ====
  if (isLoading) {
    return (
      <div className="parentdash">
        <h2 className="parentdash-header-title">Trang chính - Thông tin học sinh</h2>
        <div className="parentdash-cards">
          {[1, 2].map((i) => (
            <div key={i} className="parentdash-card parentdash-loading" />
          ))}
        </div>
      </div>
    );
  }

  // ==== ERROR STATE ====
  if (error) {
    return (
      <div className="parentdash">
        <h2 className="parentdash-header-title">Trang chính - Thông tin học sinh</h2>
        <div className="parentdash-section parentdash-error">
          <h3>Không thể tải dữ liệu</h3>
          <p>{error}</p>
          <div style={{ marginTop: "1rem" }}>
            <button
              className="parentdash-btn"
              onClick={() => window.location.reload()}
              style={{ marginRight: "0.5rem" }}
            >
              Thử lại
            </button>
            <button
              className="parentdash-btn"
              style={{ backgroundColor: "#6b7280" }}
              onClick={() => {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==== MAIN CONTENT ====
  return (
    <div className="parentdash">
      <div className="parentdash-header">
        <h2 className="parentdash-header-title">Trang chính - Thông tin học sinh</h2>
      </div>

      <div className="parentdash-cards">
        {/* CARD 1: THÔNG TIN HỌC SINH */}
        <div className="parentdash-card">
          <h3 className="parentdash-card-title">
            <Info className="parentdash-icon" /> Thông tin học sinh
          </h3>

          <div className="parentdash-student-profile">
            <div className="parentdash-avatar-container">
              {studentData.avatar ? (
                <img
                  src={studentData.avatar}
                  alt={studentData.name}
                  className="parentdash-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
              ) : (
                <div className="parentdash-avatar-placeholder">
                  {studentData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="parentdash-student-basic">
              <h3>{studentData.name}</h3>
              <p><strong>Mã học sinh:</strong> {studentData.studentId}</p>
            </div>
          </div>

          <div className="parentdash-info-grid">
            <div className="parentdash-info-item">
              <Info className="parentdash-icon" />
              <div>
                <span className="parentdash-label">Lớp</span>
                <span className="parentdash-value">{studentData.class}</span>
              </div>
            </div>
            <div className="parentdash-info-item">
              <User className="parentdash-icon" />
              <div>
                <span className="parentdash-label">Giới tính</span>
                <span className="parentdash-value">{studentData.gender}</span>
              </div>
            </div>
            <div className="parentdash-info-item">
              <Clock className="parentdash-icon" />
              <div>
                <span className="parentdash-label">Ngày sinh</span>
                <span className="parentdash-value">{studentData.dateOfBirth}</span>
              </div>
            </div>
            <div className="parentdash-info-item parentdash-full">
              <MapPin className="parentdash-icon" />
              <div>
                <span className="parentdash-label">Địa chỉ</span>
                <span className="parentdash-value">{studentData.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: THÔNG TIN PHỤ HUYNH */}
        <div className="parentdash-card">
          <h3 className="parentdash-card-title">
            <User className="parentdash-icon" /> Thông tin phụ huynh
          </h3>

          <div className="parentdash-info-grid">
            <div className="parentdash-info-item">
              <User className="parentdash-icon" />
              <div>
                <span className="parentdash-label">Họ tên phụ huynh</span>
                <span className="parentdash-value">{studentData.parentName}</span>
              </div>
            </div>
            <div className="parentdash-info-item">
              <Phone className="parentdash-icon" />
              <div>
                <span className="parentdash-label">Số điện thoại</span>
                <span className="parentdash-value">{studentData.parentPhone}</span>
              </div>
            </div>
            <div className="parentdash-info-item parentdash-full">
              <Mail className="parentdash-icon" />
              <div>
                <span className="parentdash-label">Email</span>
                <span className="parentdash-value">{studentData.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
