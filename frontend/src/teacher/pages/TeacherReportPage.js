import React, { useEffect, useState } from "react";
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

export default function ScoreReportPage() {
  const [myClass, setMyClass] = useState(null);
  const [scores, setScores] = useState([]); // Chi tiết điểm từng HS
  const [loadingClass, setLoadingClass] = useState(true);
  const [loadingScores, setLoadingScores] = useState(false);
  const [error, setError] = useState(null);

  const [hocky, setHocky] = useState("1");
  const [namhoc, setNamhoc] = useState("2024-2025");

  // Lấy lớp giáo viên chủ nhiệm
  useEffect(() => {
    const fetchMyClass = async () => {
      setLoadingClass(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:5000/api/myclass", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Lỗi khi lấy lớp");
        const data = await res.json();
        setMyClass(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingClass(false);
      }
    };
    fetchMyClass();
  }, []);

  // Lấy điểm chi tiết từng HS theo lớp, học kỳ, năm học
  useEffect(() => {
    if (!myClass || !myClass.malop) return;

    const fetchScores = async () => {
      setLoadingScores(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
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
        setError(err.message);
      } finally {
        setLoadingScores(false);
      }
    };

    fetchScores();
  }, [myClass, hocky, namhoc]);

  // Lấy phân phối điểm theo lớp, học kỳ, năm học
  useEffect(() => {
    if (!myClass || !myClass.malop) return;

    const fetchScoreDistribution = async () => {
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
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
      } catch (err) {
        setError(err.message);
      }
    };

    fetchScoreDistribution();
  }, [myClass, hocky, namhoc]);

  if (loadingClass) return <p>Đang tải lớp...</p>;
  if (error) return <p style={{ color: "red" }}>Lỗi: {error}</p>;
  if (!myClass || !myClass.malop) return <p>Bạn không phải giáo viên chủ nhiệm lớp nào.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Thống kê điểm lớp {myClass.tenlop}</h2>
      <p>Giáo viên chủ nhiệm: {myClass.tengiaovien}</p>

      <div style={{ marginBottom: 20 }}>
        <label>
          Học kỳ:{" "}
          <select value={hocky} onChange={(e) => setHocky(e.target.value)}>
            <option value="1">Học kỳ I</option>
            <option value="2">Học kỳ II</option>
          </select>
        </label>

        <label style={{ marginLeft: 20 }}>
          Năm học:{" "}
          <select value={namhoc} onChange={(e) => setNamhoc(e.target.value)}>
            <option value="2024-2025">2024-2025</option>
          </select>
        </label>
      </div>

      {loadingScores ? (
        <p>Đang tải điểm...</p>
      ) : scores.length === 0 ? (
        <p>Chưa có dữ liệu điểm cho học kỳ/năm học này.</p>
      ) : (
        <>
          <h3>Biểu đồ điểm trung bình học sinh</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={scores.map(({ mahs, hoten, diemtrungbinh }) => ({
                id: mahs,
                name: hoten,
                diemtrungbinh: diemtrungbinh ?? 0,
              }))}
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
              <Tooltip formatter={(value) => value.toFixed(2)} />
              <Legend />
              <Bar dataKey="diemtrungbinh" fill="#82ca9d" name="Điểm trung bình" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}      
    </div>
  );
}
