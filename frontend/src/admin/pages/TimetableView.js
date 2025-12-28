import React, { useState, useEffect, useCallback } from "react";
import "../styles/TimetableView.css";

const weekdayMap = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
};

const TimetableView = ({ selectedYear: propSelectedYear, selectedSemester: propSelectedSemester }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internalYear, setInternalYear] = useState('');
  const [internalSemester, setInternalSemester] = useState('');

  // Use props if provided, otherwise use internal state
  const selectedYear = propSelectedYear || internalYear;
  const selectedSemester = propSelectedSemester || internalSemester;

  const semesters = [
    { value: 'HK1', label: 'Học kỳ 1' },
    { value: 'HK2', label: 'Học kỳ 2' }
  ];

  const fetchScheduleData = useCallback(async () => {
    if (!selectedYear) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:5000/api/schedules/all?namhoc_id=${selectedYear}`;
      
      if (selectedSemester) {
        url += `&kyhoc=${selectedSemester}`;
      }
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Không thể tải dữ liệu thời khóa biểu');
      }
      
      setScheduleData(data.data || []);
      
      // Lấy danh sách lớp duy nhất và sắp xếp
      const uniqueClasses = [...new Set(data.data.map(item => item.tenlop))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
        
      setClassList(uniqueClasses);
      
      if (uniqueClasses.length > 0 && !selectedClass) {
        setSelectedClass(uniqueClasses[0]);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      setScheduleData([]);
      setClassList([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedSemester, selectedClass]);

  const fetchAcademicYears = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/assignments/academic-years', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const years = data.data || data || [];
        
        // Auto-select current academic year (trangthai = true)
        const currentYear = years.find(year => year.trangthai === true);
        if (currentYear) {
          setInternalYear(currentYear.id);
        }
      }
    } catch (err) {
      console.error('Error fetching academic years:', err);
    }
  };

  useEffect(() => {
    // Only fetch academic years if not provided by parent
    if (!propSelectedYear) {
      fetchAcademicYears();
    }
  }, [propSelectedYear]);

  useEffect(() => {
    if (selectedYear) {
      fetchScheduleData();
    }
  }, [selectedYear, selectedSemester, fetchScheduleData]);

  const periods = [1, 2, 3, 4, 5];

  // Lọc TKB theo lớp được chọn
  const filteredData = scheduleData.filter(
    (item) => item.tenlop === selectedClass
  );

  if (isLoading) {
    return (
      <div className="schedule-container loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu thời khóa biểu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-container error">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (classList.length === 0) {
    return (
      <div className="schedule-container empty">
        <p>Không có dữ liệu thời khóa biểu nào được tìm thấy.</p>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      {/* Only show filters if not provided by parent component */}
      {!propSelectedYear && (
        <>
          <h2>Thời khóa biểu</h2>
          <div className="schedule-filters">
            <div className="filter-group">
              <label htmlFor="year-select">Năm học:</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setInternalYear(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Chọn năm học</option>
                {/* Academic years will be fetched when needed */}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="semester-select">Học kỳ:</label>
              <select
                id="semester-select"
                value={selectedSemester}
                onChange={(e) => setInternalSemester(e.target.value)}
                disabled={isLoading || !selectedYear}
              >
                <option value="">Cả năm học</option>
                {semesters.map(sem => (
                  <option key={sem.value} value={sem.value}>
                    {sem.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="class-select">Lớp:</label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={isLoading || classList.length === 0}
              >
                {classList.map((lop, idx) => (
                  <option key={`${lop}-${idx}`} value={lop}>
                    {lop}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Class filter when props are provided */}
      {propSelectedYear && (
        <div className="schedule-filters">
          <div className="filter-group">
            <label htmlFor="class-select">Lớp:</label>
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isLoading || classList.length === 0}
            >
              {classList.map((lop, idx) => (
                <option key={`${lop}-${idx}`} value={lop}>
                  {lop}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedClass && (
        <h3 className="schedule-title">
          Thời khóa biểu - {selectedClass}
          {selectedSemester && (
            <span className="semester-badge">
              {selectedSemester === 'HK1' ? 'Học kỳ 1' : 'Học kỳ 2'}
            </span>
          )}
        </h3>
      )}

      <div className="schedule-grid">
        <div className="grid-header empty-cell"></div>
        {Object.values(weekdayMap).map((day) => (
          <div key={day} className="grid-header">
            {day}
          </div>
        ))}

        {periods.map((period) => (
          <React.Fragment key={`period-${period}`}>
            <div className="grid-header tiet">Tiết {period}</div>
            {Object.keys(weekdayMap).map((thu) => {
              const lessons = filteredData.filter(
                (item) => item.tiet === period && item.thu === parseInt(thu)
              );

              return (
                <div key={`${thu}-${period}`} className="grid-cell">
                  {lessons.length > 0 ? (
                    lessons.map((lesson, idx) => (
                      <div key={`${thu}-${period}-${idx}`} className="lesson-block">
                        <div className="monhoc">{lesson.monhoc}</div>
                        <div className="giaovien">{lesson.hoten}</div>
                      </div>
                    ))
                  ) : (
                    <div className="empty">--</div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimetableView;
