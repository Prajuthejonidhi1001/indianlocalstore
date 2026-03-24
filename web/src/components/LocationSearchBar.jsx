import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ChevronDown, Loader, X } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { INDIA_DATA } from '../data/indiaData';
import './LocationSearchBar.css';

const INDIAN_STATES = Object.keys(INDIA_DATA).sort();

export default function LocationSearchBar() {
  const { location, setLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [locating, setLocating] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update districts when state changes
  useEffect(() => {
    if (selectedState) {
      setDistricts(INDIA_DATA[selectedState] || []);
      setSelectedDistrict('');
      setCityQuery('');
      setCitySuggestions([]);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  // Live city/pincode search within selected district
  useEffect(() => {
    if (!cityQuery || cityQuery.length < 2) { setCitySuggestions([]); return; }
    const timer = setTimeout(() => {
      const isPincode = /^\d{6}$/.test(cityQuery.trim());
      const url = isPincode
        ? `https://api.postalpincode.in/pincode/${cityQuery.trim()}`
        : `https://api.postalpincode.in/postoffice/${encodeURIComponent(cityQuery.trim())}`;
      
      fetch(url)
        .then(r => r.json())
        .then(data => {
          if (data?.[0]?.Status === 'Success') {
            let filtered = data[0].PostOffice;
            // Filter by district if one is selected
            if (selectedDistrict) {
              filtered = filtered.filter(p => 
                p.District.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
                selectedDistrict.toLowerCase().includes(p.District.toLowerCase())
              );
            }
            
            const seen = new Set();
            const unique = [];
            filtered.forEach(p => {
              const key = `${p.Name}-${p.Pincode}`;
              if (!seen.has(key)) { seen.add(key); unique.push(p); }
            });
            setCitySuggestions(unique.slice(0, 8));
          } else { 
            setCitySuggestions([]); 
          }
        })
        .catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [cityQuery, selectedDistrict]);

  const triggerGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          name: 'Current Location',
          district: 'Nearby',
          state: '',
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
        setLocating(false);
        setIsOpen(false);
        resetForm();
      },
      () => {
        setLocating(false);
        alert('Could not access your location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const detectLocation = (e) => {
    e.stopPropagation();
    triggerGPS();
  };

  const selectCity = (po) => {
    setLocation({ name: po.Name, district: po.District, state: po.State, pincode: po.Pincode });
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setCityQuery('');
    setCitySuggestions([]);
  };

  const clearLocation = (e) => {
    e.stopPropagation();
    setLocation(null);
    resetForm();
  };

  const displayLabel = location
    ? location.name === 'Current Location' ? '📍 Current Location'
    : location.pincode ? `${location.name}, ${location.pincode}` : location.name
    : 'Select Location';

  // Styles
  const panel = {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
    width: '320px', background: '#131920',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
    zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    overflow: 'hidden',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: '700',
    color: '#97A3B6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem',
  };
  const selectStyle = {
    width: '100%', background: '#1A2332', border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.55rem 0.85rem', color: '#F0F4FF',
    fontSize: '0.9rem', outline: 'none', cursor: 'pointer',
  };
  const inputStyle = {
    ...selectStyle, cursor: 'text',
  };
  const sectionPad = { padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' };

  return (
    <div className="location-search-wrapper" ref={wrapperRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer', padding: '0.45rem 0.9rem',
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          background: '#131920', border: `1px solid ${isOpen ? '#FF6B35' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '10px', minWidth: '155px', maxWidth: '240px',
        }}
      >
        {locating ? <Loader size={15} color="#FF6B35" className="spinner" /> : <MapPin size={15} color="#FF6B35" />}
        <span style={{ color: '#F0F4FF', fontSize: '0.85rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {locating ? 'Detecting...' : displayLabel}
        </span>
        {location ? <X size={13} color="#97A3B6" onClick={clearLocation} /> : <ChevronDown size={13} color="#97A3B6" />}
      </div>

      {isOpen && (
        <div style={panel}>
          <button onClick={detectLocation} disabled={locating} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', background: 'rgba(255,107,53,0.08)', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#FF6B35', fontWeight: '600', fontSize: '0.9rem' }}>
            {locating ? <Loader size={15} className="spinner" /> : <Navigation size={15} />}
            Detect My Location
          </button>

          <div style={sectionPad}>
            <label style={labelStyle}>State</label>
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)} style={selectStyle}>
              <option value="">— Select State —</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {selectedState && (
            <div style={sectionPad}>
              <label style={labelStyle}>District</label>
              <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} style={selectStyle}>
                <option value="">— Select District —</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {selectedDistrict && (
            <div style={{ padding: '0.85rem 1rem' }}>
              <label style={labelStyle}>City / Village / Pincode</label>
              <input type="text" autoFocus placeholder="Search area..." value={cityQuery} onChange={e => setCityQuery(e.target.value)} style={inputStyle} />
              {citySuggestions.length > 0 && (
                <ul style={{ margin: '0.5rem 0 0', padding: 0, listStyle: 'none', background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {citySuggestions.map((po, i) => (
                    <li key={i} onClick={() => selectCity(po)} style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ color: '#F0F4FF', fontSize: '0.88rem', fontWeight: '500' }}>{po.Name}</div>
                      <div style={{ color: '#5A6880', fontSize: '0.75rem' }}>{po.District}, {po.State} · {po.Pincode}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
