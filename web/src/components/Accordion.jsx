import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Accordion.css';

export function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0); // first item open by default

  return (
    <div className="accordion-container">
      {items.map((item, idx) => (
        <div key={idx} className={`accordion-item ${openIndex === idx ? 'open' : ''}`}>
          <button className="accordion-header" onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}>
            <span>{item.title}</span>
            <ChevronDown size={18} className="accordion-icon" />
          </button>
          <div className="accordion-content">
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
