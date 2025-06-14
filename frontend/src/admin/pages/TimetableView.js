import React, { useEffect, useState } from "react";
import "../styles/TimetableView.css";

const weekdayMap = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
};

const TimetableView = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]);

  useEffect(() => {
    // Lấy dữ liệu TKB từ API
    fetch('http://localhost:5000/api/schedules/all')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setScheduleData(data.data);

          // Lấy danh sách lớp duy nhất
          const uniqueClasses = [...new Set(data.data.map(item => item.tenlop))].sort((a, b) => {
            // Nếu là dạng "10A1", "10A2", "11B1" → nên dùng so sánh theo mã lớp logic hơn:
            return a.localeCompare(b, 'vi', { numeric: true });
          });
          setClassList(uniqueClasses);
          if (uniqueClasses.length > 0) {
            setSelectedClass(uniqueClasses[0]); // mặc định chọn lớp đầu tiên
          }
        } else {
          console.error("Lỗi khi lấy TKB:", data.message);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy TKB:", err);
        // Set empty state
        setScheduleData([]);
        setClassList([]);
        setSelectedClass('');
      });
  }, []);

  const periods = [1, 2, 3, 4, 5];

  // Lọc TKB theo lớp được chọn
  const filteredData = scheduleData.filter(
    (item) => item.tenlop === selectedClass
  );

  return (
    <div className="schedule-container">
      <h2>Thời khóa biểu - {selectedClass}</h2>

      {/* Bộ lọc lớp */}
      <div className="class-filter">
        <label>Chọn lớp: </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {classList.map((lop, idx) => (
            <option key={idx} value={lop}>
              {lop}
            </option>
          ))}
        </select>
      </div>

      <div className="schedule-grid">
        <div className="grid-header empty-cell"></div>
        {Object.values(weekdayMap).map((day) => (
          <div key={day} className="grid-header">{day}</div>
        ))}

        {periods.map((period) => (
          <React.Fragment key={period}>
            <div className="grid-header tiet">Tiết {period}</div>
            {Object.keys(weekdayMap).map((thu) => {
              const lessons = filteredData.filter(
                (item) => item.tiet === period && item.thu === parseInt(thu)
              );

              return (
                <div key={`${thu}-${period}`} className="grid-cell">
                  {lessons.length > 0 ? (
                    lessons.map((lesson, idx) => (
                      <div key={idx} className="lesson-block">
                        <div className="monhoc">{lesson.monhoc}</div>
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
