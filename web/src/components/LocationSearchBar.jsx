import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader, X } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import './LocationSearchBar.css';

export default function LocationSearchBar() {
  const { location, setLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set initial query if location exists
  useEffect(() => {
    if (location && !isOpen) {
      setQuery(`${location.name}, ${location.pincode}`);
    }
  }, [location, isOpen]);

  // Debounced API search
  useEffect(() => {
    const fetchLocations = async () => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        setError(null);
        return;
      }
      
      // Don't search if the query is just displaying the current location
      if (location && query === `${location.name}, ${location.pincode}`) {
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const isPincode = /^\d{6}$/.test(query.trim());
        const endpoint = isPincode 
          ? `https://api.postalpincode.in/pincode/${query.trim()}`
          : `https://api.postalpincode.in/postoffice/${query.trim()}`;
          
        const res = await fetch(endpoint);
        const data = await res.json();
        
        if (data && data[0].Status === 'Success' && data[0].PostOffice) {
          // Remove exact duplicates by name+pincode
          const uniqueItems = [];
          const seen = new Set();
          
          data[0].PostOffice.forEach(po => {
            const key = `${po.Name}-${po.Pincode}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueItems.push(po);
            }
          });
          
          setSuggestions(uniqueItems.slice(0, 8)); // Max 8 suggestions
        } else {
          setSuggestions([]);
          if (query.length > 4) {
             setError("No locations found in India.");
          }
        }
      } catch (err) {
        console.error("Location fetch failed:", err);
        setError("Network error. Try again.");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchLocations();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (postOffice) => {
    const newLoc = {
      name: postOffice.Name,
      district: postOffice.District,
      state: postOffice.State,
      pincode: postOffice.Pincode,
      region: postOffice.Region || postOffice.Block
    };
    setLocation(newLoc);
    setQuery(`${newLoc.name}, ${newLoc.pincode}`);
    setIsOpen(false);
  };

  const clearLocation = (e) => {
    e.stopPropagation();
    setLocation(null);
    setQuery('');
    setSuggestions([]);
    setTimeout(() => setIsOpen(true), 10);
  };

  return (
    <div className="location-search-wrapper" ref={wrapperRef}>
      <div className={`location-input-container ${isOpen ? 'active' : ''}`}>
        <MapPin size={16} className="location-icon" />
        <input
          type="text"
          className="location-input"
          placeholder="Enter Pincode or City..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {location && !isOpen ? (
          <button type="button" className="clear-loc-btn" onClick={clearLocation}>
            <X size={14} />
          </button>
        ) : loading ? (
           <Loader size={14} className="location-spinner" />
        ) : null}
      </div>

      {isOpen && (query.length >= 3 || suggestions.length > 0) && (
        <div className="location-dropdown">
          <div className="location-dropdown-header">
            India Locations
          </div>
          
          {loading && suggestions.length === 0 && (
            <div className="location-dropdown-msg">Searching Indian localities...</div>
          )}
          
          {error && !loading && (
            <div className="location-dropdown-msg error">{error}</div>
          )}
          
          {!loading && !error && suggestions.length === 0 && query.length >= 3 && (
             <div className="location-dropdown-msg">No results matching "{query}"</div>
          )}
          
          <ul className="location-suggestions">
            {suggestions.map((po, idx) => (
              <li key={idx} onClick={() => handleSelect(po)}>
                <MapPin size={15} className="sug-icon" />
                <div className="sug-content">
                  <span className="sug-name">{po.Name}</span>
                  <span className="sug-details">
                    {po.District}, {po.State} • {po.Pincode}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
