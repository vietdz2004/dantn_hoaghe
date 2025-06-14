import React from 'react';
import Header from '../components/Header';

// MainLayout: Layout chính cho toàn bộ ứng dụng, chứa header và phần nội dung
const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
        {children}
      </div>
    </>
  );
};

export default MainLayout; 