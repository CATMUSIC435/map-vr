import React, { useState, useEffect } from 'react';
import { QrCode, X } from 'lucide-react';
import '@google/model-viewer';

export default function ARViewerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <button 
        className="ar-trigger-btn" 
        onClick={() => setIsOpen(true)}
        title="Xem thực tế ảo (AR)"
      >
        <QrCode size={24} color="#fff" />
      </button>

      {isOpen && (
        <div className="ar-modal-overlay">
          <div className="ar-modal-content">
            <button className="ar-modal-close" onClick={() => setIsOpen(false)}>
              <X size={24} color="#fff" />
            </button>
            
            <div className="ar-viewer-container">
              <model-viewer
                src="/project-draco.glb"
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                environment-image="neutral"
                style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0', borderRadius: '12px' }}
              >
                {!isMobile && (
                  <div className="ar-qr-overlay">
                    <h3>Quét mã này bằng Điện thoại</h3>
                    <p>Để trải nghiệm mô hình bằng Thực tế Ảo (AR)</p>
                    {/* Placeholder for real QR code, using CSS for mock */}
                    <div className="qr-code-mock">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`} alt="QR Code" />
                    </div>
                  </div>
                )}
                
                <button slot="ar-button" className="ar-launch-button">
                  👋 Chạm để Xem AR trong không gian của bạn
                </button>
              </model-viewer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
