import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import styles from './MainLayout.module.scss';
import Footer from '../components/Footer';

// MainLayout: Layout chính cho toàn bộ ứng dụng, chứa header và phần nội dung
const MainLayout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Optimize scroll handler with throttling
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const shouldScroll = scrollY > 80;
    
    if (shouldScroll !== isScrolled) {
      setIsScrolled(shouldScroll);
    }
  }, [isScrolled]);

  // Effect for handling scroll with passive listener
  useEffect(() => {
    // Throttle scroll events for better performance
    let timeoutId = null;
    const throttledScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  return (
    <>
      <Header isScrolled={isScrolled} />
      <main className={styles.contentWrap}>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout; 