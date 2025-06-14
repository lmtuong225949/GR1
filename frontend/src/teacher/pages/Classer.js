import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Classer.css";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

export default function MyClassPage() {
  const navigate = useNavigate();
  const [myClass, setMyClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:5000/api/myclass/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.message) {
          setMessage(data.message);
        } else {
          setMyClass(data);
          if (data && data.malop) {
            try {
              const resStudents = await fetch(
                `http://localhost:5000/api/classes/${data.malop}/students`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const studentsData = await resStudents.json();
              setStudents(studentsData);
            } catch (studentErr) {
              console.error("Error fetching students:", studentErr);
              setMessage("Lỗi khi tải danh sách học sinh");
            }
          }
        }
      } catch (err) {
        console.error("API Error:", err);
        setMessage("Lỗi khi tải dữ liệu");
      }
    };

    fetchClass();
  }, []);

  if (message)
    return <p className="error-message">{message}</p>;

  if (!myClass)
    return <p className="loading">Đang tải lớp chủ nhiệm...</p>;

  return (
    <div className="class-page">
      <div className="class-header">
        <h2>Lớp {myClass.tenlop}</h2>
        <div className="class-info">
        <p>Giáo viên chủ nhiệm: {myClass.tengiaovien}</p>
        <p>Ghi chú: {myClass.ghichu || "Không có"}</p>
      </div>
        <button
          onClick={() => navigate(`/teacher/classes/${myClass.malop}`)}
        >
          Xem điểm học sinh
        </button>
      </div>

      <h3>Danh sách học sinh:</h3>
      {students.length === 0 ? (
        <p>Chưa có học sinh nào</p>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Ngày sinh</th>
              <th>Giới tính</th>
              <th>Địa chỉ</th>
              <th>SĐT</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.mahs}>
                <td>{student.hoten}</td>
                <td>{formatDate(student.ngaysinh)}</td>
                <td>{student.gioitinh}</td>
                <td>{student.diachi}</td>
                <td>{student.sdt}</td>
                <td>{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
