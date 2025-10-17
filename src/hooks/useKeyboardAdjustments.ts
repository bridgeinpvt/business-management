import { useEffect, useState } from 'react';

export const useKeyboardAdjustments = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      // Detect keyboard by checking if viewport height changed significantly
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      const heightDifference = windowHeight - viewportHeight;

      // If height difference is significant (more than 150px), keyboard is likely open
      setIsKeyboardOpen(heightDifference > 150);
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const keyboardClasses = {
    form: 'keyboard-form',
    modal: 'keyboard-modal',
    scroll: 'keyboard-scroll',
    page: 'keyboard-page',
  };

  return { keyboardClasses, isKeyboardOpen };
};
