import React, { useEffect, useState } from "react";
import "../styles/TimetableForGV.css";

const weekdayMap = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
};

const TimetableView = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:5000/api/schedules/bygv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setScheduleData(data.data);
        } else {
          console.error("Lỗi API:", data.message);
        }
      })
      .catch((err) => console.error("Lỗi khi lấy TKB:", err));
  }, [token]);

  const periods = [1, 2, 3, 4, 5];

  return (
    <div className="schedule-container">
      <h2>Thời khóa biểu của bạn</h2>
      <div className="schedule-grid">
        <div className="grid-header empty-cell"></div>
        {Object.entries(weekdayMap).map(([key, day]) => (
          <div key={key} className="grid-header">
            {day}
          </div>
        ))}

        {periods.map((period) => (
          <React.Fragment key={period}>
            <div className="grid-header tiet">Tiết {period}</div>
            {Object.keys(weekdayMap).map((thu) => {
              const lesson = scheduleData.find(
                (item) => item.thu === parseInt(thu) && item.tiet === period
              );
              return (
                <div key={thu + "-" + period} className="grid-cell">
                  {lesson ? (
                    <div className="lesson-block">
                      <div className="monhoc">{lesson.monhoc}</div>
                      <div className="lop">({lesson.tenlop})</div>
                    </div>
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
