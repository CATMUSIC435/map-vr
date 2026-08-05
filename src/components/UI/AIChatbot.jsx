import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import useMapStore from '../../store/useMapStore';
import { fenicaFAQ } from '../../mocks/faq';
import { mockLocations } from '../../mocks/locations';

// Remove accents for better matching
const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Chào bạn! Tôi là Trợ lý ảo của Dự án Fenica. Bạn muốn tìm hiểu thông tin gì về dự án?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const messagesEndRef = useRef(null);

  const setActiveAmenity = useMapStore(state => state.setActiveAmenity);
  const { 'main-map': mapRef } = useMapStore.getState ? { 'main-map': null } : {};

  // Smooth slide up animation for the chat window
  const windowSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateY(0px) scale(1)' : 'translateY(20px) scale(0.95)',
    pointerEvents: isOpen ? 'auto' : 'none',
    config: { tension: 300, friction: 25 }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load voices securely to handle browser delays
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const generateMockAIResponse = (userText) => {
    const text = userText.toLowerCase();
    const normalizedUserText = removeAccents(userText);
    
    // 1. Check FAQ first (highest priority for project specific questions)
    let bestMatch = null;
    let maxScore = 0;
    const userWords = normalizedUserText.split(/\s+/).filter(w => w.length > 2);

    if (userWords.length > 0) {
      for (const faq of fenicaFAQ) {
        const normalizedQ = removeAccents(faq.question);
        const normalizedA = removeAccents(faq.answer);
        
        let score = 0;
        for (const word of userWords) {
          if (normalizedQ.includes(word)) score += 2;
          else if (normalizedA.includes(word)) score += 1;
        }

        if (score > maxScore) {
          maxScore = score;
          bestMatch = faq;
        }
      }
    }

    if (bestMatch && maxScore > 1) {
      return `**${bestMatch.question}**<br/>${bestMatch.answer}`;
    }

    // 2. Check for amenities keywords
    for (const amenity of mockLocations) {
      const keywords = amenity.name.toLowerCase().split(' ');
      const hasKeyword = keywords.some(kw => kw.length > 3 && text.includes(kw));
      
      if (hasKeyword || text.includes(amenity.name.toLowerCase())) {
        setActiveAmenity(amenity); 
        return `Tôi tìm thấy **${amenity.name}**! Nó cách đây ${amenity.dist} (khoảng ${amenity.time} di chuyển). Tôi đã ghim nó trên bản đồ cho bạn rồi đó.`;
      }
    }

    if (text.includes('chào') || text.includes('hi')) {
      return 'Chào bạn! Bạn cần tôi cung cấp thông tin gì về dự án Fenica? (Vị trí, Tiện ích, Chủ đầu tư...)';
    }
    
    const genericResponses = [
      'Câu hỏi rất thú vị! Bạn có muốn biết thêm về quy mô hay tiện ích của dự án Fenica không?',
      'Bạn có thể nói rõ hơn một chút được không? Tôi nắm rất rõ các thông tin về dự án Fenica đấy!',
      'Hừm... Tiếc là tôi chưa hiểu rõ ý bạn. Bạn thử hỏi tôi về "Pháp lý" hay "Chủ đầu tư" xem sao nhé.',
      'Dự án Fenica thật tuyệt vời phải không! Bạn muốn tìm hiểu thêm về thiết kế căn hộ hay lịch thanh toán?'
    ];
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (newMutedState && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const speakText = (text) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    // Fix for Chrome bug where speech gets stuck
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    
    // Create a temporary element to strip HTML tags
    const tempDiv = document.createElement("DIV");
    tempDiv.innerHTML = text;
    let cleanText = tempDiv.textContent || tempDiv.innerText || "";
    
    // Remove markdown symbols
    cleanText = cleanText.replace(/\*\*/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly higher pitch
    
    // Fallback to browser API if state is empty
    const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const viVoices = availableVoices.filter(v => v.lang.includes('vi') || v.lang.includes('VI'));
    
    const femaleKeywords = ['female', 'girl', 'woman', 'linh', 'hoaimy', 'tiếng việt'];
    let selectedVoice = viVoices.find(v => femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword)));
    
    if (!selectedVoice && viVoices.length > 0) {
      selectedVoice = viVoices[0];
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Error handling
    utterance.onerror = (event) => {
        console.error("SpeechSynthesis error:", event.error);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking delay (1-2 seconds)
    const delay = Math.random() * 1000 + 1000;
    setTimeout(() => {
      const aiResponse = generateMockAIResponse(userMsg.text);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: aiResponse }]);
      setIsTyping(false);
      speakText(aiResponse);
    }, delay);
  };

  const toggleListening = (e) => {
    e.preventDefault();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói! Khuyên dùng Google Chrome.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      // We don't have the instance here easily to stop it, but it will stop automatically on end.
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      // Automatically send the message after speaking
      handleSendMessage(null, transcript);
    };

    recognition.onerror = (event) => {
      console.error("Lỗi nhận diện giọng nói: ", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="ai-chatbot-container">
      <animated.div style={windowSpring} className="ai-chat-window">
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <span className="ai-avatar">🤖</span>
            <div>
              <h3>AI Tour Guide</h3>
              <p>Luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="ai-chat-close" 
              onClick={toggleMute}
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button className="ai-chat-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
        </div>
        
        <div className="ai-chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`ai-message-row ${msg.sender}`}>
              <div className="ai-message-bubble">
                {/* Basic markdown bold support for mockup */}
                <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="ai-message-row ai">
              <div className="ai-message-bubble typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="ai-chat-input-area" onSubmit={(e) => handleSendMessage(e)}>
          <button 
            type="button" 
            className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            title="Nói với AI"
          >
            🎤
          </button>
          <input 
            type="text" 
            placeholder={isListening ? "Đang nghe..." : "Hỏi AI về địa điểm..."} 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" disabled={!inputValue.trim()}>Gửi</button>
        </form>
      </animated.div>

      <button className="ai-chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '💬' : '🤖'}
      </button>
    </div>
  );
}
