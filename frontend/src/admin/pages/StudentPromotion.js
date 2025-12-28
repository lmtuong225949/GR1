import React, { useState, useEffect } from 'react';
import { FaSearch as SearchIcon, FaArrowUp as PromoteIcon, FaRedoAlt as ResetIcon, FaGraduationCap } from 'react-icons/fa';
import '../styles/StudentPromotion.css';

const StudentPromotion = () => {
  const [currentYear, setCurrentYear] = useState('2024-2025');
  const [nextYear, setNextYear] = useState('2025-2026');
  const [currentGrade, setCurrentGrade] = useState('');
  const [currentClass, setCurrentClass] = useState('');
  const [nextGrade, setNextGrade] = useState('');
  const [nextClass, setNextClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dữ liệu lớp học theo cấu trúc THPT
  const gradeClasses = {
    '10': ['10A1', '10A2', '10A3', '10A4', '10A5', '10A6', '10A7', '10A8', '10A9', '10A10'],
    '11': ['11A1', '11A2', '11A3', '11A4', '11A5', '11A6', '11A7', '11A8', '11A9', '11A10'],
    '12': ['12A1', '12A2', '12A3', '12A4', '12A5', '12A6', '12A7', '12A8', '12A9', '12A10']
  };

  // Auto update next year
  useEffect(() => {
    if (currentYear) {
      const currentYearNum = parseInt(currentYear.split('-')[0]);
      const nextYearNum = currentYearNum + 1;
      setNextYear(`${nextYearNum}-${nextYearNum + 1}`);
    }
  }, [currentYear]);

  // Auto update next grade
  useEffect(() => {
    if (currentGrade) {
      const gradeNum = parseInt(currentGrade);
      if (gradeNum < 12) {
        setNextGrade(String(gradeNum + 1));
      } else {
        setNextGrade('graduated');
      }
    } else {
      setNextGrade('');
    }
  }, [currentGrade]);

  // Fetch students
  const fetchStudents = async () => {
    if (!currentClass || !currentYear) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn đầy đủ thông tin lớp và năm học',
        severity: 'warning'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('Fetching students:', { currentClass, currentYear });
      
      const response = await fetch(`http://localhost:5000/api/promotions/students?currentClass=${currentClass}&currentYear=${currentYear}`);
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        const studentData = data.data || data || [];
        console.log('Student data extracted:', studentData);
        console.log('Student data length:', studentData.length);
        
        setStudents(studentData);
        console.log('Students state set, checking...');
        
        // Force re-render check
        setTimeout(() => {
          console.log('Students state after timeout:', students);
        }, 100);
      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(errorData.message || 'Không thể tải danh sách học sinh');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách học sinh',
        severity: 'error'
      });
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Select handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map((s) => s.mahs || s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelect = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId) ? prev.filter(sid => sid !== studentId) : [...prev, studentId]
    );
  };

  // Promote handler
  const handlePromote = async () => {
    if (selectedStudents.length === 0) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn ít nhất một học sinh để chuyển lớp',
        severity: 'warning'
      });
      return;
    }

    if (!nextClass && nextGrade !== 'graduated') {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn lớp mới',
        severity: 'warning'
      });
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn chuyển ${selectedStudents.length} học sinh ${nextGrade === 'graduated' ? 'xuất học' : 'lên lớp'} không?`)) {
      return;
    }

    try {
      setIsLoading(true);
      
      const requestData = {
        studentIds: selectedStudents,
        currentYear,
        nextYear,
        currentClass,
        nextClass: nextGrade === 'graduated' ? null : nextClass
      };
      
      const response = await fetch('http://localhost:5000/api/promotions/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: data.message || `${nextGrade === 'graduated' ? 'Đã xét tốt nghiệp' : 'Đã chuyển lớp'} cho ${selectedStudents.length} học sinh`,
          severity: 'success'
        });
        
        setSelectedStudents([]);
        await fetchStudents();
      } else {
        throw new Error('Không thể xử lý yêu cầu');
      }
    } catch (error) {
      console.error('Error promoting students:', error);
      setSnackbar({
        open: true,
        message: `Lỗi khi xử lý: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search and reset handlers
  const handleSearch = () => {
    setSelectedStudents([]);
    fetchStudents();
  };

  const handleReset = () => {
    setCurrentYear('2024-2025');
    setNextYear('2025-2026');
    setCurrentGrade('');
    setCurrentClass('');
    setNextGrade('');
    setNextClass('');
    setSearchTerm('');
    setSelectedStudents([]);
    setStudents([]);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredStudents = searchTerm ? students.filter(student => 
    (student.hoten && student.hoten.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.mahs && student.mahs.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : students;

  // Debug: Check render data
  console.log('Render debug - students:', students);
  console.log('Render debug - students structure:', students[0]);
  console.log('Render debug - filteredStudents:', filteredStudents);
  console.log('Render debug - students.length:', students.length);

  return (
    <div className="promotion-container">
      <div className="promotion-header">
        <h1>Xử lý lên lớp - THPT</h1>
      </div>

      <div className="promotion-paper">
        <h2 className="promotion-section-title">Thông tin xử lý lên lớp</h2>
        <div className="promotion-divider"></div>

        <div className="form-grid">
          {/* Năm học hiện tại */}
          <div className="form-group">
            <label>Năm học hiện tại</label>
            <input
              type="text"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              className="form-control"
              placeholder="VD: 2024-2025"
            />
          </div>

          {/* Năm học mới */}
          <div className="form-group">
            <label>Năm học mới</label>
            <input
              type="text"
              value={nextYear}
              className="form-control"
              readOnly
              disabled
              placeholder="Tự động cập nhật"
            />
          </div>

          {/* Khối hiện tại */}
          <div className="form-group">
            <label>Khối hiện tại</label>
            <select
              value={currentGrade}
              onChange={(e) => {
                setCurrentGrade(e.target.value);
                setCurrentClass('');
              }}
              className="form-control"
              disabled={isLoading}
            >
              <option value="">Chọn khối</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
          </div>

          {/* Lớp hiện tại */}
          <div className="form-group">
            <label>Lớp hiện tại</label>
            <select
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value)}
              className="form-control"
              disabled={!currentGrade || isLoading}
            >
              <option value="">Chọn lớp</option>
              {currentGrade && gradeClasses[currentGrade]?.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Khối mới */}
          <div className="form-group">
            <label>Khối mới</label>
            <input
              type="text"
              value={nextGrade === 'graduated' ? 'Tốt nghiệp' : (nextGrade ? `Khối ${nextGrade}` : '')}
              className="form-control"
              readOnly
              disabled
              placeholder="Tự động cập nhật"
            />
          </div>

          {/* Lớp mới */}
          <div className="form-group">
            <label>Lớp mới</label>
            {nextGrade === 'graduated' ? (
              <div className="graduation-message">
                <FaGraduationCap className="graduation-icon" />
                <span>Học sinh sẽ được xét tốt nghiệp</span>
              </div>
            ) : (
              <select
                value={nextClass}
                onChange={(e) => setNextClass(e.target.value)}
                className="form-control"
                disabled={!nextGrade || isLoading}
              >
                <option value="">Chọn lớp</option>
                {nextGrade && gradeClasses[nextGrade]?.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="promotion-divider"></div>

        {/* Buttons */}
        <div className="button-group">
          <button
            onClick={handleSearch}
            disabled={isLoading || !currentClass}
            className="btn btn-primary"
          >
            <SearchIcon /> Tìm kiếm
          </button>
          
          <button
            onClick={handlePromote}
            disabled={isLoading || selectedStudents.length === 0}
            className="btn btn-success"
          >
            <PromoteIcon /> {nextGrade === 'graduated' ? 'Xét tốt nghiệp' : 'Chuyển lớp'}
          </button>
          
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            <ResetIcon /> Làm lại
          </button>
        </div>

        {/* Students table */}
        {students.length > 0 && (
          <>
            <div className="promotion-divider"></div>
            
            <div className="table-header">
              <h3>Danh sách học sinh ({filteredStudents.length})</h3>
              <div className="selected-count">
                Đã chọn: {selectedStudents.length} học sinh
              </div>
            </div>

            <div className="table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      />
                    </th>
                    <th>Mã HS</th>
                    <th>Họ tên</th>
                    <th>Lớp hiện tại</th>
                    <th>Lớp mới</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    console.log('Rendering student:', student);
                    return (
                    <tr key={student.mahs || student.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.mahs || student.id)}
                          onChange={() => handleSelect(student.mahs || student.id)}
                        />
                      </td>
                      <td>{student.mahs || student.id}</td>
                      <td>{student.hoten || student.name}</td>
                      <td>{currentClass}</td>
                      <td>{nextGrade === 'graduated' ? 'Tốt nghiệp' : (nextClass || '-')}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* No students message */}
        {!isLoading && students.length === 0 && currentClass && (
          <div className="no-students-container">
            <div className="no-students-message">
              <p>Không có học sinh nào trong lớp {currentClass}</p>
              <p>Vui lòng kiểm tra lại thông tin lớp hoặc thử lớp khác</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang xử lý...</p>
          </div>
        )}
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`snackbar ${snackbar.severity}`}>
          {snackbar.message}
          <button onClick={handleCloseSnackbar} className="snackbar-close">×</button>
        </div>
      )}
    </div>
  );
};

export default StudentPromotion;
