import { useEffect, useRef } from 'react';

/**
 * Lets the system back gesture close the topmost surface (result, sheet, dialog, or menu) instead
 * of leaving the app. Each open surface owns one history entry that carries only a depth number,
 * never any payload text. Surfaces closed from the interface release their own entry.
 */

const stack = [];
let listening = false;

function entryDepth() {
  return Number(window.history.state?.qrLayerDepth) || 0;
}

function settleReleasedLayers() {
  const top = stack[stack.length - 1];

  if (top?.released) {
    stack.pop();
    window.history.back();
  }
}

function handlePopState() {
  const depth = entryDepth();

  while (stack.length > depth) {
    const layer = stack.pop();

    if (!layer.released) {
      layer.onPop();
    }
  }

  settleReleasedLayers();
}

function ensureListener() {
  if (listening) {
    return;
  }

  listening = true;
  window.addEventListener('popstate', handlePopState);

  if (entryDepth() > 0) {
    window.history.go(-entryDepth());
  }
}

function pushLayer(onPop) {
  ensureListener();

  const layer = { onPop, released: false };

  stack.push(layer);
  window.history.pushState({ qrLayerDepth: stack.length }, '');

  return layer;
}

function releaseLayer(layer) {
  const index = stack.indexOf(layer);

  if (index === -1) {
    return;
  }

  layer.released = true;
  settleReleasedLayers();
}

/**
 * @param {boolean} open Whether the surface is currently showing.
 * @param {() => void} onPop Called when the system back action dismisses the surface.
 */
export function useHistoryLayer(open, onPop) {
  const onPopRef = useRef(onPop);

  useEffect(() => {
    onPopRef.current = onPop;
  });

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let layer = null;
    const timer = window.setTimeout(() => {
      layer = pushLayer(() => onPopRef.current());
    }, 0);

    return () => {
      window.clearTimeout(timer);

      if (layer) {
        releaseLayer(layer);
      }
    };
  }, [open]);
}
