import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../styles/TeacherReportPage.css";
export default function ScoreReportPage() {
  const [myClass, setMyClass] = useState(null);
  const [scores, setScores] = useState([]); // Chi tiết điểm từng HS
  const [scoreDistribution, setScoreDistribution] = useState([]); // Phân phối điểm
  const [loadingClass, setLoadingClass] = useState(true);
  const [loadingScores, setLoadingScores] = useState(false);
  const [loadingDistribution, setLoadingDistribution] = useState(false);
  const [error, setError] = useState(null);

  const [hocky, setHocky] = useState("1");
  const [namhoc, setNamhoc] = useState("2024-2025");

  // Lấy lớp giáo viên chủ nhiệm
  const fetchMyClass = useCallback(async () => {
    setLoadingClass(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.");
      }
      
      const res = await fetch("http://localhost:5000/api/myclass", {
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
      
      // Handle both response formats
      if (data.message) {
        // Teacher is not a homeroom teacher
        setMyClass(null);
        setError(data.message);
      } else {
        setMyClass(data);
      }
    } catch (err) {
      console.error("Error fetching my class:", err);
      setError(err.message);
    } finally {
      setLoadingClass(false);
    }
  }, []);

  // Lấy điểm chi tiết từng HS theo lớp, học kỳ, năm học
  const fetchScores = useCallback(async () => {
    if (!myClass || !myClass.malop) return;

    setLoadingScores(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.");
      }
      
      const url = `http://localhost:5000/api/myclass/${myClass.malop}/scores?hocky=${hocky}&namhoc=${namhoc}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      setScores(data);
    } catch (err) {
      console.error("Error fetching scores:", err);
      setError(err.message);
    } finally {
      setLoadingScores(false);
    }
  }, [myClass, hocky, namhoc]);

  // Lấy phân phối điểm theo lớp, học kỳ, năm học
  const fetchScoreDistribution = useCallback(async () => {
    if (!myClass || !myClass.malop) return;

    setLoadingDistribution(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.");
      }
      
      const url = `http://localhost:5000/api/myclass/${myClass.malop}/scoresto?hocky=${hocky}&namhoc=${namhoc}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      setScoreDistribution(data);
    } catch (err) {
      console.error("Error fetching score distribution:", err);
      setError(err.message);
    } finally {
      setLoadingDistribution(false);
    }
  }, [myClass, hocky, namhoc]);

  // Initialize data on mount
  useEffect(() => {
    fetchMyClass();
  }, [fetchMyClass]);

  // Fetch scores and distribution when class or filters change
  useEffect(() => {
    if (myClass && myClass.malop) {
      fetchScores();
      fetchScoreDistribution();
    }
  }, [fetchScores, fetchScoreDistribution]);

  // Handle filter changes
  const handleHockyChange = (newHocky) => {
    setHocky(newHocky);
  };

  const handleNamhocChange = (newNamhoc) => {
    setNamhoc(newNamhoc);
  };

  // Prepare chart data
  const chartData = scores.map(({ mahs, hoten, diemtrungbinh }) => ({
    id: mahs,
    name: hoten,
    diemtrungbinh: diemtrungbinh ?? 0,
  }));

  // Prepare distribution chart data
  const distributionChartData = scoreDistribution.map(item => ({
    range: item.range,
    soLuong: item.so_luong,
  }));

  if (loadingClass) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Đang tải thông tin lớp...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p style={{ color: "red" }}>Lỗi: {error}</p>
        <button 
          onClick={fetchMyClass}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!myClass || !myClass.malop) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Bạn không phải giáo viên chủ nhiệm lớp nào.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 15 }}>
        <h2 style={{ margin: 0, color: '#333' }}>Thống kê điểm lớp {myClass.tenlop}</h2>
        <p style={{ margin: '5px 0', color: '#666' }}>
          Giáo viên chủ nhiệm: {myClass.tengiaovien}
        </p>
        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
          Khối: {myClass.khoi} | Sĩ số: {myClass.sochongoi}
        </p>
      </div>

      <div style={{ 
        marginBottom: 30, 
        padding: 15, 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
            Học kỳ:{" "}
          </label>
          <select 
            value={hocky} 
            onChange={(e) => handleHockyChange(e.target.value)}
            style={{ 
              padding: '5px 10px', 
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            <option value="1">Học kỳ I</option>
            <option value="2">Học kỳ II</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
            Năm học:{" "}
          </label>
          <select 
            value={namhoc} 
            onChange={(e) => handleNamhocChange(e.target.value)}
            style={{ 
              padding: '5px 10px', 
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>

        {(loadingScores || loadingDistribution) && (
          <div style={{ color: '#007bff', fontSize: '14px' }}>
            Đang tải dữ liệu...
          </div>
        )}
      </div>

      {loadingScores ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Đang tải điểm...</p>
        </div>
      ) : scores.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          color: '#666'
        }}>
          <p>Chưa có dữ liệu điểm cho học kỳ/năm học này.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ color: '#333', marginBottom: 20 }}>Biểu đồ điểm trung bình học sinh</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 10]} allowDecimals={true} />
                <Tooltip 
                  formatter={(value) => value.toFixed(2)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
                />
                <Legend />
                <Bar dataKey="diemtrungbinh" fill="#82ca9d" name="Điểm trung bình" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {scoreDistribution.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ color: '#333', marginBottom: 20 }}>Phân phối điểm theo khoảng</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={distributionChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
                  />
                  <Legend />
                  <Bar dataKey="soLuong" fill="#8884d8" name="Số lượng học sinh" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ 
            padding: 15, 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <p style={{ margin: 0 }}>
              <strong>Tổng số học sinh:</strong> {scores.length} | 
              <strong> Điểm trung bình lớp:</strong> {
                scores.length > 0 
                  ? (scores.reduce((sum, s) => sum + (s.diemtrungbinh || 0), 0) / scores.length).toFixed(2)
                  : 'N/A'
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
}
