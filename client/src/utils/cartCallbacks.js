/* eslint-disable no-undef */
/* eslint-disable guard-for-in */
// @flow
import safeLocalStorage from './safeLocalStorage';
import type {
  CallbackNodeConfig,
  CartFlowAction,
  SectionConfig,
} from '../entities';

export async function getShopifyCartData(): Promise<any> {
  try {
    return await fetch(`${window.Shopify.routes.root}cart.js`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json());
  } catch (error) {
    console.error(error);
  }
  return null;
}

type UpdateSections = {
  sections: { [string]: string }
}

async function updateVPScart(payload: UpdateSections) {
  try {
    for (const sectionKey in payload.sections) {
      const newContent = document.createElement('div');
      newContent.innerHTML = payload.sections[sectionKey];
      const emptyCart = document.querySelector('.mini-cart__content--empty');
      if (emptyCart) {
        emptyCart.className = 'mini-cart__inner';
      }
      const nextCartContent = newContent.querySelector('.mini-cart__inner');
      const currentCartContent = document.querySelector('.mini-cart__inner');
      if (nextCartContent && currentCartContent) {
        currentCartContent.innerHTML = nextCartContent.innerHTML;
      }
      const cartCounter = document.querySelector('.header__cart-count');
      if (cartCounter && cartCounter.textContent) {
        // $FlowIgnore
        cartCounter.textContent = Number(cartCounter.textContent) + 1;
      }
      const targetElement = document.querySelector('.header__cart-toggle');
      if (targetElement) {
        if (targetElement.getAttribute('aria-expanded') !== 'true') {
          targetElement.click();
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateLBYcart() {
  function updateInlineContent(newContent: HTMLDivElement) {
    const currentCartEl = newContent.querySelector('#sidebar-cart');
    // $FlowIgnore
    const currentCartData = currentCartEl?.getAttribute(
      'data-section-settings',
    );
    if (currentCartData) {
      const parsedCartData = JSON.parse(currentCartData);
      if (parsedCartData && parsedCartData.itemCount) {
        const cartCountNode = document.querySelector('.Header__CartCount');
        const cartItemsNode = document.querySelector('.Header__CartDot');
        if (cartCountNode) {
          cartCountNode.innerHTML = parsedCartData.itemCount;
        }
        if (
          cartItemsNode
            && !cartItemsNode.classList.contains('is-visible')
        ) {
          cartItemsNode.classList.add('is-visible');
        }
      }
    }
  }
  function updateSidebarContent(newContent: HTMLDivElement) {
    const sidebarCart = document.getElementById('sidebar-cart');
    if (sidebarCart) {
      const nextCartContent = newContent.querySelector('.Drawer__Content');
      const currentCartContent = sidebarCart.querySelector('.Drawer__Content');
      if (nextCartContent && currentCartContent) {
        currentCartContent.innerHTML = nextCartContent.innerHTML;
      }
    }
  }
  try {
    const request = new XMLHttpRequest();
    request.open('GET', `/cart?view=drawer&timestamp=${Date.now()}`);
    request.setRequestHeader('Content-type', 'application/json');
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.responseText) {
        const newContent = document.createElement('div');
        newContent.innerHTML = request.responseText;
        updateInlineContent(newContent);
        updateSidebarContent(newContent);
        const cartNode = document.querySelector(
          'a[href="/cart"][data-action="open-drawer"]',
        );
        if (cartNode) {
          cartNode.click();
        }
      }
    };
    request.send();
  } catch (error) {
    console.error(error);
  }
}

async function updateCartNode() {
  try {
    const { callbackConfig } = JSON.parse(
      safeLocalStorage.getItem('GAMALON-pg-cart-config')
        || '{"callbackConfig":{}}',
    );
    if (callbackConfig && callbackConfig.nodes) {
      const callbackNodes: Array<CallbackNodeConfig> = callbackConfig.nodes;
      if (callbackNodes.length !== 0) {
        const cartData = await getShopifyCartData();
        if (cartData && cartData.item_count) {
          const { item_count: count = 0 } = cartData;
          callbackConfig.nodes.forEach((config: CallbackNodeConfig) => {
            const {
              type,
              value = '',
              selector = '',
              prefix = '',
              suffix = '',
              suffixForm = '',
              attribute = '',
            } = config;
            const nodeSelector = document.querySelector(selector);
            if (nodeSelector) {
              if (type === 'set') {
                if (attribute && value) {
                  nodeSelector.setAttribute(attribute, value);
                }
              } else if (type === 'update') {
                if (attribute) {
                  nodeSelector.setAttribute(attribute, count);
                } else {
                  let suffixFormatted = suffix;
                  if (suffixForm) {
                    suffixFormatted = count === 1 ? suffix : `${suffix}${suffixForm}`;
                  }
                  nodeSelector.innerHTML = `${prefix}${count}${suffixFormatted}`;
                }
              }
            }
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateLeatherNeckCart() {
  if (window.SLIDECART_UPDATE) {
    window.SLIDECART_UPDATE();
  }
  if (window.SLIDECART_OPEN) {
    window.SLIDECART_OPEN();
  }
}

function findSectionNodes(node: HTMLElement) {
  const result: {
    target: HTMLElement | null,
    source: HTMLElement | null,
  } = {
    target: null,
    source: null,
  };
  function traverseChildren(currentNode: HTMLElement) {
    if (!currentNode) {
      return;
    }
    if (currentNode.id) {
      const target = document.getElementById(currentNode.id);
      if (target) {
        result.target = target;
        result.source = currentNode;
        return;
      }
    }
    if (
      currentNode.className
      && currentNode.className.trim() !== ''
      && currentNode.className !== 'shopify-section'
    ) {
      const target = document.getElementsByClassName(currentNode.className)[0];
      if (target) {
        result.target = target;
        result.source = currentNode;
        return;
      }
    }
    currentNode.childNodes.forEach((child) => {
      if (child.nodeType === 1 && child instanceof HTMLElement) {
        traverseChildren(child);
      }
    });
  }
  traverseChildren(node);
  return result;
}

async function updateCartSections(payload: UpdateSections, sectionConfig: SectionConfig) {
  if (!payload || !payload.sections) {
    return;
  }
  for (const sectionKey in payload.sections) {
    const node = document.createElement('div');
    node.innerHTML = payload.sections[sectionKey];
    const { target, source } = findSectionNodes(node);
    if (target && source) {
      if (sectionConfig?.type === 'outer') {
        target.outerHTML = source.outerHTML;
      } else {
        target.innerHTML = source.innerHTML;
      }
    }
  }
}

async function triggerCartFlow() {
  const { cartFlow } = JSON.parse(
    safeLocalStorage.getItem('GAMALON-pg-cart-config') || '{}',
  );

  if (cartFlow) {
    cartFlow.forEach((step: CartFlowAction) => {
      if (step.type === 'node_set') {
        const node = document.querySelector(step.selector);
        if (node && step.prop) {
          node.setAttribute(step.prop, step.value);
        }
      } else if (step.type === 'node_click') {
        const node = document.querySelector(step.selector);
        if (node) {
          node.click();
        }
      }
    });
  }
}

async function dispatchNotification(content: { [string]: string }) {
  const NotificationConstructor = customElements.get('cart-notification');
  if (NotificationConstructor) {
    const notification = new NotificationConstructor();
    if (notification && notification.renderContents && content) {
      notification.renderContents(content);
    }
  }
}

async function updateCymbiotika() {
  try {
    // $FlowIgnore
    if (typeof Cart !== 'undefined') {
      // $FlowIgnore
      Cart.getCart();
      const cartButton = document.querySelector('#navbar__cart');
      if (cartButton) {
        cartButton.click();
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateRidgeCart() {
  try {
    const cartData = await getShopifyCartData();
    if (window.refreshMiniCart && cartData) {
      window.refreshMiniCart(cartData);
    }
  } catch (error) {
    console.error(error);
  }
}

function getDocumentZone(sectionId: string) {
  let documentZone = document.querySelector(`#${sectionId}`);
  if (!documentZone) {
    documentZone = document.querySelector(`#shopify-section-${sectionId}`);
  }
  if (!documentZone) {
    documentZone = document.querySelector(`.${sectionId}`);
  }
  return documentZone;
}

function findSections(section: HTMLElement, sectionId: string) {
  const matches = [];
  const zone = getDocumentZone(sectionId);
  const ignore = ['SCRIPT', 'STYLE', 'META', 'LINK', 'NOSCRIPT'];
  for (let i = 0; i < section.children.length; i += 1) {
    const n = section.children[i];
    if (
      n
        && n.nodeType === 1
        && n instanceof HTMLElement
        && !ignore.includes(n.tagName)
    ) {
      let found = false;
      if (n.id) {
        const target = document.querySelector(`#${n.id}`);
        if (target) {
          found = true;
          matches.push({ target, source: n, type: 'update' });
        }
      }
      if (!found && n.classList.length > 0) {
        const selector = `.${[...n.classList].join('.')}`;
        const target = zone?.querySelector(selector) || document.querySelector(selector);
        if (target) {
          found = true;
          matches.push({ target, source: n, type: 'update' });
        }
      }
      if (!found) {
        const selector = Array.from(n.attributes, ({ name, value }) => `[${name}='${value}']`).join('');
        const target = zone?.querySelector(selector) || document.querySelector(selector);
        if (target) {
          found = true;
          matches.push({ target, source: n, type: 'update' });
        }
      }
      if (!found && zone) {
        matches.push({ target: zone, source: n, type: 'append' });
      }
    }
  }
  return matches;
}

function getExtractors(
  extractors: Array<{
    selector: string,
    type: string,
    attribute: string,
  }>,
  source: HTMLElement,
  target: HTMLElement,
) {
  for (let i = 0; i < extractors.length; i += 1) {
    const { selector, attribute, type } = extractors[i];
    const sourceElement = source.querySelector(selector);
    if (sourceElement) {
      const targetElement = target.querySelector(selector);
      if (targetElement) {
        if (type === 'attribute') {
          const value = sourceElement.getAttribute(attribute);
          if (value) {
            targetElement.setAttribute(attribute, value);
          }
        } else if (type === 'replace') {
          targetElement.outerHTML = sourceElement.outerHTML;
        }
      }
    }
  }
}

async function updateSections(
  payload: UpdateSections,
  sectionConfig: SectionConfig,
) {
  if (!payload || !payload.sections) {
    return;
  }
  for (const sectionId in payload.sections) {
    const node = document.createElement('div');
    node.innerHTML = payload.sections[sectionId];
    if (!node.firstChild || !(node.firstChild instanceof HTMLElement)) {
      return;
    }
    const matches = findSections(node.firstChild, sectionId);
    for (let i = 0; i < matches.length; i += 1) {
      const { target, source, type } = matches[i];
      if (target && source) {
        if (type === 'update') {
          if (sectionConfig?.extractors && sectionConfig?.extractors[sectionId]) {
            getExtractors(sectionConfig.extractors[sectionId], source, target);
          } else {
            target.outerHTML = source.outerHTML;
          }
        } else if (type === 'append') {
          target.appendChild(source);
        }
      }
    }
  }
}

async function updateMOS() {
  if (window._cart && window._cart.update) {
    try {
      await window._cart.update();
      const cartButton = document.querySelector('[href="/#modal--cart-drawer"]');
      if (cartButton) {
        cartButton.click();
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export {
  updateVPScart,
  updateCartNode,
  updateLBYcart,
  updateCymbiotika,
  updateLeatherNeckCart,
  triggerCartFlow,
  dispatchNotification,
  updateCartSections,
  updateRidgeCart,
  updateSections,
  updateMOS,
};
