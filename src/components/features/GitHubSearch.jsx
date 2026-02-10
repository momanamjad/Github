// components/SearchModal.jsx
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function GitHubSearch({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Mock search function - replace with your actual search logic
  const handleSearch = (query) => {
    setSearchQuery(query);
    // Add your search logic here
    // For example, filter through your data or make an API call
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 mr-[230px] z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#e4e9ed99] transition-opacity"

        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-3 rounded  ">
        <div 
          ref={modalRef}
          className="relative w-full max-w-7xl bg-white -mt-2 rounded-lg "
        >
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative flex items-center ">
              <Search className="absolute left-3 h-4 w-4 text-[#59636e]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-1  border-1 border-gray-300 rounded  focus:outline-none focus:ring-2 focus:ring-[#0969DA] focus:border-transparent"
              />
              <button
                onClick={onClose}
                className="absolute right-3 p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-[white] bg-[#818B98] rounded-2xl cursor-pointer" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto p-4">
            {searchQuery ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Searching for "{searchQuery}"...
                </p>
                {results.length > 0 ? (
                  results.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      {result}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-8 text-center">
                    No results found
                  </p>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Start typing to search</p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-500">
              {/* <span>Press ESC to close</span> */}
              {/* <span>↵ to select</span> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}