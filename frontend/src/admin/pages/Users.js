import React, { useEffect, useState } from "react";
import "../styles/Users.css";
import { FaEdit, FaTrash, FaLock, FaUnlock } from "react-icons/fa";

// Modal xác nhận xoá
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal">
      <p>{message}</p>
      <div className="modal-buttons">
        <button onClick={onConfirm}>Đồng ý</button>
        <button onClick={onCancel}>Hủy</button>
      </div>
    </div>
  </div>
);

// Modal chỉnh vai trò
const RoleModal = ({ currentRole, onSave, onCancel }) => {
  const [role, setRole] = useState(currentRole);
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>Chọn vai trò mới:</p>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="role-select role-select-inline"
        >
          <option value="admin">Quản trị viên</option>
          <option value="teacher">Giáo viên</option>
          <option value="student">Học sinh</option>
        </select>
        <div className="modal-buttons">
          <button onClick={() => onSave(role)}>Lưu</button>
          <button onClick={onCancel}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

// Modal thêm tài khoản (đã cập nhật logic cho từng vai trò)
const AddUserModal = ({ onSave, onCancel }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [mahs, setMahs] = useState("");
  const [giaovienid, setGiaovienid] = useState("");
  const [bgh, setBgh] = useState("");

  const handleSubmit = () => {
    // Validate all required fields
    const usernameTrim = username?.trim();
    const passwordTrim = password?.trim();
    const roleTrim = role?.trim();
    const roleLower = roleTrim?.toLowerCase();

    if (!usernameTrim) {
      return alert("Vui lòng nhập tên đăng nhập.");
    }
    if (!passwordTrim) {
      return alert("Vui lòng nhập mật khẩu.");
    }
    if (!roleTrim) {
      return alert("Vui lòng chọn vai trò.");
    }
    if (!['admin', 'teacher', 'student'].includes(roleLower)) {
      return alert("Vai trò không hợp lệ.");
    }

    // Validate role-specific fields
    if (roleLower === "student" && !mahs?.trim()) {
      return alert("Vui lòng nhập mã học sinh (mahs).\n\nLưu ý: Các trường bao gồm:\n- Tên đăng nhập\n- Mật khẩu\n- Mã học sinh");
    } else if (roleLower === "teacher" && !giaovienid?.trim()) {
      return alert("Vui lòng nhập mã giáo viên (giaovienid).\n\nLưu ý: Các trường bao gồm:\n- Tên đăng nhập\n- Mật khẩu\n- Mã giáo viên");
    } else if (roleLower === "admin" && !bgh?.trim()) {
      return alert("Vui lòng nhập ID ban giám hiệu (bgh).\n\nLưu ý: Các trường bao gồm:\n- Tên đăng nhập\n- Mật khẩu\n- ID ban giám hiệu");
    }

    // Create user object with all required fields and role-specific fields
    const newUser = {
      username: usernameTrim,
      password: passwordTrim,
      role: roleLower,
      locked: false,
      ...(roleLower === 'student' && { mahs: mahs.trim().padStart(10, '0') }),
      ...(roleLower === 'teacher' && { giaovienid: giaovienid.trim().padStart(10, '0') }),
      ...(roleLower === 'admin' && { bgh: parseInt(bgh.trim()) })
    };

    // Debug log to check the data being sent
    console.log('Sending user data:', newUser);

    // Pass the complete user object to onSave
    onSave(newUser);
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
          }}
          className="role-select"
        >
          <option value="admin">Quản trị viên</option>
          <option value="teacher">Giáo viên</option>
          <option value="student">Học sinh</option>
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
              // Remove any non-numeric characters
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
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi khi tải dữ liệu");
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
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
      
      // Add extra validation before sending to server
      const usernameTrim = newUser.username?.trim();
      const passwordTrim = newUser.passwordhash?.trim(); // Check passwordhash instead of password
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

      // Create a copy of the user object with proper field names
      const userToSend = {
        username: usernameTrim,
        passwordhash: passwordTrim,
        role: roleLower,
        locked: false,
        // Add role-specific fields
        ...(roleLower === 'student' && { mahs: newUser.mahs.trim().padStart(10, '0') }),
        ...(roleLower === 'teacher' && { giaovienid: newUser.giaovienid.trim().padStart(10, '0') }),
        ...(roleLower === 'admin' && { bgh: parseInt(newUser.bgh.trim()) })
      };

      console.log('Sending to server:', userToSend);

      const res = await fetch("http://localhost:5000/api/users/add", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userToSend)
      });

      // Handle response
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
  return (
    <div className="users-page">
      <h2>Quản lý tài khoản người dùng</h2>
      <button onClick={() => setShowAddModal(true)}>Thêm tài khoản</button>
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
          {users.map((user, index) => (
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