import React, { useState, useEffect } from "react";
import "../styles/Grading.css";
import { useNavigate } from "react-router-dom";

const AssignmentViewForTeacher = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [error, setError] = useState("");
  
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
          console.log('Raw API Response:', result);
          setAssignments(result.data);
          console.log('Assignments set:', result.data);
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
  }, [token, navigate]);

  return (
    <div className="teacher-grading-container">
      <h3 className="teacher-grading-title">Các lớp đang giảng dạy</h3>

      {loading && <p className="teacher-grading-loading">Đang tải dữ liệu...</p>}
      {error && <p className="teacher-grading-error">Lỗi: {error}</p>}

      <table className="teacher-grading-table">
        <thead className="teacher-grading-table-head">
          <tr>
            <th className="teacher-grading-table-header">Lớp</th>
            <th className="teacher-grading-table-header">Môn học</th>
            <th className="teacher-grading-table-header">Năm học</th>
            <th className="teacher-grading-table-header">Học kỳ</th>
            <th className="teacher-grading-table-header">Nhập điểm</th>
          </tr>
        </thead>    
        <tbody className="teacher-grading-table-body">
          {assignments.length > 0 ? (
            assignments.map((item) => {
              console.log('Assignment item:', item);
              return (
              <tr key={item.id} className="teacher-grading-table-row">
                <td className="teacher-grading-table-cell">{item.tenlop}</td>
                <td className="teacher-grading-table-cell">{item.tenmon}</td>
                <td className="teacher-grading-table-cell">{item.namhoc}</td>
                <td className="teacher-grading-table-cell">{item.hocky}</td>
                <td className="teacher-grading-table-cell">
                <button className="teacher-grading-action-btn"
                  onClick={() => {
                    console.log('Navigating to score detail with params:', {
                      lopid: item.lopid,
                      monid: item.monid,
                      namhoc_id: item.namhoc_id,
                      hocky: item.hocky,
                      tenlop: item.tenlop,
                      tenmon: item.tenmon
                    });
                    navigate(`/teacher/score-detail?lopid=${item.lopid}&monid=${item.monid}&namhoc_id=${item.namhoc_id}&hocky=${item.hocky}&tenlop=${item.tenlop}&tenmon=${item.tenmon}`, {
                      state: {
                        lopid: item.lopid,
                        monid: item.monid,
                        namhoc_id: item.namhoc_id,
                        hocky: item.hocky,
                        tenlop: item.tenlop,
                        tenmon: item.tenmon
                      }
                    });
                  }}
                >
                  Nhập điểm
                </button>
                </td>
              </tr>
              );
            })
          ) : (
            <tr className="teacher-grading-empty-row">
              <td colSpan="5" className="teacher-grading-empty-cell">
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
