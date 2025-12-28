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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { FaChartBar, FaChartLine, FaDownload, FaFilter, FaUsers, FaGraduationCap, FaTrophy } from "react-icons/fa";
import * as XLSX from "xlsx";
import "../styles/Reports.css";

const Reports = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch dữ liệu điểm
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/scores/diem");
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
        const rawData = await res.json();

        console.log('Raw data from API:', rawData.length);

        const mapped = rawData.map((item) => ({
          id: item.id,
          mahs: item.mahs,
          diemtrungbinh: item.diemtrungbinh,
          hanhkiem: item.hanhkiem,
          xeploaihocluc: item.xeploaihocluc,
          nhanxet: item.nhanxet,
          namhoc_id: item.namhoc_id,
          namhoc: item.namhoc,
          hocky: item.hocky,
          hoten: item.hoten,
          tenlop: item.tenlop,
          danhHieu: item.xeploaihocluc || "Chưa xếp loại",
        }));

        console.log('Mapped data:', mapped.length);

        setData(mapped);

        // Set default to first available semester
        const semesters = [...new Set(mapped.map((d) => d.hocky).filter(Boolean))];
        const defaultSemester = semesters.length > 0 ? semesters[0] : null;
        console.log('Available semesters:', semesters);
        console.log('Default semester:', defaultSemester);
        setSelectedSemester(defaultSemester);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  // Lọc theo học kỳ
  useEffect(() => {
    console.log('Filter effect triggered:', { selectedSemester, dataLength: data.length });
    
    if (!selectedSemester) {
      console.log('No semester selected, clearing filtered data');
      setFilteredData([]);
      return;
    }
    
    const filtered = data.filter(
      (item) => item.hocky === selectedSemester
    );
    
    console.log('Filtering data:');
    console.log('- Total data:', data.length);
    console.log('- Selected semester:', selectedSemester);
    console.log('- Filtered result:', filtered.length);
    console.log('- Sample filtered item:', filtered[0]);
    
    setFilteredData(filtered);
  }, [data, selectedSemester]);

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

  console.log('Rank summary:', summaryByRank);
  console.log('Chart data:', danhHieuChartData);

  // Tạo dữ liệu phổ điểm trung bình
  const scoreRanges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]
  ];

  const scoreDistributionData = scoreRanges.map(([min, max]) => ({
    range: `${min}-${max}`,
    count: filteredData.filter((d) => {
      const score = d.diemtrungbinh;
      if (!score || isNaN(score)) return false;
      if (min === 9 && max === 10) {
        return score >= min && score <= max; // Bao gồm cả điểm 10
      }
      return score >= min && score < max;
    }).length,
  }));

  // Danh sách học kỳ
  const hocKyList = ['HK1', 'HK2']; // From namhoc table

  // Tính toán thống kê
  const totalStudents = filteredData.length;
  const validStudents = filteredData.filter(d => d.diemtrungbinh && !isNaN(d.diemtrungbinh));
  const averageScore = validStudents.length > 0 
    ? (validStudents.reduce((sum, d) => sum + d.diemtrungbinh, 0) / validStudents.length).toFixed(2)
    : 0;
  
  console.log('Statistics:', {
    totalStudents,
    validStudentsCount: validStudents.length,
    averageScore,
    sampleValidStudent: validStudents[0]
  });
  
  const excellentStudents = validStudents.filter(d => d.diemtrungbinh >= 8).length;
  const goodStudents = validStudents.filter(d => d.diemtrungbinh >= 6.5 && d.diemtrungbinh < 8).length;
  const averageStudents = validStudents.filter(d => d.diemtrungbinh >= 5 && d.diemtrungbinh < 6.5).length;
  const weakStudents = validStudents.filter(d => d.diemtrungbinh < 5).length;

  // Debug: Compare different ways of counting "giỏi"
  const excellentByScore = validStudents.filter(d => d.diemtrungbinh >= 8).length;
  const excellentByRank = filteredData.filter(d => d.xeploaihocluc === "Giỏi").length;
  const excellentByDanhHieu = filteredData.filter(d => d.danhHieu === "Giỏi").length;
  
  console.log('Excellent students comparison:', {
    byScore: excellentByScore,
    byRank: excellentByRank, 
    byDanhHieu: excellentByDanhHieu,
    totalFiltered: filteredData.length
  });

  // Thống kê tổng số học sinh duy nhất (không phân biệt kỳ)
  const uniqueStudents = [...new Set(data.map(d => d.mahs).filter(mahs => mahs))].length;

  // Số học sinh có điểm không hợp lệ
  const invalidScores = filteredData.filter(d => !d.diemtrungbinh || isNaN(d.diemtrungbinh)).length;

  // Debug: Show actual xeploaihocluc values
  const rankCounts = {};
  filteredData.forEach(d => {
    const rank = d.xeploaihocluc || 'NULL';
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  console.log('Rank distribution:', rankCounts);

  // Debug: Show actual danhHieu values  
  const danhHieuCounts = {};
  filteredData.forEach(d => {
    const danhHieu = d.danhHieu || 'NULL';
    danhHieuCounts[danhHieu] = (danhHieuCounts[danhHieu] || 0) + 1;
  });
  console.log('DanhHieu distribution:', danhHieuCounts);
  const debugStats = {
    totalInFiltered: filteredData.length,
    validStudents: validStudents.length,
    totalInDistribution: scoreDistributionData.reduce((sum, d) => sum + d.count, 0),
    totalInRanks: excellentStudents + goodStudents + averageStudents + weakStudents,
    invalidScores: filteredData.filter(d => !d.diemtrungbinh || isNaN(d.diemtrungbinh)).length,
    nullRanks: filteredData.filter(d => !d.danhHieu).length
  };

  console.log('Debug Stats:', debugStats);

  // Màu sắc cho pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Export dữ liệu
  const exportToExcel = () => {
    const exportData = filteredData.map(d => ({
      'Mã HS': d.mahs,
      'Họ tên': d.hoten,
      'Lớp': d.tenlop,
      'Điểm TB': d.diemtrungbinh,
      'Hạnh kiểm': d.hanhkiem,
      'Xếp loại': d.xeploaihocluc,
      'Nhận xét': d.nhanxet,
      'Năm học': d.namhoc,
      'Học kỳ': d.hocky
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BaoCaoHocTap");
    XLSX.writeFile(wb, `bao_cao_hoc_tap_${selectedSemester}.xlsx`);
  };

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={danhHieuChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ danhHieu, soLuong }) => `${danhHieu}: ${soLuong}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="soLuong"
              >
                {danhHieuChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={scoreDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} name="Số học sinh" />
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={scoreDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Số học sinh" />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={scoreDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Số học sinh" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="reports-title">
          <FaChartBar className="title-icon" />
          <h2>Báo cáo kết quả học tập</h2>
        </div>
        <div className="reports-actions">
          <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Bộ lọc
          </button>
          <button className="export-btn" onClick={exportToExcel}>
            <FaDownload /> Xuất Excel
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && selectedSemester && (
        <>
          {/* Cards thống kê */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>{totalStudents}</h3>
                <p>Học sinh học kỳ {selectedSemester}</p>
              </div>
            </div>
            
            <div className="stat-card info">
              <div className="stat-icon">
                <FaGraduationCap />
              </div>
              <div className="stat-content">
                <h3>{uniqueStudents}</h3>
                <p>Tổng số học sinh (tất cả kỳ)</p>
              </div>
            </div>
            
            <div className="stat-card warning">
              <div className="stat-icon">
                <FaTrophy />
              </div>
              <div className="stat-content">
                <h3>{excellentStudents}</h3>
                <p>Học sinh Giỏi (≥8.0)</p>
              </div>
            </div>
            
            <div className="stat-card success">
              <div className="stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>{averageScore}</h3>
                <p>Điểm trung bình</p>
              </div>
            </div>
          </div>

          {/* Bộ lọc */}
          <div className={`filters-panel ${showFilters ? 'show' : ''}`}>
            <div className="filter-group">
              <label>
                Học kỳ:
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="filter-select"
                >
                  {hocKyList.map((hk, idx) => (
                    <option key={idx} value={hk}>
                      {hk}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Loại biểu đồ:
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="filter-select"
                >
                  <option value="bar">Biểu đồ cột</option>
                  <option value="pie">Biểu đồ tròn</option>
                  <option value="line">Biểu đồ đường</option>
                  <option value="area">Biểu đồ vùng</option>
                </select>
              </label>
            </div>
          </div>

          {/* Phổ điểm */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Phổ điểm trung bình</h3>
              <div className="chart-legend">
                <span className="legend-item total">Tổng: {validStudents.length} học sinh</span>
                {invalidScores > 0 && (
                  <span className="legend-item invalid">Invalid: {invalidScores}</span>
                )}
              </div>
            </div>
            {renderChart()}
          </div>

          {/* Danh hiệu học tập */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Phân loại học lực</h3>
              <div className="rank-summary">
                <span className="rank-item excellent">Giỏi: {excellentStudents}</span>
                <span className="rank-item good">Khá: {goodStudents}</span>
                <span className="rank-item average">Trung bình: {averageStudents}</span>
                <span className="rank-item weak">Yếu: {weakStudents}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={danhHieuChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="danhHieu" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="soLuong" fill="#82ca9d" name="Số học sinh" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
