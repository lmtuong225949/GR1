import React, { useState } from "react";
import "../styles/Creacter.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const UploadForm = ({ title, type }) => {
  const { register, handleSubmit, reset } = useForm();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // 'success' | 'error'

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("filename", data.filename);
    formData.append("file", data.file[0]);
    formData.append("type", type);

    try {
      const response = await fetch("http://localhost:5000/api/learning/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Tải lên thành công!");
        setMessageType("success");
        reset();
      } else {
        setMessage(`Lỗi: ${result.error || "Không rõ lỗi"}`);
        setMessageType("error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Lỗi kết nối đến máy chủ.");
      setMessageType("error");
    }
  };

  return (
    <div className="upload-form p-4 mt-4">
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block mb-1 font-medium">Tên file</label>
            <input
              type="text"
              {...register("filename", { required: true })}
              placeholder={`Nhập tên ${title.toLowerCase()}`}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Chọn file</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
              {...register("file", { required: true })}
            />
          </div>
          <button type="submit">Tải lên {title}</button>
        </form>
        {message && (
          <p className={`text-sm mt-2 ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

const DocumentCreate = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("tailieu");

  return (
    <div className="teacher-learning">
      <div className="teacher-learning-header">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate(-1)}>
            Quay lại
          </button>
          <h2 className="text-xl font-semibold">Tải lên tài liệu mới</h2>
        </div>
        <div className="toggle-buttons space-x-2">
          <button
            onClick={() => setActiveView("tailieu")}
            className={`toggle-btn ${activeView === "tailieu" ? "active" : ""}`}
          >
            Tài liệu
          </button>
          <button
            onClick={() => setActiveView("baigiang")}
            className={`toggle-btn ${activeView === "baigiang" ? "active" : ""}`}
          >
            Bài giảng
          </button>
          <button
            onClick={() => setActiveView("dethi")}
            className={`toggle-btn ${activeView === "dethi" ? "active" : ""}`}
          >
            Đề thi cử
          </button>
        </div>
      </div>

      {activeView === "tailieu" && <UploadForm title="Tài liệu" type="tailieu" />}
      {activeView === "baigiang" && <UploadForm title="Bài giảng" type="baigiang" />}
      {activeView === "dethi" && <UploadForm title="Đề thi cử" type="dethi" />}
    </div>
  );
};

export default DocumentCreate;
