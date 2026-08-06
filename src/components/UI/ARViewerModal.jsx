import React, { useState, useEffect } from 'react';
import { QrCode, X } from 'lucide-react';
import '@google/model-viewer';

import { createPortal } from 'react-dom';

export default function ARViewerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      setIsMobile(/android|iPad|iPhone|iPod/i.test(userAgent));
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

      {isOpen && createPortal(
        <div className="ar-modal-overlay">
          <div className={`ar-modal-content ${!isMobile ? 'qr-only-mode' : ''}`}>
            <button className="ar-modal-close" onClick={() => setIsOpen(false)}>
              <X size={24} color="#fff" />
            </button>
            
            <div className="ar-modal-body">
              {isMobile ? (
                <div className="ar-viewer-container">
                  <model-viewer
                    src="/project-draco.glb"
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    camera-controls
                    auto-rotate
                    shadow-intensity="1"
                    environment-image="neutral"
                    style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }}
                  >
                    <button slot="ar-button" className="ar-launch-button">
                      👋 Chạm để Xem AR
                    </button>
                  </model-viewer>
                </div>
              ) : (
                <div className="ar-qr-panel-standalone">
                  <h3>Xem bằng Thực tế Ảo</h3>
                  <p>Quét mã QR dưới đây bằng camera điện thoại của bạn để đưa mô hình này ra ngoài không gian thực (AR).</p>
                  <div className="qr-code-mock">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`} alt="QR Code" />
                  </div>
                  <div className="qr-instruction">
                    Hỗ trợ iOS (Safari) và Android (Chrome).
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
