import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateExam.css';

const CreateExam = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    classId: '',
    duration: 60,
    totalScore: 10,
    questions: [{
      content: '',
      score: 1,
      answers: [
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ]
    }]
  });

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch teacher's subjects and classes
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        
        // Fetch teacher's assignments to get classes and subjects
        const assignmentsRes = await fetch('http://localhost:5000/api/assignments/bygv', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!assignmentsRes.ok) {
          throw new Error('Không thể tải dữ liệu phân công');
        }

        const assignmentsData = await assignmentsRes.json();
        
        if (assignmentsData.success) {
          // Extract unique classes and subjects from assignments
          const classMap = new Map();
          const subjectMap = new Map();

          assignmentsData.data.forEach(item => {
            if (!classMap.has(item.lopid)) {
              classMap.set(item.lopid, {
                id: item.lopid,
                name: item.tenlop
              });
            }
            if (!subjectMap.has(item.monid)) {
              subjectMap.set(item.monid, {
                id: item.monid,
                name: item.tenmon
              });
            }
          });

          setClasses(Array.from(classMap.values()));
          setSubjects(Array.from(subjectMap.values()));
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError('Không thể tải danh sách lớp và môn học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  // ... rest of your component code remains the same ...
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleAnswerChange = (qIndex, aIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].answers[aIndex] = {
      ...updatedQuestions[qIndex].answers[aIndex],
      [field]: value
    };
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          content: '',
          score: 1,
          answers: [
            { content: '', isCorrect: true },
            { content: '', isCorrect: false },
            { content: '', isCorrect: false },
            { content: '', isCorrect: false }
          ]
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    }
  };

  const addAnswer = (qIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].answers.push({ content: '', isCorrect: false });
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const removeAnswer = (qIndex, aIndex) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[qIndex].answers.length > 2) {
      updatedQuestions[qIndex].answers = updatedQuestions[qIndex].answers.filter((_, i) => i !== aIndex);
      setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/exams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          // Convert subject and classId to numbers if needed
          subject: Number(formData.subject),
          classId: Number(formData.classId)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Có lỗi xảy ra');
      
      alert('Tạo đề thi thành công!');
      navigate('/teacher/exams');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo đề thi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="create-exam-container">
      <h1>Tạo đề kiểm tra mới</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="exam-form">
        <div className="form-group">
          <label>Tiêu đề đề thi:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Môn học:</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              disabled={subjects.length === 0}
            >
              <option value="">{subjects.length === 0 ? 'Đang tải môn học...' : 'Chọn môn học'}</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Lớp:</label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              required
              disabled={classes.length === 0}
            >
              <option value="">{classes.length === 0 ? 'Đang tải lớp học...' : 'Chọn lớp'}</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Thời gian làm bài (phút):</label>
            <input
              type="number"
              name="duration"
              min="1"
              value={formData.duration}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tổng điểm:</label>
            <input
              type="number"
              name="totalScore"
              min="1"
              value={formData.totalScore}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <h2>Câu hỏi</h2>
        {formData.questions.map((question, qIndex) => (
          <div key={qIndex} className="question-card">
            <div className="question-header">
              <h3>Câu {qIndex + 1}</h3>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="btn-remove"
                disabled={formData.questions.length <= 1}
              >
                Xóa câu hỏi
              </button>
            </div>

            <div className="form-group">
              <label>Nội dung câu hỏi:</label>
              <textarea
                value={question.content}
                onChange={(e) => handleQuestionChange(qIndex, 'content', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Điểm:</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={question.score}
                onChange={(e) => handleQuestionChange(qIndex, 'score', parseFloat(e.target.value))}
                required
              />
            </div>

            <h4>Đáp án:</h4>
            {question.answers.map((answer, aIndex) => (
              <div key={aIndex} className="answer-option">
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  checked={answer.isCorrect}
                  onChange={() => {
                    const updatedQuestions = [...formData.questions];
                    updatedQuestions[qIndex].answers.forEach((a, i) => {
                      updatedQuestions[qIndex].answers[i].isCorrect = (i === aIndex);
                    });
                    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                  }}
                />
                <input
                  type="text"
                  value={answer.content}
                  onChange={(e) => handleAnswerChange(qIndex, aIndex, 'content', e.target.value)}
                  placeholder={`Đáp án ${aIndex + 1}`}
                  required
                />
                {question.answers.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeAnswer(qIndex, aIndex)}
                    className="btn-remove"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addAnswer(qIndex)}
              className="btn-add-answer"
              disabled={question.answers.length >= 6}
            >
              + Thêm đáp án
            </button>
          </div>
        ))}

        <div className="form-actions">
          <button
            type="button"
            onClick={addQuestion}
            className="btn-add-question"
          >
            + Thêm câu hỏi
          </button>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Tạo đề thi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;