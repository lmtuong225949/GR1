import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ClassScores.css";

// Popup component chỉnh sửa nhận xét
function EditScorePopup({ score, onClose, onSave }) {
  const [nhanxet, setNhanxet] = useState(score.nhanxet ?? "");

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/myclass/${score.mahs}/${score.hocky}/${score.namhoc}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nhanxet }),
        }
      );

      if (!res.ok) throw new Error("Cập nhật thất bại");
      alert("Cập nhật thành công");
      onSave(); // reload dữ liệu
      onClose();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>Chỉnh sửa - {score.hoten}</h3>
        <label>Nhận xét:</label>
        <textarea
          value={nhanxet}
          onChange={(e) => setNhanxet(e.target.value)}
          rows={5}
        />
        <div className="popup-actions">
          <button onClick={handleSubmit}>Lưu</button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

export default function ClassScoresPage() {
  const navigate = useNavigate();
  const { malop } = useParams();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScore, setSelectedScore] = useState(null);
  const [hocky, setHocky] = useState("1");
  const [namhoc, setNamhoc] = useState("2024-2025");

  const fetchScores = useCallback(async () => {
    if (!malop) {
      setError("Thiếu mã lớp để tải điểm");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.");
      }

      // Lấy điểm chi tiết theo từng môn cho học sinh trong lớp
      const url = `http://localhost:5000/api/myclass/${malop}/detailed-scores?hocky=${hocky}&namhoc=${namhoc}`;
      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Lỗi ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setScores(data.data);
      } else {
        // Fallback: lấy điểm trung bình nếu API chi tiết không có
        const fallbackUrl = `http://localhost:5000/api/myclass/${malop}/scores`;
        const fallbackRes = await fetch(fallbackUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData)) {
            setScores(fallbackData);
          } else {
            throw new Error("Dữ liệu không hợp lệ từ server.");
          }
        } else {
          throw new Error("Không thể tải dữ liệu điểm");
        }
      }
    } catch (err) {
      console.error("Lỗi tải điểm:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [malop, hocky, namhoc]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleEdit = (mahs, hocky, namhoc) => {
    const selected = scores.find(
      (s) => s.mahs === mahs && s.hocky === hocky && s.namhoc === namhoc
    );
    if (selected) setSelectedScore(selected);
  };

  const handleViewDetails = (mahs, hocky, namhoc) => {
    navigate(`/teacher/scores/${mahs}`, {
      state: { mahs, hocky, namhoc },
    });
  };

  const handleHockyChange = (e) => {
    setHocky(e.target.value);
  };

  const handleNamhocChange = (e) => {
    setNamhoc(e.target.value);
  };

  // Helper function to render subject scores
  const renderSubjectScores = (student) => {
    if (!student.subjects || student.subjects.length === 0) {
      return <td colSpan="6" className="no-data">Chưa có điểm môn nào</td>;
    }

    return student.subjects.map((subject, idx) => (
      <React.Fragment key={`${student.mahs}-${subject.monhoc}`}>
        {idx === 0 && (
          <>
            <td rowSpan={student.subjects.length} className="student-name">
              {student.hoten}
            </td>
            <td rowSpan={student.subjects.length} className="average-score">
              {student.diemtrungbinh ? parseFloat(student.diemtrungbinh).toFixed(2) : "Chưa có"}
            </td>
          </>
        )}
        <td className="subject-name">{subject.monhoc}</td>
        <td className="grade-score">
          {subject.diemmieng ? parseFloat(subject.diemmieng).toFixed(2) : "-"}
        </td>
        <td className="grade-score">
          {subject.diem15phut ? parseFloat(subject.diem15phut).toFixed(2) : "-"}
        </td>
        <td className="grade-score">
          {subject.diem1tiet ? parseFloat(subject.diem1tiet).toFixed(2) : "-"}
        </td>
        <td className="grade-score">
          {subject.diemcuoaky ? parseFloat(subject.diemcuoaky).toFixed(2) : "-"}
        </td>
        <td className="subject-average">
          {subject.diemtrungbinh ? parseFloat(subject.diemtrungbinh).toFixed(2) : "-"}
        </td>
        {idx === 0 && (
          <>
            <td rowSpan={student.subjects.length} className="nhanxet-cell">
              {student.nhanxet || "Không có"}
            </td>
            <td rowSpan={student.subjects.length} className="actions-cell">
              <button
                onClick={() => handleEdit(student.mahs, student.hocky, student.namhoc)}
                className="edit-button"
              >
                Chỉnh sửa
              </button>
              <button 
                onClick={() => handleViewDetails(student.mahs, student.hocky, student.namhoc)}
                className="view-button"
              >
                Chi tiết
              </button>
            </td>
          </>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="scores-page">
      <div className="scores-header">
        <h2>Điểm chi tiết lớp {malop}</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          Quay lại
        </button>
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label>
            Học kỳ:
            <select value={hocky} onChange={handleHockyChange}>
              <option value="1">Học kỳ I</option>
              <option value="2">Học kỳ II</option>
            </select>
          </label>
          <label>
            Năm học:
            <select value={namhoc} onChange={handleNamhocChange}>
              <option value="2024-2025">2024-2025</option>
            </select>
          </label>
        </div>
      </div>

      {loading && <div className="loading">Đang tải điểm...</div>}

      {error && (
        <div className="error-message">
          {error}
          <br />
          <button onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      )}

      {!loading && !error && scores.length === 0 && (
        <div className="no-data">
          Chưa có điểm nào cho lớp {malop}.
          <br />
          <button onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      )}

      {!loading && !error && scores.length > 0 && (
        <div className="table-container">
          <table className="scores-table detailed-scores">
            <thead>
              <tr>
                <th rowSpan="2" className="header-student">Học sinh</th>
                <th rowSpan="2" className="header-average">Điểm TB</th>
                <th colSpan="5" className="header-subjects">Điểm các môn</th>
                <th rowSpan="2" className="header-nhanxet">Nhận xét</th>
                <th rowSpan="2" className="header-actions">Thao tác</th>
              </tr>
              <tr className="sub-headers">
                <th>Môn học</th>
                <th>Miệng</th>
                <th>15 phút</th>
                <th>1 tiết</th>
                <th>Cuối kỳ</th>
                <th>TB môn</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((student, idx) => (
                <React.Fragment key={student.mahs || idx}>
                  {renderSubjectScores(student)}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          <div className="scores-summary">
            <p>Tổng số học sinh: <strong>{scores.length}</strong></p>
            <p>
              Điểm trung bình lớp: <strong>
                {scores.length > 0 
                  ? (scores.reduce((sum, s) => sum + (s.diemtrungbinh || 0), 0) / scores.length).toFixed(2)
                  : 'N/A'
                }
              </strong>
            </p>
          </div>
        </div>
      )}

      {selectedScore && (
        <EditScorePopup
          score={selectedScore}
          onClose={() => setSelectedScore(null)}
          onSave={fetchScores}
        />
      )}
    </div>
  );
}
