import React from 'react';

interface SocialShareProps {
  url?: string;
  title?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  url = window.location.href, 
  title = 'Fortune Investment Platform - Earn Daily Returns' 
}) => {
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };

  const openShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex space-x-3">
      <button
        onClick={() => openShare('facebook')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Facebook
      </button>
      <button
        onClick={() => openShare('twitter')}
        className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors"
      >
        Twitter
      </button>
      <button
        onClick={() => openShare('whatsapp')}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
      >
        WhatsApp
      </button>
    </div>
  );
};

export default SocialShare;