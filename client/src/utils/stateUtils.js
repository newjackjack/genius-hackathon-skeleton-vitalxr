// @flow
/* eslint-disable no-param-reassign */
import { produce } from 'immer';
import { Analytics } from '../analytics';
import type {
  AppConfig,
  AppDesignProps,
  AppProps,
  ContextConfigProps,
} from '../entities';
import safeLocalStorage from './safeLocalStorage';

export const defaultDesign: AppDesignProps = {
  layout: 'embedded',
  pageActions: {
    hide: [],
  },
  language: {
    buttons: {
      cart: 'Add to cart',
      reorder: 'Reorder',
    },
  },
  pagination: {
    enabled: false,
    persistent: false,
    offset: 0.8,
  },
  merchant: {
    enabled: false,
    sequenceLines: false,
    mode: 'preview',
  },
  style: {
    global: '',
    merchant: '',
    layout: '',
    grid: {
      enabled: false,
      mobile: {
        columns: 1,
      },
      desktop: {
        columns: 4,
      },
    },
  },
  container: {
    style: '',
  },
  flags: {
    sourcePDP: false,
  },
  rendering: {
    context: {},
  },
  coupon: {},
  navigation: {
    type: 'breadcrumbs',
  },
  product: {
    enableRating: false,
    enableCart: false,
    enableBuyNow: false,
    enableReorder: true,
    enableShipping: false,
    enableSubTitle: false,
    enableVendor: false,
    enableOptions: false,
    enableForceOptions: false,
    enableBackupImage: false,
    enableHighlights: true,
    enableVariantInfo: false,
    enableCurrency: false,
    enableSubscriptions: false,
  },
  allowedPagePatterns: [],
  pagePatterns: [],
  embedded: {
    scrollSource: '',
    banner: {
      visible: true,
      type: 'content',
      content: {
        title: '',
        description: '',
        image: '',
      },
    },
    filters: {
      visible: false,
      navigation: {
        title: '',
        options: [],
      },
    },
    menu: {
      visible: false,
    },
  },
  url: {
    redirect: false,
    target: 'external',
  },
  cart: {
    type: 'default',
    cartFlow: [],
    callback: '',
    sections: '',
    cartURL: '',
    callbackConfig: {
      nodes: [],
    },
    checkout: {
      type: 'default',
      node: '',
      url: '',
    },
    cartPDP: {
      enabled: false,
    },
    sectionExtractor: {
      selector: '',
      attribute: '',
    },
    sectionConfig: {
      type: 'inner',
      extractors: {},
    },
  },
  tracking: {
    source: {
      enabled: false,
      rules: [],
    },
    feed: {
      enabled: false,
      metrics: {
        enabled: false,
        heatmap: false,
        color_heatmap: false,
        interval: 5000,
      },
      thresholds: [0.3, 0.7],
    },
  },
};

