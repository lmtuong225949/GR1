import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaLock, FaUnlock } from "react-icons/fa";
import "../styles/Users.css";

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="users-modal-backdrop">
    <div className="users-modal">
      <p>{message}</p>
      <div className="users-modal-buttons">
        <button className="user-modal-buttons-yes" onClick={onConfirm}>Đồng ý</button>
        <button className="user-modal-buttons-no" onClick={onCancel}>Hủy</button>
      </div>
    </div>
  </div>
);

const RoleModal = ({ currentRole, onSave, onCancel }) => {
  const [role, setRole] = useState(currentRole);
  return (
    <div className="users-modal-backdrop">
      <div className="users-modal">
        <p>Chọn vai trò mới:</p>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="role-select role-select-inline"
        >
          <option value="admin">Quản trị viên</option>
          <option value="teacher">Giáo viên</option>
          <option value="student">Học sinh</option>
          <option value="parent">Phụ huynh</option>
        </select>
        <div className="users-modal-buttons">
          <button className="user-modal-buttons-yes" onClick={() => onSave(role)}>Lưu</button>
          <button className="user-modal-buttons-no" onClick={onCancel}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

const AddUserModal = ({ onSave, onCancel }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [mahs, setMahs] = useState("");
  const [giaovienid, setGiaovienid] = useState("");
  const [bgh, setBgh] = useState("");
  const [maphuhuynh, setMaphuhuynh] = useState("");

  const handleSubmit = async () => {
    if (!username) return alert("Vui lòng nhập tên đăng nhập.");
    if (!password) return alert("Vui lòng nhập mật khẩu.");
    if (!role) return alert("Vui lòng chọn vai trò.");
  
    const roleLower = role.toLowerCase();
  
    if (!['admin', 'teacher', 'student', 'parent'].includes(roleLower)) {
      return alert("Vai trò không hợp lệ.");
    }
  
    if (roleLower === "student" && !mahs) {
      return alert("Vui lòng nhập mã học sinh (mahs).");
    } else if (roleLower === "teacher" && !giaovienid) {
      return alert("Vui lòng nhập mã giáo viên (giaovienid).");
    } else if (roleLower === "admin" && !bgh) {
      return alert("Vui lòng nhập ID ban giám hiệu (bgh).");
    } else if (roleLower === "parent" && !maphuhuynh) {
      return alert("Vui lòng nhập mã phụ huynh (maphuhuynh).");
    }
  
    const originalGiaovienid = roleLower === 'teacher' ? giaovienid.trim() : giaovienid;

    const userToSend = {
      username,
      password,
      role: roleLower,
      locked: false,
      ...(roleLower === 'student' && { mahs: mahs.trim() }),
      ...(roleLower === 'teacher' && { giaovienid: originalGiaovienid }),
      ...(roleLower === 'admin' && { bgh: parseInt(bgh.trim()) }),
      ...(roleLower === 'parent' && {maphuhuynh: maphuhuynh.trim()})
    };
  
    onSave(userToSend);
  };
  
  return (
    <div className="add-user-modal">
      <div className="add-user-modal-content">
        <h3>Thêm tài khoản mới</h3>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setMahs("");
            setGiaovienid("");
            setBgh("");
            setMaphuhuynh("");
          }}
          className="role-select"
        >
          <option value="admin">Quản trị viên</option>
          <option value="teacher">Giáo viên</option>
          <option value="student">Học sinh</option>
          <option value="parent">Phụ huynh</option>
        </select>

        {role === "student" && (
          <input
            type="text"
            placeholder="Mã học sinh (mahs)"
            value={mahs}
            onChange={(e) => setMahs(e.target.value)}
          />
        )}
        {role === "teacher" && (
          <input
            type="text"
            placeholder="Mã giáo viên (giaovienid)"
            value={giaovienid}
            onChange={(e) => setGiaovienid(e.target.value)}
          />
        )}
        {role === "admin" && (
          <input
            type="number"
            placeholder="ID Ban giám hiệu (bgh)"
            value={bgh}
            onChange={(e) => {
              const value = e.target.value;
              const cleanValue = value.replace(/[^0-9]/g, '');
              setBgh(cleanValue);
            }}
          />
        )}
        {role === "parent" && (
          <input
            type="number"
            placeholder="Mã phụ huynh (maphuhuynh)"
            value={maphuhuynh}
            onChange={(e) => {
              const value = e.target.value;
              const cleanValue = value.replace(/[^0-9]/g, '');
              setBgh(cleanValue);
            }}
          />
        )}


        <div className="add-user-modal-buttons">
          <button onClick={handleSubmit}>Thêm</button>
          <button onClick={onCancel}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 50;
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi khi tải dữ liệu");
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
    }
  };

  useEffect(() => {
    let result = users;
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.hoten && user.hoten.toLowerCase().includes(term)) ||
        (user.username && user.username.toLowerCase().includes(term))
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}/delete`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(await res.text());
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Lỗi khi xoá tài khoản:", err);
    }
  };

  const handleToggleLock = async (id, currentLocked) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}/lock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ locked: !currentLocked })
      });
      if (!res.ok) throw new Error(await res.text());
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, locked: !currentLocked } : u))
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái khóa:", err);
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error(await res.text());
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
      setEditRole(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật vai trò:", err);
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      console.log('Attempting to add user:', newUser);
      
      const usernameTrim = newUser.username?.trim();
      const passwordTrim = newUser.password?.trim(); 
      const roleLower = newUser.role?.toLowerCase();
      
      if (!usernameTrim || !passwordTrim || !roleLower) {
        return alert("Thiếu thông tin tài khoản cơ bản");
      }
      
      if (roleLower === "student" && !newUser.mahs?.trim()) {
        return alert("Thiếu mã học sinh");
      }
      if (roleLower === "teacher" && !newUser.giaovienid?.trim()) {
        return alert("Thiếu mã giáo viên");
      }
      if (roleLower === "admin" && !newUser.bgh) {
        return alert("Thiếu ID ban giám hiệu");
      }
      if (roleLower === "parent" && !newUser.maphuhuynh?.trim()) {
        return alert("Thiếu mã phụ huynh");
      }

      const userToSend = {
        username: usernameTrim,
        password: passwordTrim,
        role: roleLower,
        locked: false,
        ...(roleLower === 'student' && { mahs: newUser.mahs.trim() }),
        ...(roleLower === 'teacher' && { giaovienid: newUser.giaovienid.trim() }),
        ...(roleLower === 'admin' && { bgh: Number(newUser.bgh) }),
        ...(roleLower === 'parent' && { maphuhuynh: newUser.maphuhuynh.trim() })
      };
      

      console.log('Sending to server:', userToSend);

      const res = await fetch("http://localhost:5000/api/users/add", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userToSend)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Lỗi không xác định';
        console.error('Server error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      console.log('User added successfully:', data);
      setUsers((prev) => [...prev, data]);
      setShowAddModal(false);
      alert("Thêm tài khoản thành công!");
    } catch (err) {
      console.error("Lỗi chi tiết khi thêm tài khoản:", err);
      alert(err.message || "Không thể thêm tài khoản. Có thể tên đăng nhập đã tồn tại hoặc thông tin không hợp lệ.");
    }
  };
  // Get current users for the current page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  return (
    <div className="users-page">
      <div className="users-header">
        <h2>Quản lý tài khoản người dùng</h2>
        <div className="users-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc tên đăng nhập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="role-filter"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="teacher">Giáo viên</option>
              <option value="student">Học sinh</option>
              <option value="parent">Phụ huynh</option>
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} className="add-user-btn">
            Thêm tài khoản
          </button>
        </div>
      </div>
      <div className="users-count">
        Tổng số: {filteredUsers.length} tài khoản | Trang {currentPage} / {totalPages}
      </div>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên đăng nhập</th>
            <th>Vai trò</th>
            <th>Họ tên</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{user.hoten || "(Không có)"}</td>
              <td>{user.locked ? "Đã khóa" : "Hoạt động"}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() =>
                    setEditRole({ id: user.id, currentRole: user.role })
                  }
                  title="Sửa vai trò"
                >
                  <FaEdit />
                </button>
                <button
                  className="lock-btn"
                  onClick={() => handleToggleLock(user.id, user.locked)}
                  title={user.locked ? "Mở khóa" : "Khóa"}
                >
                  {user.locked ? <FaUnlock /> : <FaLock />}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setConfirmDelete(user.id)}
                  title="Xoá tài khoản"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(1)} 
            disabled={currentPage === 1}
            className="page-btn"
          >
            Đầu
          </button>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="page-btn"
          >
            Trước
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show 2 pages before and after current page
            let pageNumber;
            if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            if (pageNumber < 1 || pageNumber > totalPages) return null;
            
            return (
              <button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                className={`page-btn ${currentPage === pageNumber ? 'active' : ''}`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Tiếp
          </button>
          <button 
            onClick={() => paginate(totalPages)} 
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Cuối
          </button>
        </div>
      )}

      {confirmDelete !== null && (
        <ConfirmModal
          message="Bạn có chắc chắn muốn xoá tài khoản này?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {editRole !== null && (
        <RoleModal
          currentRole={editRole.currentRole}
          onSave={(newRole) => handleUpdateRole(editRole.id, newRole)}
          onCancel={() => setEditRole(null)}
        />
      )}

      {showAddModal && (
        <AddUserModal
          onSave={handleAddUser}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};  