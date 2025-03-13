// @flow
import { getProductAttributes, openTargetURL } from './componentUtils';
import * as cartCallbacks from './cartCallbacks';
import type { ChatController } from '../ChatController';
import safeLocalStorage from './safeLocalStorage';
import addToShopifyPDPCart from './cartPDP';

import type {
  Product,
  CallToAction,
  CouponCardInfo,
  CartFlowAction,
  AppLanguage,
} from '../entities';

const cartTrackingMessageMapping = {
  add_to_cart: 'product added to cart',
  buy_now: 'product directly checked out',
};

let appLanguage: ?AppLanguage = null;

function getLanguageString(path: Array<string>): string {
  if (!appLanguage) {
    appLanguage = JSON.parse(
      safeLocalStorage.getItem('GAMALON-pg-language') || '{}',
    );
  }
  if (appLanguage) {
    return appLanguage[path[0]]?.[path[1]] || '';
  }
  return '';
}

function trackCartProduct(controller: ChatController, action: CallToAction) {
  if (
    action.type === 'add_to_cart'
    || action.type === 'buy_now'
  ) {
    const { product } = action;
    const {
      upsell = false,
      personalized = false,
      previously_purchased: purchased = false,
    } = getProductAttributes(product.attributes);
    const headerInfo = safeLocalStorage.getItem('GAMALON-pg-header-info');
    controller.analytics.track(cartTrackingMessageMapping[action.type], {
      title: product.title,
      sku: product.sku,
      product_url: product.product_url,
      variant_id: product.variant_id,
      product_id: product.product_id,
      header_info: headerInfo ? JSON.parse(headerInfo) : {},
      upsell,
      personalized,
      purchased,
    });
  }
}

const updateCartState = (controller: ChatController, action: CallToAction) => {
  controller.callbacks.callToAction(action);
  trackCartProduct(controller, action);
};

class SubscriptionHook {
  #subscriptionMap: Map<string, string>;
  #initalized: boolean;
  constructor() {
    this.#initalized = false;
    this.#subscriptionMap = new Map<string, string>();
    Object.freeze(this);
  }

  getVariantSubscription(variantId: string): ?string {
    return this.#subscriptionMap.get(variantId);
  }

  setup() {
    if (!this.#initalized) {
      this.#initalized = true;
      document.addEventListener('sealsubs:selling_plan_changed', (e: MessageEvent) => {
        // $FlowIgnore
        const { element, selling_plan_id: sellingPlan } = e.detail;
        const variantId = element ? element.getAttribute('data-product-id') : null;
        if (variantId) {
          if (sellingPlan) {
            this.#subscriptionMap.set(variantId, sellingPlan);
          } else {
            this.#subscriptionMap.delete(variantId);
          }
        }
      });
    }
  }
}

const subscriptionHook: SubscriptionHook = new SubscriptionHook();
subscriptionHook.setup();

export async function addShopifyCartItem(
  variantId: number,
  subscription?: string | null,
  sections?: string,
  type: string,
): Promise<any> {
  try {
    const payloadItem = {
      id: variantId,
      quantity: 1,
    };
    const payloadSections = sections || undefined;

    if (subscription) {
      // $FlowIgnore
      payloadItem.selling_plan = subscription;
      // $FlowIgnore
      payloadItem.subs_interval = subscription;
      // $FlowIgnore
      payloadItem.subs_type_ebqns58jhlkomod = '0';
    }
    const payload = {
      items: [payloadItem],
      sections: payloadSections,
    };
    if (type === 'form') {
      const formData = new FormData();
      formData.append('id', `${variantId}`);
      if (payload.sections) {
        formData.append('sections', payload.sections);
      }
      return await fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        body: formData,
      }).then((response) => response.json());
    }
    return await fetch(`${window.Shopify.routes.root}cart/add.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((response) => response.json());
  } catch (error) {
    console.error(error);
  }
  return null;
}

function getCartResponseItem(response: any) {
  if (response) {
    if (response.items) {
      const [item] = response.items;
      if (item && response.sections) {
        item.sections = response.sections;
      }
      return item;
    }
    if (response.handle) {
      return response;
    }
  }
  return null;
}

export async function addToCartOpenURL(
  controller: ChatController,
  product: Product,
) {
  openTargetURL(product.product_url);
  trackCartProduct(controller, {
    type: 'add_to_cart',
    product,
  });
}

export function extractCouponData(): ?CouponCardInfo {
  const coupon = safeLocalStorage.getItem('GAMALON-pg-cart-coupon');
  return coupon ? JSON.parse(coupon) : null;
}

export function generateCheckoutURL(cartURL: string): string {
  const cartProducts = JSON.parse(
    safeLocalStorage.getItem('GAMALON-pg-cart-products') || '{}',
  );
  const productKeys = Object.keys(cartProducts);
  if (productKeys.length !== 0) {
    const checkoutURL = productKeys.reduce((acc, variantId, index) => {
      const quantity = cartProducts[variantId]?.quantity || 1;
      const nextParam = `${index === 0 ? '' : ','}${variantId}:${quantity}`;
      return `${acc}${nextParam}`;
    }, `${cartURL}/`);
    const couponData = extractCouponData();
    if (couponData?.code) {
      return `${checkoutURL}?discount=${couponData.code}`;
    }
    return checkoutURL;
  }
  return '';
}

export const handleCheckoutAction = (controller: ChatController) => {
  const { type, cartURL, checkout } = JSON.parse(
    safeLocalStorage.getItem('GAMALON-pg-cart-config') || '{"type":"default"}',
  );
  if (type === 'internal' && cartURL) {
    const checkoutURL = generateCheckoutURL(cartURL);
    if (checkoutURL) {
      window.open(checkoutURL, '_blank');
    }
  } else if (checkout?.type === 'node-click' && checkout?.node) {
    const targetElement = document.querySelector(checkout.node);
    if (targetElement) {
      targetElement.click();
    }
  } else if (checkout?.type === 'open-url' && checkout?.url) {
    window.open(checkout.url);
  }
  controller.callbacks.callToAction({ type: 'clear_action_calls' });
  controller.analytics.track('clicked checkout button');
};

export function getCheckoutURL(): string {
  const baseURL = window.location.hostname;
  if (!baseURL || baseURL.includes('localhost')) {
    return '';
  }
  return `https://${baseURL}/cart`;
}

