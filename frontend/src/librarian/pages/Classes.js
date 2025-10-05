import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Classes.css";

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const Classes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    malop: "",
    tenlop: "",
    magiaovien: "",
    ghichu: "",
    toanha: ""
  });

  const navigate = useNavigate();

  const fetchClasses = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/classes`);
      const data = await res.json();
      setClasses(
        search
          ? data.filter(
              (cls) =>
                cls.tenlop.toLowerCase().includes(search.toLowerCase()) ||
                (cls.tengiaovien &&
                  cls.tengiaovien.toLowerCase().includes(search.toLowerCase()))
            )
          : data
      );
    } catch (error) {
      console.error("Lỗi khi tải lớp học:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const debouncedFetchRef = useRef(
    debounce((value) => fetchClasses(value), 500)
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetchRef.current(value);
  };

  const handleViewStudents = (malop, tenlop) => {
    navigate(`/admin/classes/${malop}`, { state: { tenlop } });
  };

  const handleAddClass = () => {
    setFormData({
      malop: "",
      tenlop: "",
      magiaovien: "",
      ghichu: "",
      toanha: ""
    });
    setIsEditMode(false);
    setShowForm(true);
  };

  const handleEditClass = (cls) => {
    setFormData({
      malop: cls.malop,
      tenlop: cls.tenlop,
      magiaovien: cls.magiaovien || "",
      ghichu: cls.ghichu || "",
      toanha: cls.toanha || ""
    });
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleDeleteClass = async (malop) => {
    if (!window.confirm("Bạn có chắc muốn xoá lớp học này không?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/classes/delete/${malop}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xoá thất bại");
      fetchClasses();
    } catch (err) {
      alert("Lỗi khi xoá lớp học: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { malop, tenlop, magiaovien, ghichu, toanha } = formData;

    if (!tenlop || (!isEditMode && !malop)) {
      alert("Vui lòng nhập đầy đủ mã lớp và tên lớp");
      return;
    }

    try {
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode
        ? `http://localhost:5000/api/classes/update/${malop}`
        : "http://localhost:5000/api/classes/add";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          malop: isEditMode ? malop : malop.trim(),
          tenlop: tenlop.trim(),
          magiaovien: magiaovien.trim(),
          ghichu: ghichu.trim(),
          toanha: toanha.trim()
        })
      });

      if (!res.ok) throw new Error("Lưu thất bại");
      setShowForm(false);
      fetchClasses();
    } catch (err) {
      alert("Lỗi khi lưu lớp học: " + err.message);
    }
  };

  return (
    <div className="classes-page">
      <div className="classes-page-header">
        <h2>Quản lý lớp học</h2>
        <div className="classes-search-add">
          <div className="classes-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên lớp hoặc giáo viên..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="classes-add-btn" onClick={handleAddClass}>
            <FaPlus /> Thêm lớp học
          </button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải danh sách lớp...</p>
      ) : (
        <table className="classes-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên lớp</th>
              <th>Giáo viên chủ nhiệm</th>
              <th>Số học sinh</th>
              <th>Tòa nhà</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {classes.length > 0 ? (
              classes.map((cls, index) => (
                <tr key={cls.malop}>
                  <td>{index + 1}</td>
                  <td>{cls.tenlop}</td>
                  <td>{cls.tengiaovien || "Chưa có"}</td>
                  <td>{cls.sohocsinh || 0}</td>
                  <td>{cls.toanha || "Không rõ"}</td>
                  <td>{cls.ghichu || "Không có"}</td>
                  <td>
                    <button onClick={() => handleViewStudents(cls.malop, cls.tenlop)}>Xem thêm</button>
                    <button onClick={() => handleEditClass(cls)}>Sửa</button>
                    <button onClick={() => handleDeleteClass(cls.malop)}>Xoá</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: "center" }}>Không có lớp học</td></tr>
            )}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="overlay">
          <div className="add-teacher-form-popup">
            <div className="form-header">
              <h3>{isEditMode ? "Chỉnh sửa lớp học" : "Thêm lớp học"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                {!isEditMode && (
                  <input
                    type="text"
                    placeholder="Mã lớp"
                    value={formData.malop}
                    onChange={(e) => setFormData({ ...formData, malop: e.target.value })}
                    required
                  />
                )}
                <input
                  type="text"
                  placeholder="Tên lớp"
                  value={formData.tenlop}
                  onChange={(e) => setFormData({ ...formData, tenlop: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Mã giáo viên chủ nhiệm"
                  value={formData.magiaovien}
                  onChange={(e) => setFormData({ ...formData, magiaovien: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Tòa nhà"
                  value={formData.toanha}
                  onChange={(e) => setFormData({ ...formData, toanha: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Ghi chú"
                  value={formData.ghichu}
                  onChange={(e) => setFormData({ ...formData, ghichu: e.target.value })}
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="save-btn">Lưu</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
