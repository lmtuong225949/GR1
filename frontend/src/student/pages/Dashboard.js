import React, { useEffect, useState } from "react";
import "../styles/StudentSchedule.css";

const weekdayMap = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
};

const StudentSchedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [mahs, setMahs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get mahs directly from localStorage
    const mahs = localStorage.getItem("mahs");
    if (mahs) {
      setMahs(mahs);
    } else {
      // Fallback to user data if mahs is not in localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.mahs) {
            setMahs(user.mahs);
          } else {
            console.error("Không tìm thấy mã học sinh trong user");
          }
        } catch (err) {
          console.error("Lỗi khi parse user:", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!mahs) return;

    // Send mahs as query parameter instead of path parameter
    fetch(`http://localhost:5000/api/schedules/byhs?mahs=${mahs}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setScheduleData(data.data);
        } else {
          console.error("Lỗi khi lấy TKB:", data.message);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy TKB:", err);
      })
      .finally(() => setLoading(false));
  }, [mahs]);

  const periods = [1, 2, 3, 4, 5];

  if (!mahs) return <div>Không tìm thấy mã học sinh. Vui lòng đăng nhập lại.</div>;
  if (loading) return <div>Đang tải thời khóa biểu...</div>;

  return (
    <div className="schedule-container">
      <h2>Thời khóa biểu của bạn</h2>
      <div className="schedule-grid">
        <div className="grid-header empty-cell"></div>
        {Object.entries(weekdayMap).map(([key, day]) => (
          <div key={key} className="grid-header">{day}</div>
        ))}

        {periods.map((period) => (
          <React.Fragment key={period}>
            <div className="grid-header tiet">Tiết {period}</div>
            {Object.keys(weekdayMap).map((thu) => {
              const lesson = scheduleData.find(
                (item) => item.thu === parseInt(thu) && item.tiet === period
              );
              return (
                <div key={`${thu}-${period}`} className="grid-cell">
                  {lesson ? (
                    <div className="lesson-block">
                      <div className="monhoc">{lesson.monhoc}</div>
                      <div className="lop">({lesson.tenlop})</div>
                      <div className="teacher">GV: {lesson.tengv || 'Chưa có giáo viên'}</div>
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

export default StudentSchedule;
