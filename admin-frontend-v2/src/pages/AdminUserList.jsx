import React, { useEffect, useState } from "react";
import userService from "../services/userService";
import UserDetailModal from "../components/UserDetailModal";

const roleOptions = ["", "KHACH_HANG", "NHAN_VIEN", "QUAN_LY"];
const statusOptions = ["", "HOAT_DONG", "DA_KHOA", "TAM_KHOA"];
const PAGE_SIZE = 10;

// Trang quản lý người dùng cho admin
// - Hiển thị danh sách user, filter, phân trang, xem chi tiết, cập nhật trạng thái/quyền
export default function AdminUserList() {
  // State quản lý dữ liệu user, loading, lỗi, popup chi tiết, filter, phân trang
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Hàm load danh sách user từ API, có filter/search/phân trang
  const loadUsers = () => {
    setLoading(true);
    userService.getAll({ search, vaiTro: role, status, page, limit: PAGE_SIZE })
      .then(res => {
        setUsers(res.data.data || res.data.users || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      })
      .catch(err => setError(err.response?.data?.message || "Lỗi tải người dùng"))
      .finally(() => setLoading(false));
  };

  // Khi filter/search/page thay đổi thì load lại user
  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, [search, role, status, page]);

  // Mở popup chi tiết user
  const handleShowDetail = async (id) => {
    setDetailLoading(true);
    const res = await userService.getById(id);
    setSelectedUser(res.data.data || res.data);
    setShowDetail(true);
    setDetailLoading(false);
  };

  // Cập nhật trạng thái/quyền user
  const handleUpdate = async (data) => {
    if (!selectedUser) return;
    await userService.update(selectedUser.id_NguoiDung, data);
    // Reload chi tiết user
    const res = await userService.getById(selectedUser.id_NguoiDung);
    setSelectedUser(res.data.data || res.data);
    loadUsers();
  };

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      {/* Bộ lọc tìm kiếm, vai trò, trạng thái */}
      <div style={{display:'flex',gap:12,marginBottom:16}}>
        <input placeholder="Tìm kiếm tên, email, SĐT..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{padding:8,borderRadius:4,border:'1px solid #ddd',minWidth:200}} />
        <select value={role} onChange={e=>{setRole(e.target.value);setPage(1);}} style={{padding:8,borderRadius:4}}>
          {roleOptions.map(r=>(<option key={r} value={r}>{r ? r : 'Tất cả vai trò'}</option>))}
        </select>
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} style={{padding:8,borderRadius:4}}>
          {statusOptions.map(s=>(<option key={s} value={s}>{s ? s : 'Tất cả trạng thái'}</option>))}
        </select>
      </div>
      {/* Hiển thị trạng thái loading/lỗi */}
      {loading && <div>Đang tải...</div>}
      {error && <div style={{color:'#c9184a'}}>{error}</div>}
      {/* Bảng user */}
      <table style={{width:'100%', background:'#fff', borderRadius:8, boxShadow:'0 2px 8px #0001'}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id_NguoiDung}>
              <td>{u.id_NguoiDung}</td>
              <td>{u.ten}</td>
              <td>{u.email}</td>
              <td>{u.soDienThoai}</td>
              <td>{u.vaiTro}</td>
              <td>{u.trangThai}</td>
              <td>{u.ngayTao ? new Date(u.ngayTao).toLocaleDateString('vi-VN') : '-'}</td>
              <td>
                <button onClick={() => handleShowDetail(u.id_NguoiDung)}>Xem</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Phân trang */}
      <div style={{marginTop:16,display:'flex',gap:8,alignItems:'center'}}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Trang trước</button>
        <span>Trang {page} / {totalPages}</span>
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Trang sau</button>
      </div>
      {/* Popup chi tiết user */}
      <UserDetailModal open={showDetail} onClose={() => setShowDetail(false)} user={selectedUser} onUpdate={handleUpdate} />
      {detailLoading && <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'#0004',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:24}}>Đang tải chi tiết...</div>}
    </div>
  );
} 