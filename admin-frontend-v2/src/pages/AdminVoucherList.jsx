import React, { useEffect, useState } from "react";
import voucherService from "../services/voucherService";
import VoucherForm from "../components/VoucherForm";

const PAGE_SIZE = 10;

// Trang quản lý voucher cho admin
// - Hiển thị danh sách voucher, filter, phân trang, thêm/sửa/xóa voucher
export default function AdminVoucherList() {
  // State quản lý dữ liệu voucher, loading, lỗi, popup form, filter, phân trang
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Hàm load danh sách voucher từ API, có filter/search/phân trang
  const loadVouchers = () => {
    setLoading(true);
    voucherService.getAll({ search, dateFrom, dateTo, page, limit: PAGE_SIZE })
      .then(res => {
        setVouchers(res.data.data || res.data.vouchers || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      })
      .catch(err => setError(err.response?.data?.message || "Lỗi tải voucher"))
      .finally(() => setLoading(false));
  };

  // Khi filter/search/page thay đổi thì load lại voucher
  useEffect(() => {
    loadVouchers();
    // eslint-disable-next-line
  }, [search, dateFrom, dateTo, page]);

  // Mở popup thêm voucher
  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };
  // Mở popup sửa voucher
  const handleEdit = (item) => {
    setEditData(item);
    setShowForm(true);
  };
  // Xóa voucher (có confirm)
  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa voucher?")) return;
    await voucherService.delete(id);
    loadVouchers();
  };
  // Submit form thêm/sửa voucher
  const handleSubmit = async (formData) => {
    if (editData) await voucherService.update(editData.id_voucher, formData);
    else await voucherService.create(formData);
    loadVouchers();
  };

  return (
    <div>
      <h2>Quản lý voucher</h2>
      {/* Bộ lọc tìm kiếm, ngày bắt đầu, ngày hết hạn */}
      <div style={{display:'flex',gap:12,marginBottom:16}}>
        <input placeholder="Tìm kiếm mã voucher..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{padding:8,borderRadius:4,border:'1px solid #ddd',minWidth:180}} />
        <label>Ngày bắt đầu: <input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPage(1);}} /></label>
        <label>Ngày hết hạn: <input type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPage(1);}} /></label>
      </div>
      {/* Nút thêm voucher */}
      <button style={{marginBottom: 16}} onClick={handleAdd}>+ Thêm voucher</button>
      {/* Hiển thị trạng thái loading/lỗi */}
      {loading && <div>Đang tải...</div>}
      {error && <div style={{color:'#c9184a'}}>{error}</div>}
      {/* Bảng voucher */}
      <table style={{width:'100%', background:'#fff', borderRadius:8, boxShadow:'0 2px 8px #0001'}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Mã voucher</th>
            <th>Giá trị giảm</th>
            <th>Điều kiện</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày hết hạn</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map(v => (
            <tr key={v.id_voucher}>
              <td>{v.id_voucher}</td>
              <td>{v.maVoucher}</td>
              <td>{v.giaTriGiam?.toLocaleString('vi-VN')}</td>
              <td>{v.dieuKienApDung || '-'}</td>
              <td>{v.ngayBatDau ? new Date(v.ngayBatDau).toLocaleDateString('vi-VN') : '-'}</td>
              <td>{v.ngayHetHan ? new Date(v.ngayHetHan).toLocaleDateString('vi-VN') : '-'}</td>
              <td>
                <button onClick={() => handleEdit(v)}>Sửa</button>
                <button style={{color:'#c9184a'}} onClick={() => handleDelete(v.id_voucher)}>Xóa</button>
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
      {/* Popup form thêm/sửa voucher */}
      <VoucherForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} initialData={editData} />
    </div>
  );
} 