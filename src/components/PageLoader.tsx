import React from 'react';
import { ThreeDots } from 'react-loader-spinner';

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  backgroundColor: 'rgba(255,255,255,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const PageLoader = () => {
  return (
    <div style={overlayStyle}>
      <ThreeDots
        visible={true}
        height="80"
        width="80"
        color="#4fa94d"
        radius="9"
        ariaLabel="three-dots-loading"
      />
    </div>
  );
};

export default PageLoader;
