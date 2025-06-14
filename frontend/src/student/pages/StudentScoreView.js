import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Thêm
import "../styles/StudentScoreView.css";

const StudentScoreView = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mahs = localStorage.getItem("mahs");
  const navigate = useNavigate(); // 👈 Hook điều hướng

  useEffect(() => {
    const fetchAvgScores = async () => {
      if (!mahs) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch("http://localhost:5000/api/scores");
        const data = await res.json();

        if (res.ok) {
          const studentScores = data.filter((s) => s.mahs === mahs);
          setScores(studentScores);
        } else {
          throw new Error(data.message || "Không thể tải dữ liệu điểm");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAvgScores();
  }, [mahs]);

  const goToDetailPage = (hocky, namhoc) => {
    navigate(`/student/scores/${hocky}/${namhoc}`);
  };

  return (
    <div className="score-view">
      <h2>Điểm trung bình các môn</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table className="score-table">
        <thead>
          <tr>
            <th>Học kỳ</th>
            <th>Năm học</th>
            <th>Điểm trung bình</th>
            <th>Xếp loại</th>
            <th>Hạnh kiểm</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {scores.length > 0 ? (
            scores.map((s, idx) => (
              <tr key={idx}>
                <td>{s.hocky}</td>
                <td>{s.namhoc}</td>
                <td>{s.diemtrungbinh?.toFixed(2)}</td>
                <td>{s.xeploaihocluc}</td>
                <td>{s.hanhkiem}</td>
                <td>
                  <button onClick={() => goToDetailPage(s.hocky, s.namhoc)}>
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Không có dữ liệu điểm.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentScoreView;
