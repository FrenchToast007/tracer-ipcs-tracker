import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Scroll to the element with the given id, smoothly, and flash a yellow ring
 * to highlight it. If the element isn't in the DOM yet (e.g. because a tab
 * switch hasn't finished rendering), retry for up to ~500ms before giving up.
 */
export function scrollToAnchorWithRetry(anchorId: string): void {
  const highlight = (el: HTMLElement) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.add('ring-4', 'ring-yellow-400');
    setTimeout(() => {
      el.classList.remove('ring-4', 'ring-yellow-400');
    }, 2000);
  };

  const immediate = document.getElementById(anchorId);
  if (immediate) {
    highlight(immediate);
    return;
  }

  // Element isn't rendered yet — poll a few frames for it.
  const start = Date.now();
  const poll = () => {
    const el = document.getElementById(anchorId);
    if (el) {
      highlight(el);
      return;
    }
    if (Date.now() - start < 500) {
      requestAnimationFrame(poll);
    }
  };
  requestAnimationFrame(poll);
}
