import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import "../styles/DocumentList.css";

const DocumentList = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        if (filterType === "all") {
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

          const allDocs = [...tailieuData, ...baigiangData, ...dethiData];
          setDocs(allDocs);
        } else {
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
  }, [filterType]);

  return (
    <div className="document-list">
      <h2 className="document-list__title">Danh sách tài liệu</h2>

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
                <strong className="document-list__name">{doc.title}</strong>
                <span className="document-list__date">
                  {new Date(doc.uploaded_at).toLocaleString()}
                </span>
                <a
                  href={`http://localhost:5000/api/learning/download/${doc.id}`}
                  className="document-list__download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tải xuống
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentList;

