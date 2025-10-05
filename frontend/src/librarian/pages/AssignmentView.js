import React, { useEffect, useState, useCallback } from "react";
import "../styles/AssignmentView.css";

const AssignmentView = () => {
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/assignments?search=${encodeURIComponent(search)}`);
      const result = await res.json();

      if (res.ok) {
        setAssignments(result.data); 
      } else {
        throw new Error(result.message || "Lỗi không xác định");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return (
    <div className="section">
      <h3>Phân công giảng dạy</h3>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm mã GV, lớp, môn, năm học, học kỳ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchAssignments}>Tìm kiếm</button>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}

      {/* Bảng phân công */}
      <table className="schedule-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Giáo viên</th>
            <th>Lớp</th>
            <th>Môn học</th>
            <th>Năm học</th>
            <th>Học kỳ</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length > 0 ? (
            assignments.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.tengv}</td>
                <td>{item.tenlop}</td>
                <td>{item.tenmon}</td>
                <td>{item.namhoc}</td>
                <td>{item.hocky}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Không có dữ liệu.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentView;
