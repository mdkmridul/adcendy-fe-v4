'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';

type SectionLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  sectionId: string;
};

/**
 * A link to a landing-page section that works every time it is clicked.
 *
 * A plain `/#pricing` link does nothing once `#pricing` is already in the URL,
 * so a second click — or two links sharing a section — left the reader where
 * they were. On the landing page this scrolls to the section itself and
 * announces the hash, so anything listening (the FAQ opening a deep-linked
 * answer) hears it even when the hash has not changed. Anywhere else it is an
 * ordinary navigation to '/', which lands on the section by itself.
 */
export function SectionLink({ sectionId, onClick, ...props }: SectionLinkProps) {
  const pathname = usePathname();
  const href = `/#${sectionId}`;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || pathname !== '/') return;
    // Leave new-tab and new-window clicks to the browser.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const target = document.getElementById(sectionId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.location.hash !== `#${sectionId}`) {
      window.history.pushState(null, '', href);
    }
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
