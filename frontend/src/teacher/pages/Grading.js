import React, { useEffect, useState } from "react";
import "../styles/AssignmentView.css";
import { useNavigate } from "react-router-dom";

const AssignmentViewForTeacher = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!token) {
      navigate('/teacher/login');
      return;
    }

    const fetchTeacherAssignments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:5000/api/assignments/bygv`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const result = await res.json();
        console.log('API Response:', result);

        if (res.ok) {
          setAssignments(result.data);
        } else if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('magv');
          navigate('/teacher/login');
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

    fetchTeacherAssignments();
  }, [token, navigate]);

  return (
    <div className="section">
      <h3>Các lớp đang dạy</h3>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}

      <table className="schedule-table">
        <thead>
          <tr>
            <th>Lớp</th>
            <th>Môn học</th>
            <th>Năm học</th>
            <th>Học kỳ</th>
            <th>Nhập điểm</th>
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
                <td>
                <button className="btn btn-primary"
                  onClick={() => navigate(`/teacher/grading/${item.tenlop}?lopid=${item.lopid}&monid=${item.monid}&hocky=${item.hocky}&namhoc=${item.namhoc}` )}
                >
                  Nhập điểm
                </button>
                </td>
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
