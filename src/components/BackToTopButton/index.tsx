import { useEffect, useState } from 'react';

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      aria-label="Back to top"
      className="fixed bottom-4 right-4 sm:bottom-2 sm:right-2 z-50 p-3 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
    >
      ↑
    </button>
  );
}
