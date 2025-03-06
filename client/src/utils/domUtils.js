// @flow
import type { AppGridConfig } from '../entities';

export function findNodePathCardId(nodePath: Array<HTMLElement>): string {
  if (nodePath && nodePath.length !== 0) {
    for (let i = 0; i < nodePath.length; i += 1) {
      const element = nodePath[i];
      if (element.className === 'card-wrapper') {
        return element.id;
      }
    }
  }
  return '';
}

export function getNearestThreshold(
  intersectionRatio: number,
  thresholds: Array<number>,
): number {
  let triggeredThreshold = thresholds[0];
  for (let i = 1; i < thresholds.length; i += 1) {
    if (intersectionRatio >= thresholds[i]) {
      triggeredThreshold = thresholds[i];
    }
  }
  return triggeredThreshold;
}

export function appendPgStylesheet(styleId: string, styleStr: string) {
  const styleNode = document.getElementById(styleId);
  if (styleNode && styleNode.parentNode) {
    styleNode.parentNode.removeChild(styleNode);
  }
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.setAttribute('id', styleId);
  // $FlowIgnore
  styleSheet.innerText = styleStr;
  if (document.head) {
    document.head.appendChild(styleSheet);
  }
}

export function updatePgStylesheet(styleId: string, styleStr: string) {
  const styleNode = document.getElementById(styleId);
  if (styleNode) {
    // $FlowIgnore
    styleNode.innerText = styleStr;
  } else {
    appendPgStylesheet(styleId, styleStr);
  }
}

export function setupPgStylePreviewBridge() {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'PG_MERCH_SET_STYLES') {
      const { payload } = event.data;
      if (payload && payload.styles) {
        updatePgStylesheet('pg-stylesheet-merchant', payload.styles);
      }
    }
  });
}

export function appendGridSettings(styleId: string, grid: AppGridConfig) {
  const styleNode = document.getElementById(styleId);
  if (styleNode && styleNode.parentNode) {
    styleNode.parentNode.removeChild(styleNode);
  }
  let styleStr = '';
  if (grid?.mobile?.columns) {
    const gridColumns = grid.mobile.columns || 1;
    styleStr = `
      @media screen and (max-width:860px) {
        .pg-embedded {
          --pg-grid-col-feed: ${gridColumns};
          --pg-aspect-ratio-card-vertical: 9 / 16;
          --pg-aspect-ratio-card-horizontal: 16 / 9;
          --pg-grid-card-1x1-feed: span 1 !important;
          --pg-grid-card-1x2-feed: span ${gridColumns} !important;
        }
        .pg-embedded .card-wrapper[data-two-col-empty='true'] {
          grid-column: span ${gridColumns};
        }
      }
    `;
  }
  if (grid?.desktop?.columns) {
    const gridColumns = grid.desktop.columns || 2;
    if (gridColumns === 1) {
      styleStr += `
        @media screen and (min-width:861px) {
          .pg-embedded {
            --pg-grid-col-feed: 1;
            --pg-grid-card-1x1-feed: span 1 !important;
            --pg-grid-card-1x2-feed: span 1 !important;
          }
        }
      `;
    } else {
      styleStr += `
        @media screen and (min-width:861px) {
          .pg-embedded {
            --pg-grid-col-feed: ${gridColumns};
            --pg-grid-card-1x1-feed: span 1 !important;
            --pg-grid-card-1x2-feed: span 2 !important;
            --pg-content-feed-seqeunce: none;
            --pg-seq-line-margin: 0;
          }
        }
      `;
    }
  }
  if (!styleStr) {
    return;
  }
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.setAttribute('id', styleId);
  styleSheet.innerText = styleStr;
  if (document.head) {
    document.head.appendChild(styleSheet);
  }
}
