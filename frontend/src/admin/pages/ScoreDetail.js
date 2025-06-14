import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import '../styles/ScoreDetail.css';

const ScoreDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Lấy params từ location.state hoặc từ query string
  const { mahs, hocky, namhoc } = location.state || {
    mahs: searchParams.get("mahs"),
    hocky: searchParams.get("hocky"),
    namhoc: searchParams.get("namhoc")
  };

  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mahs || !hocky || !namhoc) {
      setError("Thiếu tham số để xem chi tiết điểm.");
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const encodedMahs = encodeURIComponent(mahs);
        const encodedHocky = encodeURIComponent(hocky);
        const encodedNamhoc = encodeURIComponent(namhoc);

        const url = `http://localhost:5000/api/scores/${encodedMahs}?hocky=${encodedHocky}&namhoc=${encodedNamhoc}`;
        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Lỗi ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        setDetails(data); // Dữ liệu backend đã đúng định dạng
      } catch (err) {
        console.error('Error fetching score details:', err);
        setError(`Lỗi khi tải dữ liệu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [mahs, hocky, namhoc]);

  if (!mahs || !hocky || !namhoc) {
    return (
      <div className="score-detail-page">
        <p style={{ color: 'red' }}>Thiếu tham số để xem chi tiết điểm.</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="score-detail-page">
      <h2>Chi tiết điểm học sinh: {mahs}</h2>
      <p>Học kỳ: {hocky} | Năm học: {namhoc}</p>
      <button onClick={() => navigate(-1)}>Quay lại</button>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table className="score-detail-table">
          <thead>
            <tr>
              <th>Môn học</th>
              <th>Điểm 15 phút</th>
              <th>Điểm 1 tiết</th>
              <th>Điểm cuối kỳ</th>
              <th>Điểm TB</th>
            </tr>
          </thead>
          <tbody>
            {details.length > 0 ? (
              details.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.monhoc}</td>
                  <td>{item.diem15phut !== null ? item.diem15phut : '-'}</td>
                  <td>{item.diem1tiet !== null ? item.diem1tiet : '-'}</td>
                  <td>{item.diemcuoiky !== null ? item.diemcuoiky : '-'}</td>
                  <td>{item.diemtrungbinh !== null ? item.diemtrungbinh.toFixed(2) : '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Không có dữ liệu chi tiết</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScoreDetail;
