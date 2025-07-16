import React, { useState } from "react";

const roleOptions = ["KHACH_HANG", "NHAN_VIEN", "QUAN_LY"];
const statusOptions = ["HOAT_DONG", "DA_KHOA", "TAM_KHOA"];

export default function UserDetailModal({ open, onClose, user, onUpdate }) {
  const [role, setRole] = useState(user?.vaiTro || "");
  const [status, setStatus] = useState(user?.trangThai || "");
  const [updating, setUpdating] = useState(false);
  if (!open || !user) return null;

  const handleUpdate = async () => {
    setUpdating(true);
    await onUpdate({ vaiTro: role, trangThai: status });
    setUpdating(false);
  };

  return (
    <div className="modal-bg">
      <div className="modal" style={{minWidth:400}}>
        <h3>Chi tiết người dùng #{user.id_NguoiDung}</h3>
        <div><b>Tên:</b> {user.ten}</div>
        <div><b>Email:</b> {user.email}</div>
        <div><b>SĐT:</b> {user.soDienThoai}</div>
        <div><b>Địa chỉ:</b> {user.diaChi || '-'}</div>
        <div><b>Ngày tạo:</b> {user.ngayTao ? new Date(user.ngayTao).toLocaleString('vi-VN') : '-'}</div>
        <div><b>Vai trò:</b> <select value={role} onChange={e=>setRole(e.target.value)} disabled={updating}>{roleOptions.map(r=>(<option key={r} value={r}>{r}</option>))}</select></div>
        <div><b>Trạng thái:</b> <select value={status} onChange={e=>setStatus(e.target.value)} disabled={updating}>{statusOptions.map(s=>(<option key={s} value={s}>{s}</option>))}</select></div>
        <div><b>Tổng đơn hàng:</b> {user.totalOrders || 0}</div>
        <div><b>Tổng chi tiêu:</b> {user.totalSpent?.toLocaleString('vi-VN') || 0} đ</div>
        <div style={{marginTop:12}}><b>Đơn hàng gần đây:</b></div>
        <table style={{width:'100%',marginTop:4}}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
              <th>Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {(user.recentOrders || []).map(o => (
              <tr key={o.id_DonHang}>
                <td>{o.id_DonHang}</td>
                <td>{o.ngayDatHang ? new Date(o.ngayDatHang).toLocaleString('vi-VN') : '-'}</td>
                <td>{o.trangThaiDonHang}</td>
                <td>{o.tongThanhToan?.toLocaleString('vi-VN') || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display:'flex',gap:8,marginTop:16}}>
          <button onClick={onClose}>Đóng</button>
          <button onClick={handleUpdate} disabled={updating}>Cập nhật</button>
        </div>
      </div>
      <style>{`
        .modal-bg {position:fixed;top:0;left:0;right:0;bottom:0;background:#0008;z-index:1000;display:flex;align-items:center;justify-content:center;}
        .modal {background:#fff;padding:24px 32px;border-radius:8px;min-width:340px;display:flex;flex-direction:column;gap:12px;box-shadow:0 2px 16px #0002;}
        .modal h3 {margin:0 0 8px 0;}
        .modal input, .modal textarea, .modal select {padding:8px;border:1px solid #ddd;border-radius:4px;}
      `}</style>
    </div>
  );
} 