export function checkoutProduct(controller: ChatController, product: Product) {
  const checkoutURL = getCheckoutURL();
  if (checkoutURL) {
    trackCartProduct(controller, { type: 'buy_now', product });
    window.open(`${checkoutURL}/${product.variant_id}:1`, '_blank');
  }
}

function getSubscriontData(product: Product): ?string {
  if (product?.variant_id) {
    const subscription = subscriptionHook.getVariantSubscription(`${product.variant_id}`);
    if (subscription) {
      return subscription;
    }
  }
  if (product?.product_id) {
    const subscription = subscriptionHook.getVariantSubscription(`${product.product_id}`);
    if (subscription) {
      return subscription;
    }
  }
  return null;
}

function isShopifyPDP(): boolean {
  return (
    window.location.pathname.includes('/products/') && window.Shopify?.shop
  );
}

export const onCallToActionCart = async (
  controller: ChatController,
  action: CallToAction,
) => {
  if (action.type === 'add_to_cart') {
    const {
      type,
      cartPDP,
      callback,
      cartFlow,
      sections,
      sectionExtractor,
      sectionConfig,
    } = JSON.parse(safeLocalStorage.getItem('GAMALON-pg-cart-config') || '{}');
    try {
      if (!window.Shopify?.routes?.root || type === 'open-url') {
        addToCartOpenURL(controller, action.product);
        return;
      }

      if (cartPDP?.enabled && isShopifyPDP()) {
        await addToShopifyPDPCart(action.product.product_id, action.product.variant_id);
        return;
      }

      controller.callbacks.loading(true);
      let sectionsInput = sections;
      const subscription = getSubscriontData(action.product);
      if (sectionExtractor?.selector && sectionExtractor?.attribute) {
        const element = document.querySelector(sectionExtractor.selector);
        if (element) {
          const sectionId = element.getAttribute(sectionExtractor.attribute);
          if (sectionId) {
            sectionsInput = sectionId;
          }
        }
      }
      const response = await addShopifyCartItem(
        action.product.variant_id,
        subscription,
        sectionsInput,
        type,
      );
      const cartItem = getCartResponseItem(response);
      if (cartItem) {
        if (callback && cartCallbacks[callback]) {
          await cartCallbacks[callback](cartItem, sectionConfig);
        }
        updateCartState(controller, action);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (cartFlow) {
        cartFlow.forEach((step: CartFlowAction) => {
          if (step.type === 'node_set') {
            const node = document.querySelector(step.selector);
            if (node && step.prop) {
              if (step.value === 'PG_VARIANT_ID') {
                node.setAttribute(step.prop, `${action.product.variant_id}`);
              } else {
                node.setAttribute(step.prop, step.value);
              }
            }
          } else if (step.type === 'node_click') {
            const node = document.querySelector(step.selector);
            if (node) {
              node.click();
            }
          }
        });
      }
      controller.callbacks.loading(false);
    }
  } else if (action.type === 'add_coupon') {
    safeLocalStorage.setItem('GAMALON-pg-cart-coupon', JSON.stringify(action.couponInfo));
    controller.callbacks.callToAction(action);
  }
};

export function applyCouponURL(
  controller: ChatController,
  couponConfig: { [string]: CouponCardInfo },
) {
  const params = new URLSearchParams(window.location.search);
  const couponCode = params.get('coupon');
  if (couponCode) {
    const config = couponConfig[couponCode];
    onCallToActionCart(controller, {
      type: 'add_coupon',
      couponInfo: {
        code: couponCode,
        title: config?.title || 'Discount coupon',
        description: config?.description || 'URL discount coupon',
        discount: config?.discount || 15,
        banner: config?.banner || '',
        render_key: config?.render_key || '',
      },
    });
  }
}

export function getQuantityPrice(
  price: string | number,
  quantity: number,
): number {
  let priceFormatted = price;
  if (typeof priceFormatted === 'string') {
    priceFormatted = priceFormatted.trim().replace('$', '').split(',').join('');
  }
  const priceNum = parseFloat(priceFormatted);
  if (!Number.isNaN(priceNum)) {
    const total = priceNum * quantity;
    return Math.round(total * 100) / 100;
  }
  return 0;
}

export function cartButtonTitle(
  product: Product,
) : string {
  const {
    available = true,
    personalized = false,
    previously_purchased: purchased = false,
    reorder_text: reorderText = false,
  } = getProductAttributes(product.attributes);
  if (available) {
    if (reorderText) {
      return reorderText;
    }
    if (personalized || purchased) {
      const reorder = getLanguageString(['buttons', 'reorder']);
      return reorder || 'Reorder';
    }
    const cart = getLanguageString(['buttons', 'cart']);
    return cart || 'Add to cart';
  }
  return 'Out of stock';
}

export function isValidPrice(price: string): boolean {
  if (!price || price === '0.00' || price === '0.0' || price === '0') {
    return false;
  }
  return true;
}