export function getDesignConfig(config: AppConfig): AppDesignProps {
  const { design } = config;
  return produce(defaultDesign, (draftState) => {
    draftState.layout = design?.layout || draftState.layout;
    draftState.pageActions = {
      hide: design?.pageActions?.hide || draftState.pageActions.hide,
    };
    draftState.language = {
      buttons: {
        cart: design?.language?.buttons?.cart || draftState.language.buttons.cart,
        reorder: design?.language?.buttons?.reorder || draftState.language.buttons.reorder,
      },
    };
    draftState.pagination = {
      enabled: design?.pagination?.enabled ?? draftState.pagination.enabled,
      persistent: design?.pagination?.persistent ?? draftState.pagination.persistent,
      offset: design?.pagination?.offset ?? draftState.pagination.offset,
    };
    draftState.merchant = {
      enabled: design?.merchant?.enabled ?? draftState.merchant.enabled,
      sequenceLines: design?.merchant?.sequenceLines ?? draftState.merchant.sequenceLines,
      mode: design?.merchant?.mode || draftState.merchant.mode,
    };
    draftState.flags = {
      sourcePDP:
        design?.flags?.sourcePDP ?? draftState.flags.sourcePDP,
    };
    draftState.style = {
      global: design?.style?.global || draftState.style.global,
      merchant: design?.style?.merchant || draftState.style.merchant,
      layout: design?.style?.layout || draftState.style.layout,
      grid: {
        enabled: design?.style?.grid?.enabled ?? draftState.style.grid.enabled,
        mobile: {
          columns: design?.style?.grid?.mobile?.columns
            || draftState.style.grid.mobile.columns,
        },
        desktop: {
          columns: design?.style?.grid?.desktop?.columns
            || draftState.style.grid.desktop.columns,
        },
      },
    };
    draftState.container = {
      style: design?.container?.style ?? draftState.container.style,
    };
    draftState.coupon = design?.coupon || draftState.coupon;
    draftState.rendering = {
      context: design?.rendering?.context || draftState.rendering.context,
    };
    draftState.navigation = {
      type: design?.navigation?.type || draftState.navigation.type,
    };
    draftState.product = {
      enableRating: design?.product?.enableRating ?? draftState.product.enableRating,
      enableCart: design?.product?.enableCart ?? draftState.product.enableCart,
      enableBuyNow: design?.product?.enableBuyNow ?? draftState.product.enableBuyNow,
      enableReorder: design?.product?.enableReorder ?? draftState.product.enableReorder,
      enableVendor: design?.product?.enableVendor ?? draftState.product.enableVendor,
      enableOptions: design?.product?.enableOptions ?? draftState.product.enableOptions,
      enableForceOptions:
        design?.product?.enableForceOptions
        ?? draftState.product.enableForceOptions,
      enableShipping: design?.product?.enableShipping ?? draftState.product.enableShipping,
      enableSubTitle: design?.product?.enableSubTitle ?? draftState.product.enableSubTitle,
      enableBackupImage: design?.product?.enableBackupImage ?? draftState.product.enableBackupImage,
      enableHighlights: design?.product?.enableHighlights ?? draftState.product.enableHighlights,
      enableVariantInfo: design?.product?.enableVariantInfo ?? draftState.product.enableVariantInfo,
      enableCurrency: design?.product?.enableCurrency ?? draftState.product.enableCurrency,
      enableSubscriptions:
        design?.product?.enableSubscriptions
        ?? draftState.product.enableSubscriptions,
    };
    draftState.allowedPagePatterns = design?.allowedPagePatterns
      || draftState.allowedPagePatterns;
    draftState.pagePatterns = design?.pagePatterns || draftState.pagePatterns;
    draftState.embedded = {
      scrollSource: design?.embedded?.scrollSource || draftState.embedded.scrollSource,
      banner: {
        visible: design?.embedded?.banner?.visible ?? draftState.embedded.banner.visible,
        type: design?.embedded?.banner?.type || draftState.embedded.banner.type,
        content: {
          title: design?.embedded?.banner?.content?.title || '',
          description: design?.embedded?.banner?.content?.description || '',
          image: design?.embedded?.banner?.content?.image || '',
        },
      },
      filters: {
        visible: design?.embedded?.filters?.visible ?? draftState.embedded.filters.visible,
        navigation: {
          title: design?.embedded?.filters?.navigation?.title || '',
          options: design?.embedded?.filters?.navigation?.options || [],
        },
      },
      menu: {
        visible: design?.embedded?.menu?.visible ?? draftState.embedded.menu.visible,
      },
    };
    draftState.url = {
      redirect: design?.url?.redirect ?? draftState.url.redirect,
      target: design?.url?.target || draftState.url.target,
    };
    draftState.cart = {
      type: design?.cart?.type || draftState.cart.type,
      callback: design?.cart?.callback || draftState.cart.callback,
      sections: design?.cart?.sections || draftState.cart.sections,
      cartURL: design?.cart?.cartURL || draftState.cart.cartURL,
      cartFlow: design?.cart?.cartFlow || draftState.cart.cartFlow,
      cartPDP: {
        enabled:
          design?.cart?.cartPDP?.enabled
          ?? draftState.cart.cartPDP.enabled,
      },
      callbackConfig: {
        nodes:
          design?.cart?.callbackConfig?.nodes
          || draftState.cart.callbackConfig.nodes,
      },
      checkout: {
        type: design?.cart?.checkout?.type || draftState.cart.checkout.type,
        node: design?.cart?.checkout?.node || draftState.cart.checkout.node,
        url: design?.cart?.checkout?.url || draftState.cart.checkout.url,
      },
      sectionExtractor: {
        selector:
          design?.cart?.sectionExtractor?.selector
          || draftState.cart.sectionExtractor.selector,
        attribute:
          design?.cart?.sectionExtractor?.attribute
          || draftState.cart.sectionExtractor.attribute,
      },
      sectionConfig: {
        type: design?.cart?.sectionConfig?.type || draftState.cart.sectionConfig.type,
        extractors: design?.cart?.sectionConfig?.extractors
          || draftState.cart.sectionConfig.extractors,
      },
    };
    draftState.tracking = {
      source: {
        enabled:
          design?.tracking?.source?.enabled
          ?? draftState.tracking.source.enabled,
        rules:
          design?.tracking?.source?.rules || draftState.tracking.source.rules,
      },
      feed: {
        enabled:
          design?.tracking?.feed?.enabled ?? draftState.tracking.feed.enabled,
        metrics: {
          enabled:
            design?.tracking?.feed?.metrics?.enabled
            ?? draftState.tracking.feed.metrics.enabled,
          heatmap:
            design?.tracking?.feed?.metrics?.heatmap
            ?? draftState.tracking.feed.metrics.heatmap,
          color_heatmap:
            design?.tracking?.feed?.metrics?.color_heatmap
            ?? draftState.tracking.feed.metrics.color_heatmap,
          interval:
            design?.tracking?.feed?.metrics?.interval
            || draftState.tracking.feed.metrics.interval,
        },
        thresholds:
          design?.tracking?.feed?.thresholds
          || draftState.tracking.feed.thresholds,
      },
    };
  });
}

export const defaultContextConfig = {
  // $FlowIgnore
  analytics: new Analytics(),
  organizationId: '',
  serverURL: '',
  serverBehavior: { expand_single_product: false, fetch_provider: 'REST' },
  flags: defaultDesign.flags,
};

// Returns immutable immer object, so we
// can pass it to the context provider.
export function getContextConfigProps(
  props: AppProps,
): ContextConfigProps {
  return produce(defaultContextConfig, (draftState) => {
    draftState.serverBehavior = props.serverBehavior || draftState.serverBehavior;
    draftState.organizationId = props.organizationId || draftState.organizationId;
    draftState.serverURL = props.serverURL || draftState.serverURL;
    draftState.analytics = props.analytics || draftState.analytics;
    draftState.flags = props.design.flags || draftState.flags;
  });
}

export function setStorageFlags(design: AppDesignProps) {
  safeLocalStorage.setItem('GAMALON-pg-url-target', design.url.target);
  safeLocalStorage.setItem('GAMALON-pg-url-redirect', design.url.redirect);
  if (design.cart) {
    safeLocalStorage.setItem('GAMALON-pg-cart-config', JSON.stringify(design.cart));
  }
  if (design.language) {
    safeLocalStorage.setItem('GAMALON-pg-language', JSON.stringify(design.language));
  }
}
