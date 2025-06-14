import React, { useEffect, useState } from "react";
import "../styles/Teachers.css";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from "react-icons/fa";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [originalTeachers, setOriginalTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ magv: "", hoten: "", chuyennganh: "" });
  const [addFormError, setAddFormError] = useState("");

  const [editTeacher, setEditTeacher] = useState(null);
  const [editFormError, setEditFormError] = useState("");
  const [editTeacherData, setEditTeacherData] = useState({
    magv: "",
    hoten: "",
    chuyennganh: "",
    sdt: "",
    email: "",
    ngaysinh: ""
  });

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value) {
      const filtered = originalTeachers.filter(t =>
        t.magv?.toLowerCase().includes(value) ||
        t.hoten?.toLowerCase().includes(value) ||
        t.chuyennganh?.toLowerCase().includes(value)
      );
      setTeachers(filtered);
    } else {
      setTeachers(originalTeachers);
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/teachers");
      if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
      const data = await res.json();
      setTeachers(data);
      setOriginalTeachers(data);
    } catch (err) {
      setError("Không thể tải dữ liệu giáo viên.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.magv || !newTeacher.hoten || !newTeacher.chuyennganh) {
      setAddFormError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/teachers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher),
      });
      if (!res.ok) throw new Error();
      setNewTeacher({ magv: "", hoten: "", chuyennganh: "" });
      setShowAddForm(false);
      fetchTeachers();
    } catch {
      setAddFormError("Lỗi khi thêm giáo viên");
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditTeacher(teacher);
    setEditTeacherData({
      magv: teacher.magv,
      hoten: teacher.hoten,
      chuyennganh: teacher.chuyennganh,
      sdt: teacher.sdt || "",
      email: teacher.email || "",
      ngaysinh: teacher.ngaysinh || ""
    });
    setEditFormError("");
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    const { magv, hoten, chuyennganh, sdt, email, ngaysinh } = editTeacherData;

    if (!hoten || !chuyennganh) {
      setEditFormError("Vui lòng nhập tên và chuyên ngành");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/teachers/update/${magv}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hoten, chuyennganh, sdt, email, ngaysinh })
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      setEditTeacher(null);
      fetchTeachers();
    } catch (err) {
      setEditFormError("Lỗi khi cập nhật giáo viên");
    }
  };

  const handleDeleteTeacher = async (magv) => {
    if (!magv || !window.confirm("Bạn có chắc muốn xoá giáo viên này?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/teachers/delete/${magv}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      fetchTeachers();
    } catch {
      alert("Lỗi khi xoá giáo viên");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="teachers-page">
      {error && <div className="error-message"><p>{error}</p></div>}

      <div className="teachers-page-header">
        <h2>Quản lý giáo viên</h2>
        <div className="teachers-search-add">
          <div className="teachers-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã GV, tên hoặc môn học..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="teachers-add-btn" onClick={() => setShowAddForm(true)}>
            <FaPlus /> Thêm giáo viên
          </button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="teachers-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã GV</th>
              <th>Họ và tên</th>
              <th>Môn học</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center" }}>Không có giáo viên</td></tr>
            ) : (
              teachers.map((t, i) => (
                <tr key={t.magv}>
                  <td>{i + 1}</td>
                  <td>{t.magv}</td>
                  <td>{t.hoten}</td>
                  <td>{t.chuyennganh}</td>
                  <td>
                    <button onClick={() => handleEditTeacher(t)} className="teachers-edit-btn" title="Sửa">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteTeacher(t.magv)} className="teachers-delete-btn" title="Xoá">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Form Thêm */}
      {showAddForm && (
        <div className="overlay">
          <div className="add-teacher-form-popup">
            <div className="form-header">
              <h3>Thêm giáo viên mới</h3>
              <button className="close-btn" onClick={() => {
                setShowAddForm(false);
                setNewTeacher({ magv: "", hoten: "", chuyennganh: "" });
                setAddFormError("");
              }}>
                <FaTimes />
              </button>
            </div>
            {addFormError && <div className="error-message"><p>{addFormError}</p></div>}
            <div className="form-fields">
              <input type="text" placeholder="Mã GV" value={newTeacher.magv}
                onChange={(e) => setNewTeacher({ ...newTeacher, magv: e.target.value })} />
              <input type="text" placeholder="Họ tên" value={newTeacher.hoten}
                onChange={(e) => setNewTeacher({ ...newTeacher, hoten: e.target.value })} />
              <input type="text" placeholder="Môn học" value={newTeacher.chuyennganh}
                onChange={(e) => setNewTeacher({ ...newTeacher, chuyennganh: e.target.value })} />
            </div>
            <div className="form-buttons">
              <button className="save-btn" onClick={handleAddTeacher}>Lưu</button>
              <button className="cancel-btn" onClick={() => setShowAddForm(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Chỉnh sửa */}
      {editTeacher && (
        <div className="overlay">
          <div className="add-teacher-form-popup">
            <div className="form-header">
              <h3>Chỉnh sửa giáo viên</h3>
              <button className="close-btn" onClick={() => {
                setEditTeacher(null);
                setEditFormError("");
              }}>
                <FaTimes />
              </button>
            </div>
            {editFormError && <div className="error-message"><p>{editFormError}</p></div>}
            <form onSubmit={handleUpdateTeacher}>
              <div className="form-fields">
                <input type="text" placeholder="Mã GV" value={editTeacherData.magv} disabled />
                <input type="text" placeholder="Họ tên" value={editTeacherData.hoten}
                  onChange={(e) => setEditTeacherData({ ...editTeacherData, hoten: e.target.value })} />
                <input type="text" placeholder="Môn học" value={editTeacherData.chuyennganh}
                  onChange={(e) => setEditTeacherData({ ...editTeacherData, chuyennganh: e.target.value })} />
                <input type="text" placeholder="SĐT" value={editTeacherData.sdt}
                  onChange={(e) => setEditTeacherData({ ...editTeacherData, sdt: e.target.value })} />
                <input type="email" placeholder="Email" value={editTeacherData.email}
                  onChange={(e) => setEditTeacherData({ ...editTeacherData, email: e.target.value })} />
                <input type="date" placeholder="Ngày sinh" value={editTeacherData.ngaysinh}
                  onChange={(e) => setEditTeacherData({ ...editTeacherData, ngaysinh: e.target.value })} />
              </div>
              <div className="form-buttons">
                <button className="save-btn" type="submit">Lưu</button>
                <button className="cancel-btn" type="button" onClick={() => setEditTeacher(null)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
