import React, { useState, useEffect, useRef } from 'react';

const StatusButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [statusText, setStatusText] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [expiration, setExpiration] = useState('never');
  const [expirationTime, setExpirationTime] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const emojis = [
    { emoji: '😊', name: 'smile' },
    { emoji: '😄', name: 'grin' },
    { emoji: '😆', name: 'laughing' },
    { emoji: '😅', name: 'sweat_smile' },
    { emoji: '🤣', name: 'rofl' },
    { emoji: '😂', name: 'joy' },
    { emoji: '🙂', name: 'slightly_smiling_face' },
    { emoji: '🙃', name: 'upside_down_face' },
    { emoji: '🫠', name: 'melting_face' },
    { emoji: '😉', name: 'wink' },
    { emoji: '😌', name: 'relieved' },
    { emoji: '😍', name: 'heart_eyes' },
    { emoji: '🥰', name: 'smiling_face_with_hearts' },
    { emoji: '😘', name: 'kissing_heart' },
    { emoji: '😗', name: 'kissing' },
    { emoji: '😙', name: 'kissing_smiling_eyes' },
    { emoji: '😚', name: 'kissing_closed_eyes' },
    { emoji: '😋', name: 'yum' },
    { emoji: '😛', name: 'stuck_out_tongue' },
    { emoji: '😝', name: 'stuck_out_tongue_closed_eyes' },
    { emoji: '😜', name: 'stuck_out_tongue_winking_eye' },
    { emoji: '🤪', name: 'zany_face' },
    { emoji: '🤨', name: 'raised_eyebrow' },
    { emoji: '🧐', name: 'monocle_face' },
    { emoji: '🤓', name: 'nerd_face' },
    { emoji: '😎', name: 'sunglasses' },
    { emoji: '🥳', name: 'partying_face' },
    { emoji: '😏', name: 'smirk' },
    { emoji: '😒', name: 'unamused' },
    { emoji: '😞', name: 'disappointed' },
    { emoji: '😔', name: 'pensive' },
    { emoji: '😟', name: 'worried' },
    { emoji: '😕', name: 'confused' },
    { emoji: '🙁', name: 'slightly_frowning_face' },
    { emoji: '☹️', name: 'frowning_face' },
    { emoji: '😣', name: 'persevere' },
    { emoji: '😖', name: 'confounded' },
    { emoji: '😫', name: 'tired_face' },
    { emoji: '😩', name: 'weary' },
    { emoji: '🥺', name: 'pleading_face' },
    { emoji: '😢', name: 'cry' },
    { emoji: '😭', name: 'sob' },
    { emoji: '😤', name: 'triumph' },
    { emoji: '😠', name: 'angry' },
    { emoji: '😡', name: 'rage' },
    { emoji: '🤬', name: 'face_with_symbols_on_mouth' },
    { emoji: '🤯', name: 'exploding_head' },
    { emoji: '😳', name: 'flushed' },
    { emoji: '🥵', name: 'hot_face' },
    { emoji: '🥶', name: 'cold_face' },
    { emoji: '😱', name: 'scream' },
    { emoji: '😨', name: 'fearful' },
    { emoji: '😰', name: 'cold_sweat' },
    { emoji: '😥', name: 'disappointed_relieved' },
    { emoji: '😓', name: 'sweat' },
    { emoji: '🤗', name: 'hugs' },
    { emoji: '🤔', name: 'thinking' },
    { emoji: '🤭', name: 'hand_over_mouth' },
    { emoji: '🤫', name: 'shushing_face' },
    { emoji: '🤥', name: 'lying_face' },
    { emoji: '😶', name: 'no_mouth' },
    { emoji: '😐', name: 'neutral_face' },
    { emoji: '😑', name: 'expressionless' },
    { emoji: '😬', name: 'grimacing' },
    { emoji: '🙄', name: 'rolling_eyes' },
    { emoji: '😯', name: 'hushed' },
    { emoji: '😦', name: 'frowning' },
    { emoji: '😧', name: 'anguished' },
    { emoji: '😮', name: 'open_mouth' },
    { emoji: '😲', name: 'astonished' },
    { emoji: '🥱', name: 'yawning_face' },
    { emoji: '😴', name: 'sleeping' },
    { emoji: '🤤', name: 'drooling_face' },
    { emoji: '😪', name: 'sleepy' },
    { emoji: '😵', name: 'dizzy_face' },
    { emoji: '🤐', name: 'zipper_mouth_face' },
    { emoji: '🥴', name: 'woozy_face' },
    { emoji: '🤢', name: 'nauseated_face' },
    { emoji: '🤮', name: 'vomiting_face' },
    { emoji: '🤧', name: 'sneezing_face' },
    { emoji: '😷', name: 'mask' },
    { emoji: '🤒', name: 'face_with_thermometer' },
    { emoji: '🤕', name: 'face_with_head_bandage' },
    { emoji: '🏝️', name: 'vacation' },
    { emoji: '🏠', name: 'home' },
    { emoji: '💻', name: 'laptop' },
    { emoji: '☕', name: 'coffee' },
    { emoji: '🎮', name: 'gaming' },
    { emoji: '📚', name: 'books' },
    { emoji: '🎵', name: 'music' },
  ];

  const presetStatuses = [
    { emoji: '🏝️', text: 'On vacation', label: '🏝️ On vacation' },
    { emoji: '🤒', text: 'Out sick', label: '🤒 Out sick' },
    { emoji: '🏠', text: 'Working from home', label: '🏠 Working from home' },
    { emoji: '💻', text: 'Focusing', label: '💻 Focusing' },
  ];

  useEffect(() => {
    if (!expirationTime) return;

    const checkExpiration = setInterval(() => {
      if (Date.now() >= expirationTime) {
        clearStatus();
      }
    }, 1000);

    return () => clearInterval(checkExpiration);
  }, [expirationTime]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  const clearEmoji = () => {
    setSelectedEmoji('');
  };

  const handlePresetClick = (preset) => {
    setSelectedEmoji(preset.emoji);
    setStatusText(preset.text);
  };

  const clearStatus = () => {
    setSelectedEmoji('');
    setStatusText('');
    setIsBusy(false);
    setExpiration('never');
    setExpirationTime(null);
    setIsModalOpen(false);
  };

  const setStatus = () => {
    if (expiration !== 'never') {
      const now = Date.now();
      let expiryTime;

      switch (expiration) {
        case '30min':
          expiryTime = now + 30 * 60 * 1000;
          break;
        case '1hour':
          expiryTime = now + 60 * 60 * 1000;
          break;
        case '4hours':
          expiryTime = now + 4 * 60 * 60 * 1000;
          break;
        case 'today':
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);
          expiryTime = endOfDay.getTime();
          break;
        case 'week':
          expiryTime = now + 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          expiryTime = now + 30 * 24 * 60 * 60 * 1000;
          break;
        default:
          expiryTime = null;
      }

      setExpirationTime(expiryTime);
    }

    setIsModalOpen(false);
    setShowEmojiPicker(false);
  };
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const hasStatus = selectedEmoji || statusText;

  return (
    <>
      <button
        onClick={openModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}

        className={`relative flex items-center justify-center transition-all duration-200 rounded-full ${
          isBusy ? 'ring-2 ring-orange-600 ring-offset-2' : ''
        } ${
          isHovered
            ? 'bg-[#f6f8fa] px-3 py-1 gap-2'
            : hasStatus
            ? 'w-8 h-8'
            : 'w-8 h-8 border border-[#d0d7de]'
        }`}
      >
        <span className="text-base">
          {hasStatus ? selectedEmoji : '🙂'}
        </span>
        {isHovered && (
          <span className="text-sm text-[#59636E] whitespace-nowrap">
            {hasStatus ? statusText || 'Edit status' : 'Set status'}
          </span>
        )}
      </button>

      {isModalOpen && (
        <div   onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#e9edf0]/50 backdrop:blur-3xl bg-opacity-50">
          <div     onClick={(e) => e.stopPropagation()} className=" relative w-full max-w-md bg-white rounded-lg shadow-xl lg:max-w-lg">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#59636E] hover:text-[#1F2328] lg:hidden"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#1F2328] mb-4">
                Edit status
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1F2328] mb-2">
                  What's happening 
                </label> 
                <div className="relative">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors"
                    >
                      {selectedEmoji ? (
                        <span className="text-xl">{selectedEmoji}</span>
                      ) : (
                        <span className="text-xl">🙂</span>
                      )}
                    </button>
                    <input
                      type="text"
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      maxLength={80}
                      placeholder=""
                      className="flex-1 px-3 py-2 border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-[#59636E] mt-1">
                    {80 - statusText.length} characters remaining
                  </p>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute top-12 left-0 z-10 w-80 bg-white border border-[#d0d7de] rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto"
                    >
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="Filter Emojis"
                          className="w-full px-3 py-2 border border-[#d0d7de] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {emojis.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiSelect(item.emoji)}
                            className="text-2xl hover:bg-[#f6f8fa] rounded p-1 transition-colors"
                            title={item.name}
                          >
                            {item.emoji}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={clearEmoji}
                        className="w-full mt-3 py-2 text-sm text-[#59636E] border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors"
                      >
                        Clear emoji
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {presetStatuses.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetClick(preset)}
                      className="px-3 py-1.5 text-sm border border-[#d0d7de] rounded-full hover:bg-[#f6f8fa] transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBusy}
                    onChange={(e) => setIsBusy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 border-[#d0d7de] rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-[#1F2328]">
                      Busy
                    </span>
                    <p className="text-xs text-[#59636E] mt-0.5">
                      When others mention you, assign you, or request your review,
                      GitHub will let them know that you have limited availability.
                    </p>
                  </div>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1F2328] mb-2">
                  Expiration
                </label>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="never">Never</option>
                  <option value="30min">In 30 minutes</option>
                  <option value="1hour">In 1 hour</option>
                  <option value="4hours">In 4 hours</option>
                  <option value="today">After today</option>
                  <option value="week">After this week</option>
                  <option value="month">After a month</option>
                </select>
                <p className="text-xs text-[#59636E] mt-1">
                  Your status will be cleared after the selected time.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1F2328] mb-2">
                  Visible to
                </label>
                <select
                  defaultValue="everyone"
                  className="w-full px-3 py-2 border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="everyone">Everyone</option>
                </select>
                <p className="text-xs text-[#59636E] mt-1">
                  Limit status visibility to a single organization.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={clearStatus}
                  className="px-4 py-2 text-sm font-medium text-[#1F2328] border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors"
                >
                  Clear status
                </button>
                <button
                  onClick={setStatus}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2da44e] rounded-md hover:bg-[#2c974b] transition-colors"
                >
                  Set status
                </button>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="hidden lg:block absolute top-4 right-4 text-[#59636E] hover:text-[#1F2328]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusButton;
