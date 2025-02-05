// @flow
type PDPInfo = {
  productId: string | number | null,
  variantId: string | number | null,
};

type PDPInfoNext = {
  nextProductId: string | number | null,
  nextVariantId: string | number | null,
};

function findShopifyVariantId() {
  const variantNode = document.querySelector('.product__pickup-availabilities');
  if (variantNode?.dataset?.variantId) {
    return variantNode.dataset.variantId;
  }
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('variant')) {
    return urlParams.get('variant');
  }
  return null;
}

async function getShopifyPDPInfo() {
  const result: {
    productId: string | number | null,
    variantId: string | number | null,
  } = { productId: null, variantId: null };
  try {
    const product = await fetch(`${window.location.pathname}.json`);
    const productJson = await product.json();
    if (productJson && productJson.product) {
      result.productId = productJson.product.id;
      const variantId = findShopifyVariantId();
      if (variantId) {
        result.variantId = variantId;
      } else if (productJson.product.variants?.length > 0) {
        result.variantId = productJson.product.variants[0].id;
      }
      return result;
    }
  } catch (error) {
    console.error(error);
  }
  return result;
}

function updateShopifyCartNodes(
  element: HTMLElement,
  prevId: string | number,
  nextId: string | number,
) {
  let updated = false;
  const cartFormChildren = element.querySelectorAll('*');
  [element, ...cartFormChildren].forEach((node) => {
    for (let i = 0; i < node.attributes.length; i += 1) {
      const { name, value } = node.attributes[i];
      if (typeof value === 'string' && value.includes(`${prevId}`)) {
        updated = true;
        node.setAttribute(name, value.replace(`${prevId}`, `${nextId}`));
      }
    }
  });
  return updated;
}

function modifyShopifyCartForm(
  cartForm: HTMLElement,
  pdpInfo: PDPInfo,
  pdpInfoNext: PDPInfoNext,
) {
  let updatedProduct = false;
  let updatedVariant = false;
  const { productId, variantId } = pdpInfo;
  const { nextProductId, nextVariantId } = pdpInfoNext;
  if (nextProductId && productId) {
    updatedProduct = updateShopifyCartNodes(cartForm, productId, nextProductId);
  }
  if (nextVariantId && variantId) {
    updatedVariant = updateShopifyCartNodes(cartForm, variantId, nextVariantId);
  }
  return updatedProduct || updatedVariant;
}

function findShopifyCartForm() {
  const cartForms = document.querySelectorAll(
    'form[action="/cart/add"]:has(button)',
  );
  for (const cartForm of cartForms) {
    const buttons = cartForm.querySelectorAll('button[type="submit"]');
    for (const btn of buttons) {
      const btnText = btn.textContent.trim().toLowerCase();
      if (btnText.includes('add to')) {
        return {
          cartForm,
          cartFormButton: btn,
        };
      }
    }
  }
  return {
    cartForm: null,
    cartFormButton: null,
  };
}

export default async function addToShopifyPDPCart(
  nextProductId: string | number,
  nextVariantId: string | number,
) {
  try {
    const { cartForm, cartFormButton } = findShopifyCartForm();
    if (!cartForm || !cartFormButton) {
      throw new Error('PG: No cart form found on page');
    }
    const pdpInfo = await getShopifyPDPInfo();
    const pdpInfoNext = { nextProductId, nextVariantId };
    const updated = modifyShopifyCartForm(cartForm, pdpInfo, pdpInfoNext);
    if (updated) {
      cartFormButton.click();
      setTimeout(() => {
        modifyShopifyCartForm(
          cartForm,
          {
            productId: nextProductId,
            variantId: nextVariantId,
          },
          {
            nextProductId: pdpInfo.productId,
            nextVariantId: pdpInfo.variantId,
          },
        );
      }, 0);
    }
  } catch (error) {
    console.error(error);
  }
}
