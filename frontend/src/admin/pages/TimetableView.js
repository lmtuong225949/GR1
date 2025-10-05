import React, { useEffect, useState } from "react";
import "../styles/TimetableView.css";

const weekdayMap = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
};


const TimetableView = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScheduleData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:5000/api/schedules/all');
        
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
    };

    fetchScheduleData();
  }, [selectedClass]);

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
      <h2>Thời khóa biểu - {selectedClass}</h2>

      <div className="class-filter">
        <label htmlFor="class-select">Chọn lớp: </label>
        <select
          id="class-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          disabled={isLoading}
        >
          {classList.map((lop, idx) => (
            <option key={`${lop}-${idx}`} value={lop}>
              {lop}
            </option>
          ))}
        </select>
      </div>

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
                        {lesson.giaovien && (
                          <div className="giaovien">{lesson.giaovien}</div>
                        )}
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
