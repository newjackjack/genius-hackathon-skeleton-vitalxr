// @flow
import React, { useContext, useLayoutEffect, useRef } from 'react';
import type { Node } from 'react';

import { AppLoader } from '../AppComponents';
import { DesignContext } from '../../context';

export default function FeedPaginationTrigger({
  loading,
}: {
  loading: boolean,
}): Node {
  const { pagination } = useContext(DesignContext);
  const paginationEl = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    let paginationObserver = null;
    const { current: element } = paginationEl;
    if (element && pagination.enabled && pagination.offset) {
      const parent = element.parentElement;
      if (parent) {
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { scrollHeight } = entry.target;
            element.style.transform = `translateY(-${scrollHeight * (1 - pagination.offset)}px)`;
          }
        });
        resizeObserver.observe(parent);
      }
      paginationObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              window.dispatchEvent(
                new CustomEvent('pg-feed-event', {
                  detail: { type: 'pg-next-page' },
                }),
              );
            }
          });
        },
        {
          threshold: 1.0,
        },
      );
      paginationObserver.observe(element);
    }
    return () => {
      if (paginationObserver) {
        paginationObserver.disconnect();
      }
    };
  }, [pagination.enabled, pagination.offset]);

  if (!pagination.enabled) {
    return null;
  }
  return (
    <>
      {loading && <AppLoader loading type="pagination" />}
      <div ref={paginationEl} className="pg-pagination-trigger" />
    </>
  );
}
