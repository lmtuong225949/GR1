import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Exam.css";

const Exam = () => {
  const navigate = useNavigate();
  const mahs = localStorage.getItem("mahs");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [error, setError] = useState("");

  /* ================== FETCH SUBJECTS ================== */
  useEffect(() => {
    if (!mahs) return;

    fetch(`http://localhost:5000/api/scores/student/${mahs}/subjects`)
      .then(res => res.json())
      .then(data => {
        const unique = [...new Map(data.map(i => [i.monhoc, i])).values()];
        setSubjects(unique);
      })
      .catch(() => setError("Không tải được môn học"));
  }, [mahs]);

  /* ================== FETCH AVAILABLE EXAMS ================== */
  useEffect(() => {
    if (!selectedSubject) return;

    // Fetch available exams
    fetch(`http://localhost:5000/api/exams/student/${mahs}/exams`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        const filtered = data.filter(e => e.tenmon === selectedSubject.monhoc);
        setAvailableExams(filtered);
      })
      .catch(err => {
        console.error("Error fetching exams:", err);
        setError("Không tải được đề thi: " + err.message);
      });

    // Fetch completed exams (history)
    fetch(`http://localhost:5000/api/exams/student/${mahs}/history`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        // Transform the data to match the expected format
        const formattedData = data.map(exam => ({
          id: exam.id,
          dethiid: exam.id, // Using the same ID for now since the original structure is unclear
          tendethi: exam.tenmon ? `Bài kiểm tra ${exam.tenmon}` : 'Không có tiêu đề',
          tenmon: exam.tenmon || 'Không xác định',
          diem: exam.diem || 0,
          ngaynop: exam.thoigianketthuc ? new Date(exam.thoigianketthuc).toLocaleString() : 'Chưa xác định',
          trangthai: 'dapheduyet' // Assuming all history items are already graded
        }));
        
        const filtered = formattedData.filter(e => 
          e.tenmon === selectedSubject.monhoc
        );
        setCompletedExams(filtered);
      })
      .catch(err => {
        console.error("Error fetching completed exams:", err);
        setError("Không tải được lịch sử bài làm");
      });
  }, [selectedSubject, mahs]);

  const handleRequestReview = (examId) => {
    if (window.confirm("Bạn có chắc chắn muốn gửi yêu cầu phúc khảo cho bài thi này?")) {
      fetch(`http://localhost:5000/api/exams/request-review/${examId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mahs })
      })
      .then(res => res.json())
      .then(data => alert(data.message || "Đã gửi yêu cầu phúc khảo thành công"))
      .catch(err => {
        console.error("Error requesting review:", err);
        alert("Có lỗi xảy ra khi gửi yêu cầu phúc khảo");
      });
    }
  };

  return (
    <div className="exam-container">
      <h1>Kiểm tra trắc nghiệm</h1>
      {error && <div className="error">{error}</div>}

      <h2>Chọn môn</h2>
      <div className="subject-grid">
        {subjects.map(s => (
          <div
            key={s.monhoc}
            className={`subject-card ${selectedSubject?.monhoc === s.monhoc ? "selected" : ""}`}
            onClick={() => setSelectedSubject(s)}
          >
            {s.monhoc}
          </div>
        ))}
      </div>

      {selectedSubject && (
        <>
          <div className="toggle-container">
            <button 
              className={`toggle-btn ${!showCompleted ? 'active' : ''}`}
              onClick={() => setShowCompleted(false)}
            >
              Đề chưa làm
            </button>
            <button 
              className={`toggle-btn ${showCompleted ? 'active' : ''}`}
              onClick={() => setShowCompleted(true)}
            >
              Bài đã làm
            </button>
          </div>

          <h2>{showCompleted ? 'Bài đã làm' : 'Đề có sẵn'}</h2>
          
          {showCompleted ? (
            completedExams.length > 0 ? (
              completedExams.map(exam => (
                <div key={exam.id} className="exam-card completed">
                  <h3>{exam.tendethi || `Đề thi #${exam.dethiid}`}</h3>
                  <p>Môn: {exam.tenmon}</p>
                  <p>Điểm: {exam.diem}</p>
                  <p>Trạng thái: {exam.trangthai === 'dapheduyet' ? 'Đã phê duyệt' : 'Chờ phê duyệt'}</p>
                  <div className="exam-actions">
                    <button onClick={() => navigate(`/student/exam/results/${exam.id}`)}>
                      Xem kết quả
                    </button>
                    {exam.trangthai !== 'dapheduyet' && (
                      <button 
                        className="review-btn"
                        onClick={() => handleRequestReview(exam.id)}
                      >
                        Yêu cầu phúc khảo
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-exams">
                <p>Chưa có bài thi nào đã hoàn thành cho môn {selectedSubject.monhoc}</p>
              </div>
            )
          ) : (
            availableExams.length > 0 ? (
              availableExams.map(exam => (
                <div key={exam.dethiid} className="exam-card">
                  <h3>{exam.tendethi || `Đề thi #${exam.dethiid}`}</h3>
                  <p>Môn: {exam.tenmon}</p>
                  <p>Thời gian: {exam.thoigian || 60} phút</p>
                  <p>Số câu: {exam.socauhoi || exam.socau || 'N/A'}</p>
                  <button onClick={() => navigate(`/student/exam/${exam.dethiid}`)}>
                    Làm bài
                  </button>
                </div>
              ))
            ) : (
              <div className="no-exams">
                <p>Không có đề thi nào cho môn {selectedSubject.monhoc}</p>
                <p>Bạn đã làm tất cả các đề thi của môn này hoặc chưa có đề thi nào được tạo.</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Exam;