import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Reports = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dữ liệu điểm
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/scores");
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
        const rawData = await res.json();

        const mapped = rawData.map((item) => ({
          name: item.name,
          mahs: item.mahs,
          namhoc: item.namhoc,
          hocky: item.hocky,
          diemtrungbinh: item.diemtrungbinh,
          danhHieu: item.xeploaihocluc || "Chưa xếp loại",
        }));

        setData(mapped);

        // Lấy năm học mới nhất
        const sortedYears = [...new Set(mapped.map((d) => d.namhoc))].sort().reverse();
        const newestYear = sortedYears[0];

        // Trong năm mới nhất, tìm học kỳ lớn nhất
        const semestersOfYear = mapped
          .filter((d) => d.namhoc === newestYear)
          .map((d) => d.hocky);
        const sortedSemesters = [...new Set(semestersOfYear)].sort((a, b) => Number(b) - Number(a));
        const newestSemester = sortedSemesters[0];

        setSelectedYear(newestYear);
        setSelectedSemester(newestSemester);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  // Lọc theo năm học và học kỳ
  useEffect(() => {
    if (!selectedYear || !selectedSemester) return;
    const filtered = data.filter(
      (item) => item.namhoc === selectedYear && item.hocky === selectedSemester
    );
    setFilteredData(filtered);
  }, [data, selectedYear, selectedSemester]);

  // Gom nhóm theo danh hiệu học sinh
  const summaryByRank = filteredData.reduce((acc, curr) => {
    const key = curr.danhHieu;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const danhHieuChartData = Object.entries(summaryByRank).map(([label, count]) => ({
    danhHieu: label,
    soLuong: count,
  }));

  // Tạo dữ liệu phổ điểm trung bình
  const scoreRanges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
  ];

  const scoreDistributionData = scoreRanges.map(([min, max]) => ({
    range: `${min}-${max}`,
    count: filteredData.filter((d) => d.diemtrungbinh >= min && d.diemtrungbinh < max).length,
  }));

  // Đảm bảo điểm 10 được tính riêng
  scoreDistributionData[scoreDistributionData.length - 1].count += filteredData.filter(
    (d) => d.diemtrungbinh === 10
  ).length;

  // Danh sách năm học và học kỳ
  const namHocList = [...new Set(data.map((d) => d.namhoc))];
  const hocKyList = [...new Set(data.map((d) => d.hocky))];

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Báo cáo kết quả học tập</h2>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && selectedYear && selectedSemester && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Năm học:
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ margin: "0 1rem" }}
              >
                {namHocList.map((year, idx) => (
                  <option key={idx} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Học kỳ:
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                style={{ margin: "0 1rem" }}
              >
                {hocKyList.map((hk, idx) => (
                  <option key={idx} value={hk}>
                    {hk}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <h3>Phổ điểm trung bình</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Số học sinh" />
            </BarChart>
          </ResponsiveContainer>

          <h3 style={{ marginTop: "2rem" }}>
            Biểu đồ số lượng danh hiệu học sinh
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={danhHieuChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="danhHieu" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="soLuong" fill="#82ca9d" name="Số học sinh" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default Reports;
