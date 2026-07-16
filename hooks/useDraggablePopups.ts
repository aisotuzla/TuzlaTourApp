import { useEffect } from 'react';

export const useDraggablePopups = () => {
  useEffect(() => {
    const handleStart = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // Do not initiate drag on interactive elements
      if (target.closest('button, a, input, select, textarea')) return;
      
      const contentElement = target.closest('.maplibregl-popup-content') as HTMLElement;
      if (!contentElement) return;

      const popupRoot = contentElement.closest('.maplibregl-popup') as HTMLElement;
      if (popupRoot) {
        // Bring popup to front
        popupRoot.style.zIndex = '9999';
      }

      e.stopPropagation();

      const isTouch = e.type === 'touchstart';
      const startX = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const startY = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      const style = window.getComputedStyle(contentElement);
      let currentX = 0;
      let currentY = 0;

      if (style.transform !== 'none') {
        try {
          const matrix = new DOMMatrixReadOnly(style.transform);
          currentX = matrix.m41;
          currentY = matrix.m42;
        } catch (e) {
          console.warn("DOMMatrix parse error", e);
        }
      }

      contentElement.style.cursor = 'grabbing';
      contentElement.style.transition = 'none';

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
        
        const dx = moveX - startX;
        const dy = moveY - startY;
        
        contentElement.style.transform = `translate(${currentX + dx}px, ${currentY + dy}px)`;
      };

      const handleEnd = () => {
        contentElement.style.cursor = '';
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchend', handleEnd);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    };

    // Use capturing phase so we can grab the event before maplibre cancels it
    document.addEventListener('mousedown', handleStart, true);
    document.addEventListener('touchstart', handleStart, { passive: false, capture: true });

    return () => {
      document.removeEventListener('mousedown', handleStart, true);
      document.removeEventListener('touchstart', handleStart, { capture: true });
    };
  }, []);
};
