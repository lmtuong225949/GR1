import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/StudentScoreView.css';

const ScoreDetail = () => {
  const navigate = useNavigate();
  const { hocky, namhoc } = useParams();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mahs = localStorage.getItem("mahs");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!mahs || !hocky || !namhoc) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/scores/${mahs}?hocky=${hocky}&namhoc=${namhoc}`
        );
        const data = await res.json();

        if (res.ok) {
          setDetails(data);
        } else {
          throw new Error(data.message || "Không thể tải chi tiết điểm");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [mahs, hocky, namhoc]);

  return (
    <div className="score-view">
      <div style={{
        marginBottom: '20px',
        textAlign: 'left'
      }}>
        <button 
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onClick={() => navigate(-1)}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          ← Quay lại
        </button>
      </div>
      <h2>Chi tiết điểm học kỳ {hocky} - năm học {namhoc}</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {details.length > 0 && (
        <table className="score-table">
          <thead>
            <tr>
              <th>Môn</th>
              <th>15 phút</th>
              <th>1 tiết</th>
              <th>Cuối kỳ</th>
              <th>Điểm TB</th>
            </tr>
          </thead>
          <tbody>
            {details.map((mon, i) => (
              <tr key={i}>
                <td>{mon.monhoc}</td>
                <td>{mon.diem15phut ?? "-"}</td>
                <td>{mon.diem1tiet ?? "-"}</td>
                <td>{mon.diemcuoiky ?? "-"}</td>
                <td>{mon.diemtrungbinh?.toFixed(2) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScoreDetail;
