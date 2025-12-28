import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import "../styles/ScoreDetailPage.css";

const ScoreDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Ưu tiên lấy từ location.state, nếu không thì fallback sang query string
  // For teacher grading, expect class-level parameters
  const lopid = location.state?.lopid || searchParams.get("lopid") || "";
  const monid = location.state?.monid || searchParams.get("monid") || "";
  const namhoc_id = location.state?.namhoc_id || searchParams.get("namhoc_id") || "";
  const hocky = location.state?.hocky || searchParams.get("hocky") || "";
  const tenlop = location.state?.tenlop || searchParams.get("tenlop") || "";
  const tenmon = location.state?.tenmon || searchParams.get("tenmon") || "";

  // Fallback for individual student view (admin)
  
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingGrades, setEditingGrades] = useState({});
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [gradeColumns, setGradeColumns] = useState({
    diemmieng: 1,
    diem15phut: 1,
    diem1tiet: 1,
    diemcuoiky: 1
  });

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
      }
        
        // Get grades data
      const gradesUrl = `http://localhost:5000/api/assignments/getStudentGrades?lopid=${lopid}&monid=${monid}&namhoc_id=${namhoc_id}`;
      const gradesRes = await fetch(gradesUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!gradesRes.ok) {
        const errorText = await gradesRes.text();
        throw new Error(`Lỗi ${gradesRes.status}: ${errorText}`);
      }
      
      const gradesResult = await gradesRes.json();
      
      if (gradesResult.success && gradesResult.data.length > 0) {
        // Process existing grades - handle multiple grades with lanthu
        const studentData = {};
        gradesResult.data.forEach(item => {
          if (!studentData[item.mahs]) {
            studentData[item.mahs] = {
              mahs: item.mahs,
              hoten: item.hoten,
              tenlop: tenlop,
              subjects: {
                [tenmon]: {
                  diemmieng: [],
                  diem15phut: [],
                  diem1tiet: [],
                  diemcuoiky: [],
                  allGrades: []
                }
              }
            };
          }
          
          const gradeType = item.tenloaidiem?.toLowerCase() || '';
          const gradeValue = parseFloat(item.giatri);
          
          if (!isNaN(gradeValue) && gradeValue !== null && gradeValue !== undefined) {
            if (gradeType.includes('miệng') || gradeType.includes('mouth') || gradeType.includes('oral') || gradeType.includes('─Éiß╗âm miß╗çng')) {
              studentData[item.mahs].subjects[tenmon].diemmieng.push({
                value: gradeValue,
                lanthu: item.lanthu,
                id: item.id,
                heso: item.heso || 1
              });
              studentData[item.mahs].subjects[tenmon].allGrades.push(gradeValue);
            } else if (gradeType.includes('15') || gradeType.includes('15 ph├║t')) {
              studentData[item.mahs].subjects[tenmon].diem15phut.push({
                value: gradeValue,
                lanthu: item.lanthu,
                id: item.id,
                heso: item.heso || 1
              });
              studentData[item.mahs].subjects[tenmon].allGrades.push(gradeValue);
            } else if (gradeType.includes('1 tiết') || gradeType.includes('giữa kỳ') || gradeType.includes('1 tiß║┐t')) {
              studentData[item.mahs].subjects[tenmon].diem1tiet.push({
                value: gradeValue,
                lanthu: item.lanthu,
                id: item.id,
                heso: item.heso || 2
              });
              studentData[item.mahs].subjects[tenmon].allGrades.push(gradeValue);
            } else if (gradeType.includes('cuối kỳ') || gradeType.includes('Cuß╗æi kß╗│')) {
              studentData[item.mahs].subjects[tenmon].diemcuoiky.push({
                value: gradeValue,
                lanthu: item.lanthu,
                id: item.id,
                heso: item.heso || 3
              });
              studentData[item.mahs].subjects[tenmon].allGrades.push(gradeValue);
            }
          }
        });
        
        const displayData = Object.values(studentData).map(student => {
          const grades = student.subjects[tenmon];
          
          // Calculate weighted averages using heso
          const avgMieng = grades.diemmieng.length > 0 
            ? grades.diemmieng.reduce((sum, grade) => sum + (grade.value * (grade.heso || 1)), 0) / grades.diemmieng.length
            : null;
          const avg15phut = grades.diem15phut.length > 0 
            ? grades.diem15phut.reduce((sum, grade) => sum + (grade.value * (grade.heso || 1)), 0) / grades.diem15phut.length
            : null;
          const avg1tiet = grades.diem1tiet.length > 0 
            ? grades.diem1tiet.reduce((sum, grade) => sum + (grade.value * (grade.heso || 2)), 0) / grades.diem1tiet.length
            : null;
          const avgcuoiky = grades.diemcuoiky.length > 0 
            ? grades.diemcuoiky.reduce((sum, grade) => sum + (grade.value * (grade.heso || 3)), 0) / grades.diemcuoiky.length
            : null;
          
          // Calculate weighted overall average
          let avgAll = null;
          let totalWeight = 0;
          let weightedSum = 0;
          
          if (avgMieng !== null) {
            weightedSum += avgMieng * 1;
            totalWeight += 1;
          }
          if (avg15phut !== null) {
            weightedSum += avg15phut * 1;
            totalWeight += 1;
          }
          if (avg1tiet !== null) {
            weightedSum += avg1tiet * 2;
            totalWeight += 2;
          }
          if (avgcuoiky !== null) {
            weightedSum += avgcuoiky * 3;
            totalWeight += 3;
          }
          
          if (totalWeight > 0) {
            avgAll = weightedSum / totalWeight;
          } else if (grades.allGrades.length > 0) {
            const validGrades = grades.allGrades.filter(g => g !== null && g !== undefined && !isNaN(g));
            if (validGrades.length > 0) {
              avgAll = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
            }
          }
          
          const formatNumber = (value) => {
            if (value === null || value === undefined || isNaN(value)) return null;
            return Math.round(value * 100) / 100;
          };
          
          return {
            ...student,
            subjects: [{
              monhoc: tenmon,
              diemmieng: grades.diemmieng,     // Array of {value, lanthu, id}
              diem15phut: grades.diem15phut,   // Array of {value, lanthu, id}
              diem1tiet: grades.diem1tiet,     // Array of {value, lanthu, id}
              diemcuoaky: grades.diemcuoiky,    // Array of {value, lanthu, id}
              diemtrungbinh: formatNumber(avgAll)
            }]
          };
        });
        
        setDetails(displayData);
      } else {
        // Get all students in this class for empty table
        const studentsUrl = `http://localhost:5000/api/assignments/getStudentsInClass?lopid=${lopid}`;
        const studentsRes = await fetch(studentsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (studentsRes.ok) {
          const studentsResult = await studentsRes.json();
          if (studentsResult.success && studentsResult.data.length > 0) {
            const emptyDisplayData = studentsResult.data.map(student => ({
              mahs: student.mahs,
              hoten: student.hoten,
              tenlop: student.tenlop,
              subjects: [{
                monhoc: tenmon,
                diemmieng: null,
                diem15phut: null,
                diem1tiet: null,
                diemcuoaky: null,
                diemtrungbinh: null
              }]
            }));
            
            setDetails(emptyDisplayData);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching score details:", err);
      setError(`Lỗi khi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [lopid, monid, namhoc_id, tenlop, tenmon]);

  useEffect(() => {
    // Only teacher view is supported for editing
    const isTeacherView = lopid && monid && namhoc_id;
    
    if (!isTeacherView) {
      setError("Thiếu tham số để xem chi tiết điểm.");
      return;
    }

    fetchDetails();
  }, [fetchDetails, lopid, monid, namhoc_id]);

  // Helper function to render grade inputs for multiple grades
  const addGradeColumn = (gradeType) => {
    setGradeColumns(prev => ({
      ...prev,
      [gradeType]: prev[gradeType] + 1
    }));
  };

  const renderGradeInputs = (studentId, gradeType, grades) => {
    const studentGrades = editingGrades[studentId] || {};
    const columnCount = gradeColumns[gradeType] || 1;
    
    // Create array of column indices
    const columns = Array.from({ length: columnCount }, (_, i) => i);
    
    return (
      <div className="grade-inputs-container">
        {columns.map((colIndex) => {
          // Find existing grade for this column
          const existingGrade = grades && grades.find(g => g.lanthu === colIndex + 1);
          const gradeKey = existingGrade ? `${gradeType}_${existingGrade.id}` : `${gradeType}_col_${colIndex}`;
          const currentValue = studentGrades[gradeKey] !== undefined ? studentGrades[gradeKey] : (existingGrade ? existingGrade.value : '');
          
          return (
            <div key={gradeKey} className="grade-input-row">
              <span className="grade-label">
                {existingGrade ? `L${existingGrade.lanthu}:` : `C${colIndex + 1}:`}
              </span>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={currentValue}
                onChange={(e) => handleGradeChange(studentId, gradeKey, e.target.value)}
                className="grade-input"
                title={existingGrade ? `Hệ số: ${existingGrade.heso || 1}` : `Cột ${colIndex + 1}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const handleGradeChange = (studentId, gradeType, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > 10)) {
      return; // Invalid grade
    }
    
    setEditingGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [gradeType]: numValue
      }
    }));
  };
  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare data for saving
      const saveData = [];
      Object.entries(editingGrades).forEach(([studentId, grades]) => {
        Object.entries(grades).forEach(([gradeKey, value]) => {
          if (value !== null && value !== undefined) {
            // Parse gradeKey to determine if it's existing grade or new grade
            if (gradeKey.includes('_new')) {
              // New grade - determine grade type and get next lanthu
              const gradeType = gradeKey.replace('_new', '');
              const loaidiemid = gradeType === 'diemmieng' ? 4 : gradeType === 'diem15phut' ? 1 : gradeType === 'diem1tiet' ? 2 : 3;
              
              saveData.push({
                mahs: studentId,
                monid: monid,
                namhoc_id: namhoc_id,
                loaidiemid: loaidiemid,
                giatri: value,
                lanthu: 1 // Backend will determine appropriate lanthu
              });
            } else if (gradeKey.includes('_col_')) {
              // New column grade
              const parts = gradeKey.split('_col_');
              const gradeType = parts[0];
              const colIndex = parseInt(parts[1]);
              const loaidiemid = gradeType === 'diemmieng' ? 4 : gradeType === 'diem15phut' ? 1 : gradeType === 'diem1tiet' ? 2 : 3;
              
              saveData.push({
                mahs: studentId,
                monid: monid,
                namhoc_id: namhoc_id,
                loaidiemid: loaidiemid,
                giatri: value,
                lanthu: colIndex + 1
              });
            } else {
              // Existing grade - extract grade id
              const parts = gradeKey.split('_');
              const gradeId = parts[parts.length - 1];
              
              saveData.push({
                id: parseInt(gradeId),
                mahs: studentId,
                monid: monid,
                namhoc_id: namhoc_id,
                giatri: value
              });
            }
          }
        });
      });
      
      if (saveData.length === 0) {
        alert('Không có điểm nào để lưu!');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/assignments/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ grades: saveData })
      });
      
      if (response.ok) {
        alert('Lưu điểm thành công!');
        setEditingGrades({});
        fetchDetails(); // Refresh data
      } else {
        throw new Error('Lỗi khi lưu điểm');
      }
    } catch (err) {
      console.error('Error saving grades:', err);
      alert('Lỗi khi lưu điểm: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Process Excel data
        const importedGrades = {};
        jsonData.forEach(row => {
          const studentId = row['MAHS'] || row['mahs'];
          const gradeMieng = parseFloat(row['Miệng'] || row['Miệng'] || row['diemmieng'] || row['DiemMieng']);
          const grade15 = parseFloat(row['15 phút'] || row['15 phút'] || row['diem15phut'] || row['Diem15Phut']);
          const grade1Tiet = parseFloat(row['1 tiết'] || row['1 tiết'] || row['diem1tiet'] || row['Diem1Tiet']);
          const gradeCuoiKy = parseFloat(row['Cuối kỳ'] || row['Cuối kỳ'] || row['diemcuoiky'] || row['DiemCuoiKy']);
          
          if (studentId) {
            importedGrades[studentId] = {};
            if (!isNaN(gradeMieng) && gradeMieng >= 0 && gradeMieng <= 10) {
              importedGrades[studentId].diemmieng = gradeMieng;
            }
            if (!isNaN(grade15) && grade15 >= 0 && grade15 <= 10) {
              importedGrades[studentId].diem15phut = grade15;
            }
            if (!isNaN(grade1Tiet) && grade1Tiet >= 0 && grade1Tiet <= 10) {
              importedGrades[studentId].diem1tiet = grade1Tiet;
            }
            if (!isNaN(gradeCuoiKy) && gradeCuoiKy >= 0 && gradeCuoiKy <= 10) {
              importedGrades[studentId].diemcuoiky = gradeCuoiKy;
            }
          }
        });
        
        setEditingGrades(prev => ({ ...prev, ...importedGrades }));
        alert('Import dữ liệu thành công! Vui lòng kiểm tra và lưu điểm.');
      } catch (err) {
        console.error('Error importing file:', err);
        alert('Lỗi khi import file: ' + err.message);
      } finally {
        setImporting(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset file input
  };

  const exportTemplate = () => {
    const templateData = details.map(student => ({
      'MAHS': student.mahs,
      'Họ tên': student.hoten,
      'Miệng (hs=1)': '',
      '15 phút (hs=1)': '',
      '1 tiết (hs=2)': '',
      'Cuối kỳ (hs=3)': ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `template_diem_${tenlop}_${tenmon}.xlsx`);
  };

  if (loading) {
    return <div className="loading-container">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Lỗi</h3>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="error-button">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="score-detail-page">
      <div className="header-section">
        <h2 className="header-title">Nhập điểm - {tenlop} - {tenmon}</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          Quay lại
        </button>
      </div>
      
      <div className="info-section">
        <strong>Lớp:</strong> {tenlop} | <strong>Môn học:</strong> {tenmon} | <strong>Học kỳ:</strong> {hocky}
      </div>

      <div className="action-buttons">
        <button 
          onClick={exportTemplate}
          className="action-button primary"
        >
          Tải template Excel
        </button>
        
        <label className={`action-button info ${importing ? 'disabled' : ''}`}>
          {importing ? "Đang import..." : "Import Excel"}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileImport}
            disabled={importing}
            className="file-input"
          />
        </label>
        
        <button 
          onClick={handleSaveGrades}
          disabled={saving || Object.keys(editingGrades).length === 0}
          className="action-button save"
        >
          {saving ? "Đang lưu..." : "Lưu điểm"}
        </button>
      </div>

      {details.length > 0 ? (
        <div className="table-container">
          <table className="grades-table">
            <thead>
              <tr>
                <th>MAHS</th>
                <th>Họ tên</th>
                <th className="center">
                  Miệng
                  <button 
                    onClick={() => addGradeColumn('diemmieng')}
                    className="column-add-button"
                    title="Thêm cột điểm miệng"
                  >
                    +
                  </button>
                </th>
                <th className="center">
                  15 phút
                  <button 
                    onClick={() => addGradeColumn('diem15phut')}
                    className="column-add-button"
                    title="Thêm cột điểm 15 phút"
                  >
                    +
                  </button>
                </th>
                <th className="center">
                  1 tiết
                  <button 
                    onClick={() => addGradeColumn('diem1tiet')}
                    className="column-add-button"
                    title="Thêm cột điểm 1 tiết"
                  >
                    +
                  </button>
                </th>
                <th className="center">Cuối kỳ</th>
                <th className="center">Trung bình</th>
              </tr>
            </thead>
            <tbody>
              {details.map((student, index) => {
                const currentGrades = student.subjects[0];
                
                return (
                  <tr key={student.mahs}>
                    <td>{student.mahs}</td>
                    <td>{student.hoten}</td>
                    <td className="center">
                      {renderGradeInputs(student.mahs, 'diemmieng', currentGrades.diemmieng)}
                    </td>
                    <td className="center">
                      {renderGradeInputs(student.mahs, 'diem15phut', currentGrades.diem15phut)}
                    </td>
                    <td className="center">
                      {renderGradeInputs(student.mahs, 'diem1tiet', currentGrades.diem1tiet)}
                    </td>
                    <td className="center">
                      {renderGradeInputs(student.mahs, 'diemcuoiky', currentGrades.diemcuoaky)}
                    </td>
                    <td className="average-cell">
                      {currentGrades.diemtrungbinh || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data-container">
          Không có dữ liệu học sinh
        </div>
      )}
      
      <div className="guide-section">
        <p><strong>Hướng dẫn:</strong></p>
        <ul>
          <li>Nhập điểm trực tiếp vào bảng hoặc import từ file Excel</li>
          <li>Điểm phải trong khoảng từ 0 đến 10</li>
          <li>Nhấn "Lưu điểm" để lưu điểm vào hệ thống</li>
          <li>Sử dụng "Tải template Excel" để lấy mẫu file import</li>
        </ul>
      </div>
    </div>
  );
};

export default ScoreDetail;
