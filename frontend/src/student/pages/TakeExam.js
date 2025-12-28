import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/TakeExam.css";

const TakeExam = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const mahs = localStorage.getItem("mahs");

  const [currentExam, setCurrentExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  
  // Debug: Monitor answers state
  useEffect(() => {
    console.log('Answers state updated:', answers);
  }, [answers]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!examId || !mahs) return;

    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/exams/exam/${examId}`);
        const data = await res.json();

        console.log('Exam data received:', data);
        console.log('Questions data:', data.questions);
        console.log('First question structure:', data.questions?.[0]);

        setCurrentExam(data.exam);
        setQuestions(data.questions);
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        setTimeLeft(data.exam.thoigian * 60);
      } catch (err) {
        console.error('Error fetching exam:', err);
        setError("Không tải được đề thi");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, mahs]);

  const submitExam = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);

    try {
      // Convert index-based answers to question ID-based answers for backend
      const backendAnswers = {};
      questions.forEach((q, i) => {
        if (answers[i]) {
          // Use cauhoiid which is the correct field from backend query
          backendAnswers[q.cauhoiid] = answers[i];
        }
      });

      const submissionData = {
        mahs,
        dethiid: currentExam.id,
        answers: backendAnswers
      };
      
      console.log('Submitting exam with data:', submissionData);

      const res = await fetch(`http://localhost:5000/api/exams/exam/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      console.log('Backend response:', data);

      setResult({
        diem: data.diem,
        dung: data.dung,
        tongcau: data.tongcau
      });
      
      // Navigate back to exam selection after submission
      setTimeout(() => {
        navigate('/student/exam');
      }, 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
    }
  }, [answers, mahs, currentExam, submitted, navigate, questions]);

  useEffect(() => {
    if (!currentExam || submitted || timeLeft <= 0) return;

    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);

    if (timeLeft === 1) submitExam(); // auto submit

    return () => clearTimeout(t);
  }, [timeLeft, submitted, currentExam, submitExam]);

  useEffect(() => {
    if (!currentExam || submitted) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Bạn đang làm bài thi. Nếu rời khỏi trang, bài thi sẽ bị nộp tự động. Bạn có chắc muốn rời đi?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentExam, submitted]);

  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (loading) return <div className="loading">Đang tải...</div>;

  if (!currentExam && !loading) {
    return (
      <div className="exam-container">
        <div className="error">
          <p>Không tìm thấy đề thi</p>
          <button onClick={() => navigate('/student/exam')}>Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h1>{currentExam?.tendethi || `Đề thi #${examId}`}</h1>
        {currentExam && <span>{formatTime(timeLeft)}</span>}
      </div>

      {error && <div className="error">{error}</div>}

      {!submitted && currentExam && (
        <>
          <div className="exam-info">
            <p>Môn: {currentExam.tenmon}</p>
            <p>Thời gian: {currentExam.thoigian} phút</p>
            <p>Số câu: {questions.length}</p>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="question">
              <p>Câu {i + 1}: {q.noidung}</p>
              {q.phuongan && q.phuongan.map((option, optIndex) => (
                <label key={option.id}>
                  <input
                    type="radio"
                    name={`question_${i}`}
                    checked={answers[i] === option.id}
                    onChange={() => {
                      console.log(`Changing answer for question ${q.cauhoiid} to option ${option.id}`);
                      setAnswers(a => ({ ...a, [i]: option.id }));
                    }}
                  />
                  {option.noidung}
                </label>
              ))}
            </div>
          ))}

          <button onClick={submitExam} className="submit-btn">Nộp bài</button>
        </>
      )}

      {result && (
        <div className="result">
          <h2>Kết quả</h2>
          <p>Điểm: {result.diem ? result.diem.toFixed(1) : '0.0'}/10</p>
          <p>Đúng: {result.dung || 0}/{result.tongcau || 0}</p>
          <div className="result-actions">
            <button onClick={() => navigate('/student/exam')}>Quay lại chọn bài khác</button>
            <button onClick={() => window.print()}>In kết quả</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;
