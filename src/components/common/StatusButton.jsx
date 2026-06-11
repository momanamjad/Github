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
        <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#e9edf0]/50 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} ref={modalRef} className="relative w-full max-w-md bg-white rounded-lg shadow-xl lg:max-w-lg p-4 sm:p-6 max-h-[95vh] flex flex-col">
            <header className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold text-[#1F2328]">Edit status</h2>
              <button onClick={closeModal} className="text-[#59636E] hover:text-[#1F2328]">
                <XIcon className="w-5 h-5" />
              </button>
            </header>

            <div className="space-y-4 overflow-y-auto pr-1 pb-1">
              <div>
                <label className="block text-sm font-medium text-[#1F2328] mb-2">What's happening</label>
                <div className="relative">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors text-xl"
                    >
                      {localEmoji || '🙂'}
                    </button>
                    <input
                      type="text"
                      value={localText}
                      onChange={(e) => setLocalText(e.target.value)}
                      maxLength={80}
                      placeholder="What's happening?"
                      className="flex-1 px-3 py-2 border border-[#d0d7de] rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <p className="text-xs text-[#59636E] mt-1">{80 - localText.length} characters remaining</p>

                  {showEmojiPicker && (
                    <EmojiPicker
                      pickerRef={emojiPickerRef}
                      onSelect={(emoji) => {
                        setLocalEmoji(emoji);
                        setShowEmojiPicker(false);
                      }}
                      onClear={() => setLocalEmoji('')}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {PRESET_STATUSES.map((preset) => (
                    <button
                      key={preset.text}
                      onClick={() => {
                        setLocalEmoji(preset.emoji);
                        setLocalText(preset.text);
                      }}
                      className="px-3 py-1.5 text-sm border border-[#d0d7de] rounded-full hover:bg-[#f6f8fa] transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={localIsBusy}
                  onChange={(e) => setLocalIsBusy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 border-[#d0d7de] rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-[#1F2328]">Busy</span>
                  <p className="text-xs text-[#59636E] mt-0.5">
                    GitHub will let others know you have limited availability when mentioned.
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-[#1F2328] mb-2">Expiration</label>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d0d7de] rounded-md bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EXPIRATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <footer className="flex gap-2 justify-end mt-6 flex-shrink-0">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-[#1F2328] border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors"
              >
                Clear status
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2da44e] rounded-md hover:bg-[#2c974b] transition-colors"
              >
                Set status
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(StatusButton);
