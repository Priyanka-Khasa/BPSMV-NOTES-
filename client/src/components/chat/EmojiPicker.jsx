import React from 'react';
import { X } from 'lucide-react';
import chatEmojiGroups from '../../data/chatEmojiGroups';

const EmojiPicker = ({ onSelect, onClose }) => (
  <div className="absolute bottom-full left-4 z-20 mb-2 max-h-72 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500">Emoji</span>
      <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </div>
    <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
      {chatEmojiGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.title}</p>
          <div className="grid grid-cols-6 gap-1">
            {group.emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className="rounded-lg p-1 text-xl transition-colors hover:bg-slate-50"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default EmojiPicker;
