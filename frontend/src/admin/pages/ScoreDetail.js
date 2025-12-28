import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/ScoreDetail.css";

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
        // Use the new diem API endpoint
        const url = `http://localhost:5000/api/scores/diem`;
        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Lỗi ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        
        // Filter data for specific student and semester/year
        const filteredData = data.filter(item => 
          item.mahs === mahs && 
          item.hocky === hocky && 
          item.namhoc === namhoc
        );
        
        // Group by subject and calculate averages
        const subjectData = {};
        filteredData.forEach(item => {
          if (item.diems && Array.isArray(item.diems)) {
            item.diems.forEach(grade => {
              const subject = grade.tenmon || 'Không xác định';
              if (!subjectData[subject]) {
                subjectData[subject] = {
                  diem15phut: [],
                  diem1tiet: [],
                  diemcuoiky: [],
                  allGrades: []
                };
              }
              
              // Categorize grades by type (you may need to adjust this based on loaidiemid)
              if (grade.loaidiemid === 1) { // Assuming 1 = 15 phút
                subjectData[subject].diem15phut.push(grade.giatri);
              } else if (grade.loaidiemid === 2) { // Assuming 2 = 1 tiết
                subjectData[subject].diem1tiet.push(grade.giatri);
              } else if (grade.loaidiemid === 3) { // Assuming 3 = Cuối kỳ
                subjectData[subject].diemcuoiky.push(grade.giatri);
              }
              
              subjectData[subject].allGrades.push(grade.giatri);
            });
          }
        });
        
        // Convert to array format for display
        const displayData = Object.entries(subjectData).map(([subject, grades]) => {
          const avg15phut = grades.diem15phut.length > 0 
            ? grades.diem15phut.reduce((a, b) => a + b, 0) / grades.diem15phut.length 
            : null;
          const avg1tiet = grades.diem1tiet.length > 0 
            ? grades.diem1tiet.reduce((a, b) => a + b, 0) / grades.diem1tiet.length 
            : null;
          const avgcuoiky = grades.diemcuoiky.length > 0 
            ? grades.diemcuoiky.reduce((a, b) => a + b, 0) / grades.diemcuoiky.length 
            : null;
          const avgAll = grades.allGrades.length > 0 
            ? grades.allGrades.reduce((a, b) => a + b, 0) / grades.allGrades.length 
            : null;
            
          return {
            monhoc: subject,
            diem15phut: avg15phut,
            diem1tiet: avg1tiet,
            diemcuoiky: avgcuoiky,
            diemtrungbinh: avgAll
          };
        });
        
        setDetails(displayData);
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
                  <td>{item.diem15phut !== null ? item.diem15phut.toFixed(2) : '-'}</td>
                  <td>{item.diem1tiet !== null ? item.diem1tiet.toFixed(2) : '-'}</td>
                  <td>{item.diemcuoiky !== null ? item.diemcuoiky.toFixed(2) : '-'}</td>
                  <td>{item.diemtrungbinh !== null ? item.diemtrungbinh.toFixed(2) : '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  Không có dữ liệu chi tiết cho học sinh {mahs} trong học kỳ {hocky}, năm học {namhoc}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScoreDetail;
