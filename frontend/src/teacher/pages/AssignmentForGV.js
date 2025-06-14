import React, { useEffect, useState } from "react";
import "../styles/AssignmentView.css";

const AssignmentViewForTeacher = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) return;
    
    const fetchTeacherAssignments = async () => {
      setLoading(true);
      setError("");
      try {
        console.log('Fetching assignments with token:', token);
        const res = await fetch(`http://localhost:5000/api/assignments/bygv`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        console.log('Response status:', res.status);
        const result = await res.json();
        console.log('API Response:', result);

        if (res.ok) {
          setAssignments(result.data);
          console.log('Set assignments:', result.data);
        } else {
          throw new Error(result.message || "Lỗi không xác định");
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherAssignments();
  }, [token]);
  return (
    <div className="section">
      <h3>Lịch giảng dạy của tôi</h3>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}

      <table className="schedule-table">
        <thead>
          <tr>
            <th>Lớp</th>
            <th>Môn học</th>
            <th>Năm học</th>
            <th>Học kỳ</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length > 0 ? (
            assignments.map((item) => (
              <tr key={item.id}>
                <td>{item.tenlop}</td>
                <td>{item.tenmon}</td>
                <td>{item.namhoc}</td>
                <td>{item.hocky}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Không có phân công nào cho bạn.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentViewForTeacher;

