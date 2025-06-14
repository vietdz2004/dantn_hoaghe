import React, { useState } from 'react';
import styles from '../pages/HomePage.module.css';

const banners = [
  { src: '/banner-hoa-1.jpg', alt: 'Banner 1' },
  { src: '/banner-hoa-2.jpg', alt: 'Banner 2' },
  { src: '/banner-hoa-3.jpg', alt: 'Banner 3' },
];

const BannerSlider = () => {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((idx + 1) % banners.length);
  const prev = () => setIdx((idx - 1 + banners.length) % banners.length);

  return (
    <div className={styles.bannerSlider}>
      <button onClick={prev} style={{background:'none',border:'none',fontSize:28,cursor:'pointer',color:'#e91e63',marginRight:8}}>&lt;</button>
      <img
        src={banners[idx].src}
        alt={banners[idx].alt}
        style={{maxWidth:'100%',maxHeight:320,borderRadius:16,boxShadow:'0 2px 16px rgba(233,30,99,0.10)'}}
      />
      <button onClick={next} style={{background:'none',border:'none',fontSize:28,cursor:'pointer',color:'#e91e63',marginLeft:8}}>&gt;</button>
    </div>
  );
};

export default BannerSlider; 