import React, { useState } from "react";

const statusOptions = [
  "CHO_XAC_NHAN",
  "DA_XAC_NHAN",
  "DANG_GIAO",
  "DA_GIAO",
  "DA_HUY"
];

export default function OrderDetailModal({ open, onClose, order, onStatusChange }) {
  const [status, setStatus] = useState(order?.trangThaiDonHang || "");
  const [updating, setUpdating] = useState(false);
  if (!open || !order) return null;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setUpdating(true);
    await onStatusChange(newStatus);
    setUpdating(false);
  };

  return (
    <div className="modal-bg">
      <div className="modal" style={{minWidth:400}}>
        <h3>Chi tiết đơn hàng #{order.id_DonHang}</h3>
        <div><b>Khách hàng:</b> {order.customerName || order.tenKhachHang || order.id_NguoiDung}</div>
        <div><b>Ngày đặt:</b> {order.ngayDatHang ? new Date(order.ngayDatHang).toLocaleString('vi-VN') : '-'}</div>
        <div><b>Trạng thái:</b> {updating ? 'Đang cập nhật...' : (
          <select value={status} onChange={handleStatusChange} disabled={updating}>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}</div>
        <div><b>Tổng tiền:</b> {order.tongThanhToan?.toLocaleString('vi-VN')} đ</div>
        <div><b>Phương thức thanh toán:</b> {order.phuongThucThanhToan || '-'}</div>
        <div><b>Voucher:</b> {order.id_voucher || '-'}</div>
        <div style={{marginTop:12}}><b>Sản phẩm trong đơn:</b></div>
        <table style={{width:'100%',marginTop:4}}>
          <thead>
            <tr>
              <th>Tên SP</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {(order.OrderDetails || order.orderDetails || []).map(item => (
              <tr key={item.id_ChiTietDH}>
                <td>{item.tenSp || item.productName || item.id_SanPham}</td>
                <td>{item.soLuongMua}</td>
                <td>{item.donGiaLucMua?.toLocaleString('vi-VN')}</td>
                <td>{item.thanhTien?.toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display:'flex',gap:8,marginTop:16}}>
          <button onClick={onClose}>Đóng</button>
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