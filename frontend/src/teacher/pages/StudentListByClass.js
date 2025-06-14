import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/GradeTable.css";

const GradeTable = () => {
  const [gradesByStudent, setGradesByStudent] = useState([]);
  const [gradeTypes, setGradeTypes] = useState([]);
  const [tenlop, setTenlop] = useState("");

  const [searchParams] = useSearchParams();
  const lopid = searchParams.get("lopid");
  const monid = searchParams.get("monid");
  const hocky = searchParams.get("hocky");
  const namhoc = searchParams.get("namhoc");

  useEffect(() => {
    if (!lopid || !monid || !hocky || !namhoc) return;

    const fetchClassName = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/classes/${encodeURIComponent(lopid)}`);
        const data = await res.json();
        if (data.success && data.data?.tenlop) {
          setTenlop(data.data.tenlop);
        } else {
          console.error('Không thể lấy tên lớp:', data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy tên lớp:", err);
      }
    };

    const fetchGrades = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/assignments/getStudentGrades?lopid=${lopid}&monid=${monid}&hocky=${hocky}&namhoc=${namhoc}`
        );
        const data = await res.json();

        if (data.success) {
          const rawGrades = data.data;
          const types = Array.from(new Set(rawGrades.map((g) => g.tenloaidiem)));
          setGradeTypes(types);

          const grouped = {};
          rawGrades.forEach((g) => {
            if (!grouped[g.mahs]) {
              grouped[g.mahs] = {
                mahs: g.mahs,
                hoten: g.hoten,
                diem: {},
              };
            }
            const key = g.tenloaidiem;
            if (!grouped[g.mahs].diem[key]) {
              grouped[g.mahs].diem[key] = [];
            }
            grouped[g.mahs].diem[key].push({
              giatri: g.giatri,
              id: g.id,  
              lanthu: g.lanthu,
              tenloaidiem: g.tenloaidiem,
              heso: g.heso
            });
          });

          setGradesByStudent(Object.values(grouped));
        } else {
          alert("Lỗi khi lấy dữ liệu: " + data.message);
        }
      } catch (err) {
        alert("Không thể kết nối tới server.");
        console.error(err);
      }
    };

    fetchClassName();
    fetchGrades();
  }, [lopid, monid, hocky, namhoc]);

  const handleChange = (studentId, type, id, value) => {
    const floatValue = parseFloat(value);

    if (value === "" || (floatValue >= 0 && floatValue <= 10)) {
      setGradesByStudent((prev) =>
        prev.map((student) => {
          if (student.mahs !== studentId) return student;

          const newDiem = {
            ...student.diem,
            [type]: student.diem[type].map((d) =>
              d.id === id
                ? { ...d, giatri: value === "" ? "" : floatValue }
                : d
            ),
          };

          return { ...student, diem: newDiem };
        })
      );
    }
  };

  const handleSaveAll = async (student) => {
    const updates = [];

    console.log('Original grades:', student.diem);

    for (const type of gradeTypes) {
      for (const d of student.diem[type] || []) {
        console.log('Processing grade:', d);
        const parsed = parseFloat(d.giatri);
        if (!isNaN(parsed)) {
          const update = {
            diemid: d.id,  // Use id consistently
            giatri: parsed
          };
          console.log('Adding update:', update);
          updates.push(update);
        }
      }
    }

    console.log('Final updates array:', updates);

    try {
      // Process each update individually
      for (const update of updates) {
        try {
          console.log('Sending update:', {
            diemid: update.diemid,
            giatri: update.giatri
          });

          if (!update.diemid) {
            console.error('Missing diemid:', update);
            throw new Error('Không tìm thấy ID điểm cần cập nhật');
          }

          const res = await fetch(`http://localhost:5000/api/assignments/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              diemid: update.diemid,
              giatri: update.giatri
            }),
          });
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.message || "Lỗi cập nhật điểm");
          }
        } catch (err) {
          console.error(`Lỗi cập nhật điểm cho ${student.hoten}:`, err);
          throw err;
        }
      }
      alert(`HS ${student.hoten}: Cập nhật thành công!`);
    } catch (err) {
      alert("Lỗi khi lưu điểm.");
      console.error(err);
    }
  };

  const calculateAverage = (student) => {
    const allScores = gradeTypes.flatMap((type) =>
      (student.diem[type] || []).map((d) => parseFloat(d.giatri)).filter((v) => !isNaN(v))
    );
    if (allScores.length === 0) return "";
    const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    return avg.toFixed(2);
  };

  return (
    <div className="grade-table-container">
      <h2>Bảng điểm học sinh lớp {tenlop || lopid}</h2>
      <table className="grade-table">
        <thead>
          <tr>
            <th>Mã HS</th>
            <th>Họ tên</th>
            {gradeTypes.map((type) => (
              <th key={type}>{type}</th>
            ))}
            <th>TB Môn</th>
            <th>Lưu</th>
          </tr>
        </thead>
        <tbody>
          {gradesByStudent.length === 0 ? (
            <tr>
              <td colSpan={gradeTypes.length + 4} className="no-data">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            gradesByStudent.map((student) => (
              <tr key={student.mahs}>
                <td>{student.mahs}</td>
                <td>{student.hoten}</td>
                {gradeTypes.map((type) => (
                  <td key={type}>
                    {(student.diem[type] || []).map((d) => (
                    <div key={d.id} className="grade-input-container">
                      <input
                        type="text"
                        value={d.giatri ?? ""}
                        onChange={(e) =>
                          handleChange(student.mahs, type, d.id, e.target.value)
                        }
                      />
                    </div>
                  ))}
                  </td>
                ))}
                <td className="center">{calculateAverage(student)}</td>
                <td className="center">
                  <button className="btn btn-primary" key={student.mahs} onClick={() => handleSaveAll(student)}>Lưu</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GradeTable;
