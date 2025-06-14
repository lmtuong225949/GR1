import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";

const ScoreDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Ưu tiên lấy từ location.state, nếu không thì fallback sang query string
  const mahs = location.state?.mahs || searchParams.get("mahs") || "";
  const hocky = location.state?.hocky || searchParams.get("hocky") || "";
  const namhoc = location.state?.namhoc || searchParams.get("namhoc") || "";

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
        const url = `http://localhost:5000/api/scores/${encodeURIComponent(mahs)}?hocky=${encodeURIComponent(hocky)}&namhoc=${encodeURIComponent(namhoc)}`;
        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Lỗi ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        setDetails(data); // data phải là mảng
      } catch (err) {
        console.error("Error fetching score details:", err);
        setError(`Lỗi khi tải dữ liệu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [mahs, hocky, namhoc]);

  return (
    <div className="score-detail-page" style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h2>Chi tiết điểm học sinh</h2>
      <p><strong>Mã học sinh:</strong> {mahs}</p>
      <p><strong>Học kỳ:</strong> {hocky} | <strong>Năm học:</strong> {namhoc}</p>

      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        Quay lại
      </button>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ backgroundColor: "#f2f2f2" }}>
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
                  <td>{item.diem15phut ?? "-"}</td>
                  <td>{item.diem1tiet ?? "-"}</td>
                  <td>{item.diemcuoiky ?? "-"}</td>
                  <td>{item.diemtrungbinh !== null && item.diemtrungbinh !== undefined ? item.diemtrungbinh.toFixed(2) : "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>Không có dữ liệu chi tiết</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScoreDetail;
