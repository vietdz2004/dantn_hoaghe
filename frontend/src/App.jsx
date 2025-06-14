import React from 'react';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';
import './App.css';

// App: Thành phần gốc của ứng dụng, bọc layout và routes
function App() {
  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}

export default App;
