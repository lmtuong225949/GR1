import React, { useEffect, useState } from "react";
import "../styles/Scores.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Scores = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchClass, setSearchClass] = useState("");

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/scores");
        console.log("Dữ liệu kết quả học tập:", response.data);
        if (Array.isArray(response.data)) {
          setScores(response.data);
          setFilteredScores(response.data);
        } else {
          setScores([]);
          setFilteredScores([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setScores([]);
        setFilteredScores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  useEffect(() => {
    const lowerSearchName = searchName.toLowerCase();
    const lowerSearchClass = searchClass.toLowerCase();

    const filtered = scores.filter((s) => {
      const matchesName = s.name.toLowerCase().includes(lowerSearchName);
      const matchesClass = s.class.toLowerCase().includes(lowerSearchClass);
      return matchesName && matchesClass;
    });

    setFilteredScores(filtered);
  }, [searchName, searchClass, scores]);

  if (!filteredScores.length) {
    return (
      <div className="scores-page">
        <h2>Quản lý kết quả học tập</h2>
        <div className="scores-search">
          <input
            type="text"
            placeholder="Tìm theo tên học sinh"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tìm theo lớp"
            value={searchClass}
            onChange={(e) => setSearchClass(e.target.value)}
          />
        </div>
        {loading ? <p>Đang tải dữ liệu...</p> : <p>Không có dữ liệu để hiển thị.</p>}
      </div>
    );
  }

  return (
    <div className="scores-page">
      <h2>Quản lý kết quả học tập</h2>

      <div className="scores-search">
        <input
          type="text"
          placeholder="Tìm theo tên học sinh"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tìm theo lớp"
          value={searchClass}
          onChange={(e) => setSearchClass(e.target.value)}
        />
      </div>

      <table className="scores-table">
        <thead>
          <tr>
            <th>Mã HS</th>
            <th>Họ và tên</th>
            <th>Lớp</th>
            <th>Học kỳ</th>
            <th>Năm học</th>
            <th>Điểm TB</th>
            <th>Hạnh kiểm</th>
            <th>Xếp loại</th>
            <th>Nhận xét</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {filteredScores.map((s) => (
            <tr key={s.id}>
              <td>{s.mahs}</td>
              <td>{s.name}</td>
              <td>{s.class}</td>
              <td>{s.hocky}</td>
              <td>{s.namhoc}</td>
              <td>{isFinite(Number(s.diemtrungbinh)) ? Number(s.diemtrungbinh).toFixed(2) : "-"}</td>
              <td>{s.hanhkiem}</td>
              <td>{s.xeploaihocluc}</td>
              <td>{s.nhanxet}</td>
              <td>
                <button 
                  className="scores-detail-btn"
                  onClick={() =>
                    navigate(`/admin/scores/${s.mahs}`, {
                      state: {
                        mahs: s.mahs,
                        hocky: s.hocky,
                        namhoc: s.namhoc,
                      },
                    })
                  }
                >
                  Xem
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Scores;