import React, { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import "../styles/DocumentList.css";
import { useNavigate } from "react-router-dom";

const DocumentList = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [fileMap, setFileMap] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [filterType, setFilterType] = useState("all"); // Mặc định là 'tailieu'

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        if (filterType === "all") {
          // Fetch all document types
          const [tailieuRes, baigiangRes, dethiRes] = await Promise.all([
            fetch("http://localhost:5000/api/learning/list/tailieu"),
            fetch("http://localhost:5000/api/learning/list/baigiang"),
            fetch("http://localhost:5000/api/learning/list/dethi")
          ]);

          const [tailieuData, baigiangData, dethiData] = await Promise.all([
            tailieuRes.json(),
            baigiangRes.json(),
            dethiRes.json()
          ]);

          // Combine all documents into one array
          const allDocs = [...tailieuData, ...baigiangData, ...dethiData];
          setDocs(allDocs);
        } else {
          // Fetch specific type
          const res = await fetch(`http://localhost:5000/api/learning/list/${filterType}`);
          const data = await res.json();
          setDocs(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải tài liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [refresh, filterType]);

  const handleRename = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/learning/rename/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });
      if (res.ok) {
        setEditId(null);
        setRefresh(!refresh);
      }
    } catch (err) {
      console.error("Lỗi đổi tên:", err);
    }
  };

  const handleReplace = async (id) => {
    const file = fileMap[id];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:5000/api/learning/replace/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        setFileMap((prev) => ({ ...prev, [id]: null }));
        setRefresh(!refresh);
      }
    } catch (err) {
      console.error("Lỗi thay file:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá tài liệu này?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/learning/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRefresh(!refresh);
      }
    } catch (err) {
      console.error("Lỗi xoá tài liệu:", err);
    }
  };

  return (
    <div className="document-list">
      <h2 className="document-list__title">Danh sách tài liệu</h2>

      <div className="document-list__actions">
        <Button onClick={() => navigate("/teacher/document/create")}>
          + Tải lên tài liệu mới
        </Button>
      </div>

      <div className="document-list__filters">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          onClick={() => setFilterType("all")}
        >
          Tất cả
        </Button>
        <Button
          variant={filterType === "tailieu" ? "default" : "outline"}
          onClick={() => setFilterType("tailieu")}
        >
          Tài liệu
        </Button>
        <Button
          variant={filterType === "baigiang" ? "default" : "outline"}
          onClick={() => setFilterType("baigiang")}
        >
          Bài giảng
        </Button>
        <Button
          variant={filterType === "dethi" ? "default" : "outline"}
          onClick={() => setFilterType("dethi")}
        >
          Đề thi
        </Button>
      </div>

      {loading ? (
        <p className="document-list__status">Đang tải...</p>
      ) : docs.length === 0 ? (
        <p className="document-list__status">Không có tài liệu.</p>
      ) : (
        <ul className="document-list__items">
          {docs.map((doc) => (
            <li key={doc.id} className="document-list__item">
              <div className="document-list__info">
                {editId === doc.id ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="document-list__input"
                  />
                ) : (
                  <>
                    <strong className="document-list__name">{doc.title}</strong>
                    <span className="document-list__date">
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </span>
                  </>
                )}
                <a
                  href={`http://localhost:5000/api/learning/download/${doc.id}`}
                  className="document-list__download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tải xuống
                </a>
              </div>

              <div className="document-list__controls">
                {editId === doc.id ? (
                  <>
                    <Button size="sm" onClick={() => handleRename(doc.id)}>Lưu</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditId(null)}>Huỷ</Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => { setEditId(doc.id); setEditTitle(doc.title); }}>
                    Sửa tên
                  </Button>
                )}

                <div className="document-list__file-container">
                  <input
                    type="file"
                    className="document-list__file"
                    id={`file-upload-${doc.id}`}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setFileMap((prev) => ({ ...prev, [doc.id]: file }));
                    }}
                  />
                  <label htmlFor={`file-upload-${doc.id}`} className="document-list__file-label">
                    {fileMap[doc.id]?.name || 'Chọn file'}
                  </label>
                  {fileMap[doc.id] && (
                    <button
                      className="document-list__clear-btn"
                      onClick={() => {
                        setFileMap((prev) => ({ ...prev, [doc.id]: null }));
                        document.getElementById(`file-upload-${doc.id}`).value = '';
                      }}
                      title="Xoá file đã chọn"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <Button size="sm" onClick={() => handleReplace(doc.id)} disabled={!fileMap[doc.id]}>
                  Thay file
                </Button>

                <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                  Xoá
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentList;
