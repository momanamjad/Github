import React, { useState, useRef, useCallback } from 'react';
import { useGitHub } from '@contexts/GitHubContext';
import { useClickOutside, useInterval } from '@hooks/useGitHub_hooks';
import { PRESET_STATUSES, EXPIRATION_OPTIONS } from '../../constants/githubConstants';
import EmojiPicker from './EmojiPicker';
import XIcon from '../../../public/customIcons/XIcon';
import { useScrollLock } from '../../hooks/useScrollLock';


import { useEffect } from 'react';

const StatusButton = ({ hidden = false, username, profileStatus }) => {
  const { user, status: globalStatus, updateStatus, isStatusModalOpen, setIsStatusModalOpen } = useGitHub();

  const targetUsername = username || user?.login || "";
  const isOwner = user && user.login === targetUsername;
  const currentStatus = isOwner ? (globalStatus || { emoji: '', text: '', isBusy: false }) : (profileStatus || { emoji: '', text: '', isBusy: false });

  const [localEmoji, setLocalEmoji] = useState(currentStatus.emoji || '');
  const [localText, setLocalText] = useState(currentStatus.text || '');
  const [localIsBusy, setLocalIsBusy] = useState(currentStatus.isBusy || false);
  const [expiration, setExpiration] = useState('never');
  const [expirationTime, setExpirationTime] = useState(null);
  
  useScrollLock(isStatusModalOpen);

  useEffect(() => {
    setLocalEmoji(currentStatus.emoji || '');
    setLocalText(currentStatus.text || '');
    setLocalIsBusy(currentStatus.isBusy || false);
  }, [currentStatus]);

  const [isHovered, setIsHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPickerRef = useRef(null);
  const modalRef = useRef(null);

  // Sync local state when modal opens
  const openModal = useCallback(() => {
    setLocalEmoji(currentStatus.emoji || '');
    setLocalText(currentStatus.text || '');
    setLocalIsBusy(currentStatus.isBusy || false);
    setIsStatusModalOpen(true);
  }, [currentStatus, setIsStatusModalOpen]);

  const closeModal = useCallback(() => {
    setIsStatusModalOpen(false);
    setShowEmojiPicker(false);
  }, [setIsStatusModalOpen]);

  // Custom Hooks
  useClickOutside([emojiPickerRef], () => setShowEmojiPicker(false));

  // handleClear must be declared BEFORE useInterval which references it
  const handleClear = useCallback(() => {
    setLocalEmoji('');
    setLocalText('');
    setLocalIsBusy(false);
    setExpirationTime(null);
    updateStatus({ emoji: '', text: '', isBusy: false });
    closeModal();
  }, [updateStatus, closeModal]);

  // Auto-clear status timer
  useInterval(() => {
    if (expirationTime && Date.now() >= expirationTime) {
      handleClear();
    }
  }, expirationTime ? 1000 : null);

  const handleSave = () => {
    let expiryTime = null;
    if (expiration !== 'never') {
      const now = Date.now();
      const durations = {
        '30min': 30 * 60 * 1000,
        '1hour': 60 * 60 * 1000,
        '4hours': 4 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
      };

      if (expiration === 'today') {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        expiryTime = endOfDay.getTime();
      } else {
        expiryTime = now + (durations[expiration] || 0);
      }
    }

    setExpirationTime(expiryTime);
    updateStatus({ emoji: localEmoji, text: localText, isBusy: localIsBusy });
    closeModal();
  };

  const hasStatus = currentStatus.emoji || currentStatus.text;

  // Don't show anything for guest/other users if they have no status set
  if (!isOwner && !hasStatus) return null;

  return (
    <>
      {!hidden && (
        <button
          onClick={isOwner ? openModal : undefined}
          onMouseEnter={() => isOwner && setIsHovered(true)}
          onMouseLeave={() => isOwner && setIsHovered(false)}
          style={{ cursor: isOwner ? 'pointer' : 'default' }}
          className={`relative flex items-center justify-center transition-all duration-200 rounded-full bg-white shadow-sm ${isOwner ? 'hover:text-blue-600' : ''} ${currentStatus.isBusy ? 'ring-2 ring-orange-600 ring-offset-2' : ''
            } ${isHovered ? 'px-2 sm:px-3 py-1 gap-1 sm:gap-2' : hasStatus ? 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10' : 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border border-[#d0d7de]'}`}
        >
          <span className="text-[10px] sm:text-sm lg:text-base leading-none flex items-center justify-center">{hasStatus ? currentStatus.emoji : '🙂'}</span>
          {isHovered && (
            <span className="text-xs sm:text-sm text-[#59636E] whitespace-nowrap">
              {hasStatus ? currentStatus.text || 'Edit status' : 'Set status'}
            </span>
          )}
        </button>
      )}

      {isStatusModalOpen && (
        <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1b1f23]/50 dark:bg-[#010409]/80 backdrop-blur-sm transition-opacity">
          <div onClick={(e) => e.stopPropagation()} ref={modalRef} className="relative w-full max-w-md bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-xl p-4 sm:p-6 max-h-[95vh] flex flex-col text-left">
            <header className="flex justify-between items-center mb-4 flex-shrink-0 border-b border-[#d0d7de] dark:border-[#30363d] pb-3">
              <h2 className="text-sm font-bold text-[#1f2328] dark:text-white uppercase tracking-wider">Set user status</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent border-0 cursor-pointer text-sm">
                ✕
              </button>
            </header>

            <div className="space-y-4 overflow-y-auto pr-1 pb-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">What's happening</label>
                <div className="relative">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl"
                    >
                      {localEmoji || '🙂'}
                    </button>
                    <input
                      type="text"
                      value={localText}
                      onChange={(e) => setLocalText(e.target.value.substring(0, 80))}
                      maxLength={80}
                      placeholder="What's happening?"
                      className="flex-1 px-3 py-2 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff] text-[#24292f] dark:text-white"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{80 - localText.length} characters remaining</p>

                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute top-12 left-0 z-10 w-full bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-lg p-3 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-6 gap-2">
                        {PRESET_STATUSES.map((preset, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setLocalEmoji(preset.emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1.5 transition-colors border-0 bg-transparent cursor-pointer"
                            title={preset.text}
                          >
                            {preset.emoji}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => { setLocalEmoji(''); setShowEmojiPicker(false); }}
                        className="w-full mt-3 py-1.5 text-xs text-red-500 border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 bg-transparent cursor-pointer"
                      >
                        Clear emoji
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {PRESET_STATUSES.slice(0, 4).map((preset) => (
                    <button
                      key={preset.text}
                      onClick={() => {
                        setLocalEmoji(preset.emoji);
                        setLocalText(preset.text);
                      }}
                      className="px-2.5 py-1 text-xs border border-[#d0d7de] dark:border-[#30363d] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-[#21262d] text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      {preset.emoji} {preset.text}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer group mt-2">
                <input
                  type="checkbox"
                  checked={localIsBusy}
                  onChange={(e) => setLocalIsBusy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-purple-600"
                />
                <div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Busy (shows red status dot on profile)</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    GitHub will let others know you have limited availability when mentioned.
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expiration</label>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-xs text-gray-700 dark:text-gray-300 outline-none"
                >
                  {EXPIRATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <footer className="flex gap-2 justify-between mt-6 flex-shrink-0 border-t border-[#d0d7de] dark:border-[#30363d] pt-3">
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 bg-transparent cursor-pointer"
              >
                Clear status
              </button>
              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-gray-100 dark:hover:bg-gray-850 bg-white dark:bg-[#21262d] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md cursor-pointer border-0"
                >
                  Set status
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(StatusButton);
