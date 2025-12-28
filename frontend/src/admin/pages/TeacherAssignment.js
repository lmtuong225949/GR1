 import React, { useState, useEffect } from "react";
import "../styles/TeacherAssignment.css";

const TeacherAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [showEditModal, setShowEditModal] = useState(false); // Used for edit modal
  // eslint-disable-next-line no-unused-vars
  const [showAddModal, setShowAddModal] = useState(false); // Used for add modal
  // eslint-disable-next-line no-unused-vars
  const [editingAssignment, setEditingAssignment] = useState(null); // Used for edit modal
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false); // Used for auto-assign modal
  const [selectedAutoAssignYear, setSelectedAutoAssignYear] = useState('');
  const [selectedAutoAssignSemester, setSelectedAutoAssignSemester] = useState('');
  const token = localStorage.getItem("token");

  const semesters = [
    { value: 'HK1', label: 'Học kỳ 1' },
    { value: 'HK2', label: 'Học kỳ 2' }
  ];

  useEffect(() => {
    if (!token) return;
    
    const fetchAllData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch assignments
        console.log('Fetching all assignments with token:', token);
        const assignmentsRes = await fetch(`http://localhost:5000/api/assignments`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }).catch(err => {
          console.error('Network error fetching assignments:', err);
          setError('Không thể kết nối đến server. Vui lòng kiểm tra lại backend.');
          throw err;
        });
        
        // Fetch classes, subjects, teachers, and academic years
        const [classesRes, subjectsRes, teachersRes, academicYearsRes] = await Promise.all([
          fetch('http://localhost:5000/api/classes', {
            headers: { "Authorization": `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch('http://localhost:5000/api/assignments/subjects', {
            headers: { "Authorization": `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch('http://localhost:5000/api/teachers', {
            headers: { "Authorization": `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch('http://localhost:5000/api/assignments/academic-years', {
            headers: { "Authorization": `Bearer ${token}` }
          }).catch(() => ({ ok: false }))
        ]);

        // Handle assignments
        if (assignmentsRes.ok) {
          const result = await assignmentsRes.json();
          const assignmentsData = result.data || [];
          setAssignments(assignmentsData);
          console.log('Set assignments:', assignmentsData);
        } else {
          setAssignments([]);
        }

        // Handle classes
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData.data || classesData || []);
        } else {
          setClasses([]);
        }

        // Handle subjects
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          setSubjects(subjectsData.data || subjectsData || []);
        } else {
          // Fallback subjects data - matching database monhoc table
          setSubjects([
            { id: 1, tenmon: 'Toán' },
            { id: 2, tenmon: 'Ngữ Văn' },
            { id: 3, tenmon: 'Tiếng Anh' },
            { id: 4, tenmon: 'Vật Lý' },
            { id: 5, tenmon: 'Hóa Học' },
            { id: 6, tenmon: 'Sinh Học' },
            { id: 7, tenmon: 'Lịch Sử' },
            { id: 8, tenmon: 'Địa Lý' },
            { id: 9, tenmon: 'Giáo dục Công Dân' },
            { id: 10, tenmon: 'Tin Học' },
            { id: 11, tenmon: 'Công Nghệ' },
            { id: 12, tenmon: 'Thể Dục' },
            { id: 13, tenmon: 'Âm Nhạc' }
          ]);
        }

        // Handle teachers
        if (teachersRes.ok) {
          const teachersData = await teachersRes.json();
          setTeachers(teachersData.data || teachersData || []);
        } else {
          setTeachers([]);
        }
        
        // Handle academic years
        if (academicYearsRes.ok) {
          const academicYearsData = await academicYearsRes.json();
          setAcademicYears(academicYearsData.data || academicYearsData || []);
        } else {
          setAcademicYears([]);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setAssignments([]);
        setClasses([]);
        // Fallback subjects data - matching database monhoc table
        setSubjects([
          { id: 1, tenmon: 'Toán' },
          { id: 2, tenmon: 'Ngữ Văn' },
          { id: 3, tenmon: 'Tiếng Anh' },
          { id: 4, tenmon: 'Vật Lý' },
          { id: 5, tenmon: 'Hóa Học' },
          { id: 6, tenmon: 'Sinh Học' },
          { id: 7, tenmon: 'Lịch Sử' },
          { id: 8, tenmon: 'Địa Lý' },
          { id: 9, tenmon: 'Giáo dục Công Dân' },
          { id: 10, tenmon: 'Tin Học' },
          { id: 11, tenmon: 'Công Nghệ' },
          { id: 12, tenmon: 'Thể Dục' },
          { id: 13, tenmon: 'Âm Nhạc' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  // Helper function to get semester label
  const getSemesterLabel = (semesterValue) => {
    if (!semesterValue || semesterValue === 'Chưa phân công') return semesterValue;
    const semester = semesters.find(s => s.value === semesterValue);
    return semester ? semester.label : semesterValue;
  };

  // CRUD Functions
  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phân công này?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/assignments/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const result = await res.json();
        console.log('Delete result:', result);
        // Refetch assignments
        fetchAllData();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Lỗi khi xóa phân công");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAutoAssign = () => {
    // Reset selections
    setSelectedAutoAssignYear('');
    setSelectedAutoAssignSemester('');
    // Show modal
    setShowAutoAssignModal(true);
  };

  // Lọc chỉ năm học đang diễn ra (trạng thái = true)
  const currentAcademicYears = academicYears.filter(year => year.trangthai === true);

  const executeAutoAssign = async () => {
    if (!selectedAutoAssignYear) {
      setError('Vui lòng chọn năm học để phân công');
      return;
    }

    if (!window.confirm(`Tự động phân công sẽ xóa tất cả phân công hiện tại của năm học đã chọn và tạo mới bằng thuật toán Hungarian. Bạn có chắc chắn?`)) return;

    try {
      const res = await fetch('http://localhost:5000/api/assignments/auto-assign', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ namhoc_id: selectedAutoAssignYear })
      });

      if (res.ok) {
        const result = await res.json();
        console.log('Auto assign result:', result);
        setShowAutoAssignModal(false);
        // Refetch assignments
        fetchAllData();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Lỗi khi tự động phân công");
      }
    } catch (err) {
      setError(err.message);
    }
  };

const fetchAllData = async () => {
  setLoading(true);
  setError("");
  
  try {
    // Fetch assignments, classes, teachers, subjects, and academic years
    const [assignmentsRes, classesRes, teachersRes, subjectsRes, academicYearsRes] = await Promise.all([
      fetch(`http://localhost:5000/api/assignments`, {
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(err => {
        console.error('Network error in fetchAllData:', err);
        setError('Không thể kết nối đến server. Vui lòng kiểm tra lại backend.');
        return { ok: false };
      }),
      fetch('http://localhost:5000/api/classes', {
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(() => ({ ok: false })),
      fetch('http://localhost:5000/api/teachers', {
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(() => ({ ok: false })),
      fetch('http://localhost:5000/api/assignments/subjects', {
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(() => ({ ok: false })),
      fetch('http://localhost:5000/api/assignments/academic-years', {
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(() => ({ ok: false }))
    ]);
    
    // Handle assignments
    if (assignmentsRes.ok) {
      const result = await assignmentsRes.json();
      setAssignments(result.data || []);
    } else {
      setAssignments([]);
    }
    
    // Handle classes
    if (classesRes.ok) {
      const classesData = await classesRes.json();
      setClasses(classesData.data || classesData || []);
    } else {
      setClasses([]);
    }
    
    // Handle teachers
    if (teachersRes.ok) {
      const teachersData = await teachersRes.json();
      setTeachers(teachersData.data || teachersData || []);
    } else {
      setTeachers([]);
    }
    
    // Handle subjects
    if (subjectsRes.ok) {
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData.data || subjectsData || []);
    } else {
      setSubjects([
        { id: 1, tenmon: 'Toán' },
        { id: 2, tenmon: 'Ngữ Văn' },
        { id: 3, tenmon: 'Tiếng Anh' },
        { id: 4, tenmon: 'Vật Lý' },
        { id: 5, tenmon: 'Hóa Học' },
        { id: 6, tenmon: 'Sinh Học' },
        { id: 7, tenmon: 'Lịch Sử' },
        { id: 8, tenmon: 'Địa Lý' },
        { id: 9, tenmon: 'Giáo dục Công Dân' },
        { id: 10, tenmon: 'Tin Học' },
        { id: 11, tenmon: 'Công Nghệ' },
        { id: 12, tenmon: 'Thể Dục' },
        { id: 13, tenmon: 'Âm Nhạc' }
      ]);
    }
    
    // Handle academic years
    if (academicYearsRes.ok) {
      const academicYearsData = await academicYearsRes.json();
      setAcademicYears(academicYearsData.data || academicYearsData || []);
    } else {
      setAcademicYears([]);
    }
    
  } catch (err) {
    console.error('Error in fetchAllData:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Modal Functions
  const handleAddAssignment = async (assignmentData) => {
    try {
      const res = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(assignmentData)
      });

      if (res.ok) {
        const result = await res.json();
        console.log('Add result:', result);
        setShowAddModal(false);
        fetchAllData();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Lỗi khi thêm phân công");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateAssignment = async (assignmentData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/assignments/${assignmentData.id}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(assignmentData)
      });

      if (res.ok) {
        const result = await res.json();
        console.log('Update result:', result);
        setShowEditModal(false);
        setEditingAssignment(null);
        fetchAllData();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Lỗi khi cập nhật phân công");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const classMatch = selectedClass ? assignment.lopid === selectedClass : true;
    const subjectMatch = selectedSubject ? assignment.monid === selectedSubject || assignment.monid?.toString() === selectedSubject?.toString() : true;
    const semesterMatch = selectedSemester ? assignment.kyhoc === selectedSemester : true;
    const yearMatch = selectedYear ? assignment.namhoc_id === parseInt(selectedYear) : true;
    return classMatch && subjectMatch && semesterMatch && yearMatch;
  });

  return (
    <div className="ta-container">
      <div className="ta-header">
        <h2>Quản lý phân công giảng dạy</h2>
        <div className="ta-header-actions">
          <button
            onClick={() => setShowAddModal(true)}
            className="ta-btn ta-btn-primary"
          >
          Thêm phân công
          </button>
          <button
            onClick={handleAutoAssign}
            className="ta-btn ta-btn-secondary"
          >
           Tự động phân công (Hungarian)
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="ta-filter-section">
        <div className="ta-form-row">
          <div className="ta-form-group">
            <label>Lọc theo lớp:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="ta-form-control"
            >
              <option value="">Tất cả lớp</option>
              {classes.map(cls => (
                <option key={cls.malop} value={cls.malop}>{cls.tenlop}</option>
              ))}
            </select>
          </div>
          <div className="ta-form-group">
            <label>Lọc theo môn:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="ta-form-control"
            >
              <option value="">Tất cả môn</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.tenmon}</option>
              ))}
            </select>
          </div>
          <div className="ta-form-group">
            <label>Lọc theo năm học:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="ta-form-control"
            >
              <option value="">Tất cả năm học</option>
              {currentAcademicYears.map(year => (
                <option key={year.id} value={year.id}>{year.namhoc} - {year.kyhoc}</option>
              ))}
            </select>
          </div>
          <div className="ta-form-group">
            <label>Lọc theo học kỳ:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="ta-form-control"
            >
              <option value="">Tất cả học kỳ</option>
              {semesters.map(sem => (
                <option key={sem.value} value={sem.value}>{sem.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
          Hiển thị {filteredAssignments.length} / {assignments.length} phân công
        </div>
      </div>

      {loading && (
        <div className="ta-loading">
          <div className="ta-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}
      
      {error && (
        <div className="ta-error-message">
          <span>Lỗi: {error}</span>
        </div>
      )}

      {/* Assignments Table */}
      <div className="ta-table-section">
        <h3>Danh sách phân công giảng dạy</h3>
        <div className="ta-table-responsive">
          <table className="ta-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Lớp</th>
                <th>Môn học</th>
                <th>Giáo viên</th>
                <th>Năm học</th>
                <th>Học kỳ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.tenlop}</td>
                    <td>{item.tenmon}</td>
                    <td>{item.tengv}</td>
                    <td>{item.namhoc || 'Chưa phân công'}</td>
                    <td>{getSemesterLabel(item.kyhoc)}</td>
                    <td>
                      <div className="ta-actions">
                        <button
                          onClick={() => handleEdit(item)}
                          className="ta-btn ta-btn-small"
                          style={{ backgroundColor: '#ffc107', color: '#212529' }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="ta-btn ta-btn-small ta-btn-danger"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div className="ta-no-data">
                      <p>
                        {loading ? "Đang tải..." : 
                         (selectedClass || selectedSubject || selectedYear || selectedSemester) ? 
                         "Không có phân công nào phù hợp với bộ lọc." : 
                         "Không có phân công nào."}
                      </p>
                      {!loading && (
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="ta-btn ta-btn-primary"
                        >
                          ➕ Thêm phân công đầu tiên
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="ta-modal-overlay">
          <div className="ta-modal">
            <h3>Thêm phân công giảng dạy</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddAssignment({
                giaovienid: formData.get('giaovienid'),
                lopid: formData.get('lopid'),
                monid: formData.get('monid'),
                namhoc_id: formData.get('namhoc_id') || null
              });
            }}>
              <div className="ta-form-group">
                <label>Giáo viên:</label>
                <select name="giaovienid" required className="ta-form-control">
                  <option value="">Chọn giáo viên</option>
                  {teachers.map(teacher => (
                    <option key={teacher.magv} value={teacher.magv}>{teacher.hoten}</option>
                  ))}
                </select>
              </div>
              <div className="ta-form-group">
                <label>Lớp:</label>
                <select name="lopid" required className="ta-form-control">
                  <option value="">Chọn lớp</option>
                  {classes.map(cls => (
                    <option key={cls.malop} value={cls.malop}>{cls.tenlop}</option>
                  ))}
                </select>
              </div>
              <div className="ta-form-group">
                <label>Môn học:</label>
                <select name="monid" required className="ta-form-control">
                  <option value="">Chọn môn học</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.tenmon}</option>
                  ))}
                </select>
              </div>
              <div className="ta-form-group">
                <label>Năm học (tùy chọn):</label>
                <select name="namhoc_id" className="ta-form-control">
                  <option value="">Chưa phân công</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.namhoc} - {year.kyhoc}</option>
                  ))}
                </select>
              </div>
              <div className="ta-modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="ta-btn ta-btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="ta-btn ta-btn-primary">
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {showEditModal && editingAssignment && (
        <div className="ta-modal-overlay">
          <div className="ta-modal">
            <h3>Sửa phân công giảng dạy</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateAssignment({
                id: editingAssignment.id,
                giaovienid: formData.get('giaovienid'),
                lopid: formData.get('lopid'),
                monid: formData.get('monid'),
                namhoc_id: formData.get('namhoc_id') || null
              });
            }}>
              <div className="ta-form-group">
                <label>Giáo viên:</label>
                <select name="giaovienid" required className="ta-form-control" defaultValue={editingAssignment.giaovienid}>
                  <option value="">Chọn giáo viên</option>
                  {teachers.map(teacher => (
                    <option key={teacher.magv} value={teacher.magv}>{teacher.hoten}</option>
                  ))}
                </select>
              </div>
              <div className="ta-form-group">
                <label>Lớp:</label>
                <select name="lopid" required className="ta-form-control" defaultValue={editingAssignment.lopid}>
                  <option value="">Chọn lớp</option>
                  {classes.map(cls => (
                    <option key={cls.malop} value={cls.malop}>{cls.tenlop}</option>
                  ))}
                </select>
              </div>
              <div className="ta-form-group">
                <label>Môn học:</label>
                <select name="monid" required className="ta-form-control" defaultValue={editingAssignment.monid}>
                  <option value="">Chọn môn học</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.tenmon}</option>
                  ))}
                </select>
              </div>
              <div className="ta-form-group">
                <label>Năm học (tùy chọn):</label>
                <select name="namhoc_id" className="ta-form-control" defaultValue={editingAssignment.namhoc_id}>
                  <option value="">Chưa phân công</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.namhoc} - {year.kyhoc}</option>
                  ))}
                </select>
              </div>
              <div className="ta-modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="ta-btn ta-btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="ta-btn ta-btn-primary">
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto Assign Modal */}
      {showAutoAssignModal && (
        <div className="ta-modal-overlay">
          <div className="ta-modal">
            <h3>Tự động phân công giảng dạy</h3>
            <div className="ta-form-group">
              <label>Năm học:</label>
              <select 
                value={selectedAutoAssignYear} 
                onChange={(e) => setSelectedAutoAssignYear(e.target.value)}
                required 
                className="ta-form-control"
              >
                <option value="">Chọn năm học</option>
                {currentAcademicYears.map(year => (
                  <option key={year.id} value={year.id}>{year.namhoc} - {year.kyhoc}</option>
                ))}
              </select>
            </div>
            <div className="ta-form-group">
              <label>Học kỳ:</label>
              <select 
                value={selectedAutoAssignSemester} 
                onChange={(e) => setSelectedAutoAssignSemester(e.target.value)}
                className="ta-form-control"
              >
                <option value="">Tất cả học kỳ</option>
                {semesters.map(sem => (
                  <option key={sem.value} value={sem.value}>{sem.label}</option>
                ))}
              </select>
            </div>
            <div className="ta-modal-info">
              <p><strong>Lưu ý:</strong> Tự động phân công sẽ:</p>
              <ul>
                <li>Lưu phân công hiện tại vào lịch sử</li>
                <li>Xóa tất cả phân công của năm học đã chọn</li>
                <li>Tạo phân công mới bằng thuật toán Hungarian</li>
                <li>Chỉ phân công giáo viên đúng chuyên ngành</li>
              </ul>
            </div>
            <div className="ta-modal-actions">
              <button type="button" onClick={() => setShowAutoAssignModal(false)} className="ta-btn ta-btn-secondary">
                Hủy
              </button>
              <button type="button" onClick={executeAutoAssign} className="ta-btn ta-btn-primary">
                Bắt đầu phân công
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignment;