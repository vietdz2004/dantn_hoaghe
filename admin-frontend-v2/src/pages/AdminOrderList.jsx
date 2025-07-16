import React, { useEffect, useState } from "react";
import orderService from "../services/orderService";
import OrderDetailModal from "../components/OrderDetailModal";

const statusOptions = ["", "CHO_XAC_NHAN", "DA_XAC_NHAN", "DANG_GIAO", "DA_GIAO", "DA_HUY"];
const PAGE_SIZE = 10;

// Trang quản lý đơn hàng cho admin
// - Hiển thị danh sách đơn hàng, filter, phân trang, xem chi tiết, cập nhật trạng thái
export default function AdminOrderList() {
  // State quản lý dữ liệu đơn hàng, loading, lỗi, popup chi tiết, filter, phân trang
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Hàm load danh sách đơn hàng từ API, có filter/search/phân trang
  const loadOrders = () => {
    setLoading(true);
    orderService.getAll({ search, trangThaiDonHang: status, page, limit: PAGE_SIZE })
      .then(res => {
        setOrders(res.data.data || res.data.orders || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      })
      .catch(err => setError(err.response?.data?.message || "Lỗi tải đơn hàng"))
      .finally(() => setLoading(false));
  };

  // Khi filter/search/page thay đổi thì load lại đơn hàng
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line
  }, [search, status, page]);

  // Mở popup chi tiết đơn hàng
  const handleShowDetail = async (id) => {
    setDetailLoading(true);
    const res = await orderService.getById(id);
    setSelectedOrder(res.data.data || res.data);
    setShowDetail(true);
    setDetailLoading(false);
  };

  // Cập nhật trạng thái đơn hàng
  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    await orderService.update(selectedOrder.id_DonHang, { trangThaiDonHang: newStatus });
    // Reload chi tiết đơn hàng
    const res = await orderService.getById(selectedOrder.id_DonHang);
    setSelectedOrder(res.data.data || res.data);
    loadOrders();
  };

  return (
    <div>
      <h2>Quản lý đơn hàng</h2>
      {/* Bộ lọc tìm kiếm, trạng thái */}
      <div style={{display:'flex',gap:12,marginBottom:16}}>
        <input placeholder="Tìm kiếm mã đơn, tên khách, SĐT..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{padding:8,borderRadius:4,border:'1px solid #ddd',minWidth:200}} />
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} style={{padding:8,borderRadius:4}}>
          {statusOptions.map(s=>(<option key={s} value={s}>{s ? s : 'Tất cả trạng thái'}</option>))}
        </select>
      </div>
      {/* Hiển thị trạng thái loading/lỗi */}
      {loading && <div>Đang tải...</div>}
      {error && <div style={{color:'#c9184a'}}>{error}</div>}
      {/* Bảng đơn hàng */}
      <table style={{width:'100%', background:'#fff', borderRadius:8, boxShadow:'0 2px 8px #0001'}}>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id_DonHang}>
              <td>{o.id_DonHang}</td>
              <td>{o.customerName || o.tenKhachHang || o.id_NguoiDung || '-'}</td>
              <td>{o.ngayDatHang ? new Date(o.ngayDatHang).toLocaleString('vi-VN') : '-'}</td>
              <td>{o.tongThanhToan?.toLocaleString('vi-VN') || '-'}</td>
              <td>{o.trangThaiDonHang}</td>
              <td>
                <button onClick={() => handleShowDetail(o.id_DonHang)}>Xem</button>
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
      {/* Popup chi tiết đơn hàng */}
      <OrderDetailModal open={showDetail} onClose={() => setShowDetail(false)} order={selectedOrder} onStatusChange={handleStatusChange} />
      {detailLoading && <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'#0004',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:24}}>Đang tải chi tiết...</div>}
    </div>
  );
} 