import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaSearch, FaEdit, FaTrash, FaPlus, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import "../styles/Students.css";

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [newStudent, setNewStudent] = useState({
    mahs: "",
    hoten: "",
    gioitinh: "",
    ngaysinh: "",
    diachi: "",
    sdt: "",
    email: "",
    lopid: "",
  });

  const itemsPerPage = 50;

  const fetchStudents = useCallback(async (search = "", page = 1) => {
    setLoading(true);
    try {
      const query = `?search=${encodeURIComponent(search)}&page=${page}&limit=${itemsPerPage}`;
      const res = await fetch(`http://localhost:5000/api/students${query}`);
      if (!res.ok) throw new Error("Lỗi khi gọi API");

      const { data = [], total = 0 } = await res.json();
      setStudents(Array.isArray(data) ? data : []);
      setTotalPages(Math.ceil(total / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.error("Lỗi khi tải học sinh:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents("", 1);
  }, [fetchStudents]);

  const debouncedFetchRef = useRef(
    debounce((value) => fetchStudents(value, 1), 500)
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetchRef.current(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchStudents(searchTerm, newPage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setNewStudent({
      mahs: "",
      hoten: "",
      gioitinh: "",
      ngaysinh: "",
      diachi: "",
      sdt: "",
      email: "",
      lopid: "",
    });
    setIsEditing(false);
  };

  const handleAddStudent = async () => {
    if (!newStudent.mahs || !newStudent.hoten || !newStudent.lopid) {
      return alert("Vui lòng nhập mã học sinh, họ tên và mã lớp");
    }

    try {
      const res = await fetch("http://localhost:5000/api/students/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });

      if (!res.ok) throw new Error("Thêm học sinh thất bại");

      alert("Thêm học sinh thành công!");
      setShowAddForm(false);
      resetForm();
      fetchStudents(searchTerm, 1);
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleUpdateStudent = async () => {
    if (!newStudent.hoten || !newStudent.lopid) {
      return alert("Vui lòng nhập đầy đủ họ tên và mã lớp");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/students/update/${newStudent.mahs}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });

      if (!res.ok) throw new Error("Cập nhật học sinh thất bại");

      alert("Cập nhật học sinh thành công!");
      setShowAddForm(false);
      resetForm();
      fetchStudents(searchTerm, currentPage);
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleEdit = (student) => {
    setNewStudent({
      mahs: student.mahs,
      hoten: student.hoten,
      gioitinh: student.gioitinh,
      ngaysinh: formatDateForInput(student.ngaysinh),
      diachi: student.diachi,
      sdt: student.sdt,
      email: student.email,
      lopid: student.lopid,
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleDelete = async (mahs) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá học sinh này?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/students/delete/${mahs}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Xoá học sinh thất bại");

      alert("Xoá thành công!");
      fetchStudents(searchTerm, currentPage);
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Bỏ qua header row và chuyển đổi dữ liệu
        const studentsData = jsonData.slice(1).map((row) => ({
          mahs: row[0] || "",
          hoten: row[1] || "",
          gioitinh: row[2] || "",
          ngaysinh: row[3] ? formatDateForInput(row[3]) : "",
          diachi: row[4] || "",
          sdt: row[5] || "",
          email: row[6] || "",
          lopid: row[7] || "",
        })).filter(student => student.mahs && student.hoten && student.lopid);

        setImportData(studentsData);
      } catch (error) {
        alert("Lỗi khi đọc file Excel: " + error.message);
        setImportData([]);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImportStudents = async () => {
    if (importData.length === 0) {
      return alert("Không có dữ liệu để import");
    }

    try {
      const res = await fetch("http://localhost:5000/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: importData }),
      });

      if (!res.ok) throw new Error("Import học sinh thất bại");

      const result = await res.json();
      alert(`Import thành công! ${result.imported || importData.length} học sinh đã được thêm.`);
      setShowImportForm(false);
      setImportData([]);
      setImportFileName("");
      fetchStudents(searchTerm, 1);
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ["Mã HS", "Họ và tên", "Giới tính", "Ngày sinh", "Địa chỉ", "SĐT", "Email", "Mã lớp"],
      ["HS001", "Nguyễn Văn A", "Nam", "2005-01-15", "Hà Nội", "0912345678", "nva@email.com", "L10A1"],
      ["HS002", "Trần Thị B", "Nữ", "2005-03-20", "Hà Nội", "0912345679", "ttb@email.com", "L10A1"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_hocsinh.xlsx");
  };

  return (
    <div className="students-page">
      <div className="students-page-header">
        <h2>Quản lý học sinh</h2>
        <div className="students-search-add">
          <div className="students-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo Mã HS, tên, lớp..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="students-add-btn" onClick={() => { setShowAddForm(true); resetForm(); }}>
            <FaPlus /> Thêm học sinh
          </button>
          <button className="students-import-btn" onClick={() => setShowImportForm(true)}>
            <FaFileExcel /> Import Excel
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="overlay">
          <div className="add-student-form-popup">
            <h3>{isEditing ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}</h3>
            <input
              name="mahs"
              placeholder="Mã HS"
              value={newStudent.mahs}
              onChange={handleInputChange}
              disabled={isEditing}
            />
            <input name="hoten" placeholder="Họ tên" value={newStudent.hoten} onChange={handleInputChange} />
            <select name="gioitinh" value={newStudent.gioitinh} onChange={handleInputChange}>
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <input name="ngaysinh" type="date" value={newStudent.ngaysinh} onChange={handleInputChange} />
            <input name="diachi" placeholder="Địa chỉ" value={newStudent.diachi} onChange={handleInputChange} />
            <input name="sdt" placeholder="SĐT" value={newStudent.sdt} onChange={handleInputChange} />
            <input name="email" placeholder="Email" value={newStudent.email} onChange={handleInputChange} />
            <input name="lopid" placeholder="Mã lớp" value={newStudent.lopid} onChange={handleInputChange} />
            <div className="form-buttons">
              <button onClick={isEditing ? handleUpdateStudent : handleAddStudent}>Lưu</button>
              <button onClick={() => { setShowAddForm(false); resetForm(); }}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {showImportForm && (
        <div className="overlay">
          <div className="import-student-form-popup">
            <h3>Import học sinh từ Excel</h3>
            
            <div className="import-instructions">
              <p><strong>Hướng dẫn:</strong></p>
              <ul>
                <li>File Excel phải có các cột theo đúng thứ tự: Mã HS, Họ và tên, Giới tính, Ngày sinh, Địa chỉ, SĐT, Email, Mã lớp</li>
                <li>Ngày sinh định dạng: YYYY-MM-DD (ví dụ: 2005-01-15)</li>
                <li>Giới tính: Nam hoặc Nữ</li>
                <li>Tải template để xem định dạng chuẩn</li>
              </ul>
              <button className="download-template-btn" onClick={downloadTemplate}>
                <FaFileExcel /> Tải template
              </button>
            </div>

            <div className="file-upload-area">
              <input
                type="file"
                id="excel-file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="excel-file" className="file-upload-label">
                {importFileName || 'Chọn file Excel...'}
              </label>
            </div>

            {importData.length > 0 && (
              <div className="import-preview">
                <p><strong>Dữ liệu sẽ được import ({importData.length} học sinh):</strong></p>
                <div className="preview-table-container">
                  <table className="import-preview-table">
                    <thead>
                      <tr>
                        <th>Mã HS</th>
                        <th>Họ tên</th>
                        <th>Giới tính</th>
                        <th>Ngày sinh</th>
                        <th>Lớp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 5).map((student, index) => (
                        <tr key={index}>
                          <td>{student.mahs}</td>
                          <td>{student.hoten}</td>
                          <td>{student.gioitinh}</td>
                          <td>{student.ngaysinh}</td>
                          <td>{student.lopid}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importData.length > 5 && <p>... và {importData.length - 5} học sinh khác</p>}
                </div>
              </div>
            )}

            <div className="form-buttons">
              <button 
                onClick={handleImportStudents} 
                disabled={importData.length === 0}
                className="import-confirm-btn"
              >
                Import ({importData.length} học sinh)
              </button>
              <button 
                onClick={() => {
                  setShowImportForm(false);
                  setImportData([]);
                  setImportFileName("");
                }}
                className="cancel-btn"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div>
          <table className="students-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã HS</th>
                <th>Họ và tên</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Địa chỉ</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>Lớp</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.mahs}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{student.mahs}</td>
                    <td>{student.hoten}</td>
                    <td>{student.gioitinh}</td>
                    <td>{formatDate(student.ngaysinh)}</td>
                    <td>{student.diachi}</td>
                    <td>{student.sdt}</td>
                    <td>{student.email}</td>
                    <td>{student.tenlop}</td>
                    <td>
                      <button className="students-edit-btn" onClick={() => handleEdit(student)}>
                        <FaEdit />
                      </button>
                      <button className="students-delete-btn" onClick={() => handleDelete(student.mahs)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                    Không có học sinh phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="students-pagination">
            <p>Trang {currentPage} / {totalPages}</p>
            <div className="pagination-buttons">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
