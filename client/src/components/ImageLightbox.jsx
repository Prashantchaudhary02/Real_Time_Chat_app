import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

export default function ImageLightbox({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
          <a
            href={imageUrl}
            download="chat-image"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
            title="Download Image"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <img
          src={imageUrl}
          alt="Full preview"
          className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-gray-800"
        />
      </div>
    </div>
  );
}
