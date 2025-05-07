import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ videoId, title, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Construct the embed URL with all necessary parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?` + new URLSearchParams({
    autoplay: '1',
    rel: '0', 
    modestbranding: '1',
    enablejsapi: '1',
    origin: window.location.origin,
    widget_referrer: window.location.origin,
    fs: '1'
  }).toString();

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4"
      role="dialog" 
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 
            id="modal-title" 
            className="text-lg font-medium text-gray-900 pr-8"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full p-1"
            aria-label="Close video"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="relative w-full aspect-video bg-black">
          <iframe
            ref={iframeRef}
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};