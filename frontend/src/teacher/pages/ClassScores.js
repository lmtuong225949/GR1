import React, { useEffect, useState, useCallback } from "react";
import "../styles/ClassScores.css";
import { useNavigate, useParams } from "react-router-dom";

// Popup component chỉnh sửa nhận xét
function EditScorePopup({ score, onClose, onSave }) {
  const [nhanxet, setNhanxet] = useState(score.nhanxet ?? "");

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
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

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const url = `http://localhost:5000/api/myclass/${malop}/scores`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Lỗi ${res.status}: ${text}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setScores(data);
      } else {
        setError("Dữ liệu không hợp lệ từ server.");
      }
    } catch (err) {
      console.error("Lỗi tải điểm:", err);
      setError("Dữ liệu không hợp lệ từ server.");
    } finally {
      setLoading(false);
    }
  }, [malop]);

  useEffect(() => {
    if (!malop) {
      setError("Thiếu mã lớp để tải điểm");
      setLoading(false);
      return;
    }
    fetchScores();
  }, [malop, fetchScores]);

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

  return (
    <div className="scores-page">
      <div className="scores-header">
        <h2>Điểm trung bình lớp</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          Quay lại
        </button>
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
          Chưa có điểm nào.
          <br />
          <button onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      )}

      {!loading && !error && scores.length > 0 && (
        <table className="scores-table">
          <thead>
            <tr>
              <th>Học sinh</th>
              <th>Điểm TB</th>
              <th>Học kỳ</th>
              <th>Năm học</th>
              <th>Nhận xét</th>
              <th>Chỉnh sửa</th>
              <th>Xem chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, idx) => (
              <tr key={idx}>
                <td>{score.hoten}</td>
                <td>{score.diemtrungbinh ?? "Chưa có"}</td>
                <td>{score.hocky}</td>
                <td>{score.namhoc}</td>
                <td>{score.nhanxet || "Không có"}</td>
                <td>
                  <button
                    onClick={() =>
                      handleEdit(score.mahs, score.hocky, score.namhoc)
                    }
                  >
                    Chỉnh sửa
                  </button>
                </td>
                <td>
                  <button onClick={() => handleViewDetails(score.mahs, score.hocky, score.namhoc)}>
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
