import React, { useState, useEffect, useCallback } from "react";
import "../styles/AssignmentView.css";

const AssignmentViewForTeacher = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [currentSemester, setCurrentSemester] = useState(null);
  const token = localStorage.getItem("token");

  // Function to get current academic year and semester
  const getCurrentAcademicInfo = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/assignments/academic-years', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const years = data.data || data || [];
        
        // Find current academic year (trangthai = true)
        const currentYear = years.find(year => year.trangthai === true);
        if (currentYear) {
          // Determine current semester based on date
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1; // 1-12
          
          // Assuming HK1: Sep-Dec (9-12), HK2: Jan-Aug (1-8)
          const semester = (currentMonth >= 9 && currentMonth <= 12) ? 'HK1' : 'HK2';
          setCurrentSemester(semester);
          
          return { yearId: currentYear.id, semester };
        }
      }
      return null;
    } catch (err) {
      console.error('Error fetching current academic info:', err);
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    
    const fetchTeacherAssignments = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Get current academic year and semester
        const academicInfo = await getCurrentAcademicInfo();
        
        if (!academicInfo) {
          setError("Không tìm thấy năm học hiện tại");
          return;
        }

        // Fetch all assignments (backend doesn't support filtering anymore)
        console.log('Fetching all assignments');
        const res = await fetch(`http://localhost:5000/api/assignments/bygv`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        console.log('Response status:', res.status);
        const result = await res.json();
        console.log('API Response:', result);

        if (res.ok) {
          console.log('Raw assignments data:', result.data);
          // Log first assignment to see structure
          if (result.data && result.data.length > 0) {
            console.log('First assignment structure:', result.data[0]);
          }
          
          // Filter assignments on frontend
          let filteredAssignments = result.data;
          
          // If not showing all, filter by current academic year and semester
          if (!showAll) {
            filteredAssignments = result.data.filter(item => {
              // Filter by current year
              const matchesYear = item.namhoc_id === academicInfo.yearId;
              
              // Filter by current semester if semester info is available
              let matchesSemester = true;
              if (academicInfo.semester && item.kyhoc) {
                matchesSemester = item.kyhoc === academicInfo.semester;
              }
              
              return matchesYear && matchesSemester;
            });
          }
          
          setAssignments(filteredAssignments);
          console.log('Filtered assignments:', filteredAssignments);
        } else {
          throw new Error(result.message || "Lỗi không xác định");
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherAssignments();
  }, [token, showAll, getCurrentAcademicInfo]);

  const handleToggleView = () => {
    setShowAll(!showAll);
  };
  return (
    <div className="section">
      <div className="assignment-header">
        <div className="assignment-header-content">
          <h3>Lịch giảng dạy của tôi</h3>
          {currentSemester && !showAll && (
            <p className="assignment-status">
              Hiển thị: Học kỳ {currentSemester === 'HK1' ? '1' : '2'} (Năm học hiện tại)
            </p>
          )}
          {showAll && (
            <p className="assignment-status">
              Hiển thị: Tất cả các học kỳ
            </p>
          )}
        </div>
        <button
          className="assignment-toggle-btn"
          onClick={handleToggleView}
        >
          {showAll ? 'Hiện học kỳ hiện tại' : 'Xem tất cả'}
        </button>
      </div>

      {loading && <p className="loading-message">Đang tải dữ liệu...</p>}
      {error && <p className="error-message">Lỗi: {error}</p>}

      <table className="schedule-table">
        <thead>
          <tr>
            <th>Lớp</th>
            <th>Môn học</th>
            <th>Năm học</th>
            <th>Học kỳ</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length > 0 ? (
            assignments.map((item) => (
              <tr key={item.id}>
                <td>{item.tenlop}</td>
                <td>{item.tenmon}</td>
                <td>{item.namhoc}</td>
                <td>{item.hocky || item.kyhoc || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Không có phân công nào cho bạn.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentViewForTeacher;

