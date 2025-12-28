import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import "../styles/GenerateSchedule.css";

const GenerateSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    fetchAcademicYears();
  }, []);

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
        setAcademicYears(data.data || data || []);
      }
    } catch (err) {
      console.error('Error fetching academic years:', err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedYear) {
      setError('Vui lòng chọn năm học để tạo thời khóa biểu');
      return;
    }

    const yearInfo = academicYears.find(y => y.id === selectedYear);
    
    if (!window.confirm(`Bạn có chắc muốn tạo thời khóa biểu cho năm học ${yearInfo?.namhoc} - ${yearInfo?.kyhoc}?`)) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/schedules/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          namhoc_id: selectedYear,
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Phản hồi từ server không phải JSON");
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Lỗi khi tạo thời khóa biểu");
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Lỗi tạo TKB:", err);
      setError(err.message || "Đã xảy ra lỗi khi tạo thời khóa biểu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/admin/schedule');
  };

  const handleClose = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="generate-schedule-container">
      <Modal show={showSuccessModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Thành công</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Thời khóa biểu đã được tạo thành công!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Huỷ
          </Button>
          <Button variant="primary" onClick={handleSuccessConfirm}>
            Đồng ý
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="generate-schedule-card">
        <h2 className="generate-schedule-title">Tạo Thời Khóa Biểu Theo Học Kỳ</h2>
        <p className="generate-schedule-description">
          Chọn năm học và học kỳ để tạo thời khóa biểu tự động dựa trên các phân công giảng dạy của học kỳ đó.
        </p>
        
        <div className="generate-schedule-form">
          <div className="generate-schedule-form-group">
            <label className="generate-schedule-label">Năm học:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="generate-schedule-select"
              required
            >
              <option value="">Chọn năm học</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.namhoc} - {year.kyhoc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="generate-schedule-error">{error}</div>}
        
        <button
          className="generate-schedule-button"
          onClick={handleGenerate}
          disabled={loading || !selectedYear}
        >
          {loading ? (
            <div className="generate-schedule-loading">
              <span className="generate-schedule-spinner"></span>
              Đang tạo thời khóa biểu...
            </div>
          ) : (
            "Tạo Thời Khóa Biểu"
          )}
        </button>
      </div>
    </div>
  );
};

export default GenerateSchedule;
