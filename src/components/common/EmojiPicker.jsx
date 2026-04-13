import React, { useState, useMemo } from 'react';
import { PRESET_EMOJIS } from '../../constants/githubConstants';

const EmojiPicker = ({ onSelect, onClear, _onClose, pickerRef }) => {
    const [filter, setFilter] = useState('');

    const filteredEmojis = useMemo(() => {
        if (!filter) return PRESET_EMOJIS;
        return PRESET_EMOJIS.filter(e =>
            e.name.toLowerCase().includes(filter.toLowerCase())
        );
    }, [filter]);

    return (
        <div
            ref={pickerRef}
            className="absolute top-12 left-0 z-10 w-[calc(100vw-2.5rem)] sm:w-80 max-w-full bg-white border border-[#d0d7de] rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto"
        >
            <div className="mb-2">
                <input
                    type="text"
                    placeholder="Filter Emojis"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d0d7de] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="grid grid-cols-8 gap-2">
                {filteredEmojis.map((item, index) => (
                    <button
                        key={`${item.name}-${index}`}
                        onClick={() => onSelect(item.emoji)}
                        className="text-2xl hover:bg-[#f6f8fa] rounded p-1 transition-colors"
                        title={item.name}
                    >
                        {item.emoji}
                    </button>
                ))}
            </div>
            <button
                onClick={onClear}
                className="w-full mt-3 py-2 text-sm text-[#59636E] border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors"
            >
                Clear emoji
            </button>
        </div>
    );
};

export default EmojiPicker;
