import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const periodOptions = [
  { label: "7 ngày", value: "7d" },
  { label: "30 ngày", value: "30d" },
  { label: "12 tháng", value: "12m" },
];

export default function AdminReportPage() {
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadData = () => {
    setLoading(true);
    let params = {};
    if (dateFrom && dateTo) {
      params = { startDate: dateFrom, endDate: dateTo };
    } else {
      params = { period };
    }
    Promise.all([
      axios.get("/admin/dashboard/revenue-chart", { params }),
      axios.get("/admin/dashboard/top-products?limit=5"),
      axios.get("/admin/dashboard/order-stats"),
      axios.get("/admin/dashboard/recent-activities?limit=10")
    ]).then(([rev, top, stats, act]) => {
      setRevenueData(rev.data.data?.chart || []);
      setTopProducts(top.data.data || []);
      setOrderStats(stats.data.data || []);
      setActivities(act.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [period, dateFrom, dateTo]);

  return (
    <div>
      <h2>Báo cáo & Thống kê</h2>
      <div style={{display:'flex',gap:12,alignItems:'center',margin:'16px 0'}}>
        <span>Lọc doanh thu:</span>
        {periodOptions.map(opt => (
          <button key={opt.value} onClick={()=>{setPeriod(opt.value);setDateFrom("");setDateTo("");}} style={{padding:'6px 14px',borderRadius:4,background:period===opt.value?'#22223b':'#eee',color:period===opt.value?'#fff':'#222',border:'none',cursor:'pointer'}}>{opt.label}</button>
        ))}
        <span>hoặc</span>
        <input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPeriod("");}} />
        <span>đến</span>
        <input type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPeriod("");}} />
        <button onClick={loadData} style={{padding:'6px 14px',borderRadius:4,background:'#4a4e69',color:'#fff',border:'none'}}>Lọc</button>
      </div>
      {loading && <div>Đang tải dữ liệu...</div>}
      <div style={{marginTop:32, marginBottom:32}}>
        <h3>Biểu đồ doanh thu</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={v=>v?.toLocaleString('vi-VN')+" đ"} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
            <Line type="monotone" dataKey="orderCount" stroke="#82ca9d" name="Số đơn" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{display:'flex',gap:32,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:320}}>
          <h3>Top 5 sản phẩm bán chạy</h3>
          <table style={{width:'100%',background:'#fff',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
            <thead><tr><th>Tên SP</th><th>SL bán</th><th>Doanh thu</th></tr></thead>
            <tbody>
              {topProducts.map(p=>(
                <tr key={p.id}><td>{p.name}</td><td>{p.totalSold}</td><td>{p.totalRevenue?.toLocaleString('vi-VN')}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{flex:1,minWidth:320}}>
          <h3>Đơn hàng theo trạng thái</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={orderStats} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="status" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name="Số đơn" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{marginTop:32}}>
        <h3>Hoạt động gần đây</h3>
        <ul style={{background:'#fff',borderRadius:8,boxShadow:'0 2px 8px #0001',padding:16}}>
          {activities.map((a,i)=>(
            <li key={i} style={{marginBottom:8}}>
              <b>{a.type}</b>: {a.title} <span style={{color:'#888'}}>({a.status})</span> - {a.createdAt ? new Date(a.createdAt).toLocaleString('vi-VN') : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 