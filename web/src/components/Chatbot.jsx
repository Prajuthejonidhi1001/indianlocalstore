import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Phone, MessageCircle } from 'lucide-react';
import './Chatbot.css';

const FAQ_KNOWLEDGE = {
  order: "You can track your order by going to the 'My Orders' section in your profile.",
  track: "You can track your order by going to the 'My Orders' section in your profile.",
  return: "We offer a 7-day hassle-free return policy. Contact support for assistance.",
  refund: "Refunds are processed within 3-5 business days after return approval.",
  cod: "Yes, we support Cash on Delivery (COD) on all eligible orders.",
  cash: "Yes, Cash on Delivery is available.",
  payment: "We currently support Cash on Delivery. Online payments are coming soon!",
  delivery: "Orders are usually delivered within 24-48 hours depending on your location.",
  shipping: "Delivery is completely free on all orders!"
};

const DEFAULT_REPLY = "I'm still learning! For detailed help, please contact our support team directly:\n📞 +91 9876543210\n💬 WhatsApp us";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi there! 👋 Welcome to Indian Local Store. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e?.preventDefault();
    const query = input.trim().toLowerCase();
    if (!query) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: input }]);
    setInput('');

    // Generate reply
    setTimeout(() => {
      let reply = '';
      for (const [key, answer] of Object.entries(FAQ_KNOWLEDGE)) {
        if (query.includes(key)) {
          reply = answer;
          break;
        }
      }
      if (!reply) reply = DEFAULT_REPLY;

      setMessages(prev => [...prev, { type: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`} 
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <MessageSquare size={18} />
            </div>
            <div>
              <h4>Support Bot</h4>
              <span>Typically replies instantly</span>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="chatbot-body">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble-container ${msg.type}`}>
              <div className="chat-bubble">
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i !== msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        
        {messages.some(m => m.text === DEFAULT_REPLY) && (
          <div className="chatbot-actions">
            <a href="tel:+919876543210" className="cb-action-btn cb-call">
              <Phone size={14} /> Call
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="cb-action-btn cb-wa">
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        )}

        <form className="chatbot-footer" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Type your question..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
