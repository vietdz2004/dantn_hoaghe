import React, { useState } from "react";

export default function VoucherForm({ open, onClose, onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    maVoucher: initialData.maVoucher || "",
    giaTriGiam: initialData.giaTriGiam || "",
    dieuKienApDung: initialData.dieuKienApDung || "",
    ngayBatDau: initialData.ngayBatDau ? initialData.ngayBatDau.slice(0,10) : "",
    ngayHetHan: initialData.ngayHetHan ? initialData.ngayHetHan.slice(0,10) : "",
  });
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.message || "Lỗi gửi dữ liệu");
    }
  };

  return (
    <div className="modal-bg">
      <form className="modal" onSubmit={handleSubmit}>
        <h3>{initialData.id_voucher ? "Sửa voucher" : "Thêm voucher"}</h3>
        <input name="maVoucher" placeholder="Mã voucher" value={form.maVoucher} onChange={handleChange} required />
        <input name="giaTriGiam" type="number" placeholder="Giá trị giảm" value={form.giaTriGiam} onChange={handleChange} required />
        <input name="dieuKienApDung" placeholder="Điều kiện áp dụng" value={form.dieuKienApDung} onChange={handleChange} />
        <label>Ngày bắt đầu: <input name="ngayBatDau" type="date" value={form.ngayBatDau} onChange={handleChange} /></label>
        <label>Ngày hết hạn: <input name="ngayHetHan" type="date" value={form.ngayHetHan} onChange={handleChange} /></label>
        {error && <div className="error">{error}</div>}
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <button type="submit">Lưu</button>
          <button type="button" onClick={onClose}>Hủy</button>
        </div>
      </form>
      <style>{`
        .modal-bg {position:fixed;top:0;left:0;right:0;bottom:0;background:#0008;z-index:1000;display:flex;align-items:center;justify-content:center;}
        .modal {background:#fff;padding:24px 32px;border-radius:8px;min-width:340px;display:flex;flex-direction:column;gap:12px;box-shadow:0 2px 16px #0002;}
        .modal h3 {margin:0 0 8px 0;}
        .modal input, .modal textarea, .modal select {padding:8px;border:1px solid #ddd;border-radius:4px;}
        .modal .error {color:#c9184a;}
      `}</style>
    </div>
  );
} 