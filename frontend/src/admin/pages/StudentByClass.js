import React, { useState, useEffect } from "react";
import "../styles/StudentsByClass.css"; 
import { useParams, useLocation, useNavigate } from "react-router-dom";

const StudentsByClass = () => {
  const { malop } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Nếu bạn truyền tên lớp qua `state`, có thể lấy từ location.state.tenlop
  const tenlop = location.state?.tenlop || "";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách học sinh của lớp khi component mount
  useEffect(() => {
    // Giả sử backend có route: GET /api/classes/:malop/students
    fetch(`http://localhost:5000/api/classes/${malop}/students`)
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu học sinh");
        return res.json();
      })
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [malop]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) return <div>Đang tải danh sách học sinh...</div>;
  if (error) return <div style={{ color: "red" }}>Lỗi: {error}</div>;

  return (
    <div className="students-by-class-page">
      <div className="students-by-class-header">
        <h2>Danh sách học sinh lớp: {tenlop || malop}</h2>
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Quay lại
        </button>
      </div>

      {students.length > 0 ? (
        <table className="students-by-class-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã HS</th>
              <th>Họ và tên</th>
              <th>Giới tính</th>
              <th>Ngày sinh</th>
              <th>Địa chỉ</th>
              <th>SĐT</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.mahs}>
                <td>{idx + 1}</td>
                <td>{s.mahs}</td>
                <td>{s.hoten}</td>
                <td>{s.gioitinh}</td>
                <td>{formatDate(s.ngaysinh)}</td>
                <td>{s.diachi}</td>
                <td>{s.sdt}</td>
                <td>{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-students">Chưa có học sinh trong lớp này.</div>
      )}
    </div>
  );
};

export default StudentsByClass;
