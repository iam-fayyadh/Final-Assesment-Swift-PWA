/* eslint-disable no-plusplus */
import { gql } from '@apollo/client';
import { features, modules } from '@config';

const productDetail = `
    id
    name
    sku
    ${modules.catalog.productListing.label.sale.enabled ? 'sale' : ''}
    stock_status
    url_key
    __typename
    attribute_set_id
    small_image{
      url(width: ${features.imageSize.product.width}, height: ${features.imageSize.product.height}),
      label
    }
    image{
      url
    }
    review {
      rating_summary
      reviews_count
    }
    categories {
      id
      name
      url_path
      breadcrumbs {
        category_id
        category_url_path
        category_name
      }
    }
    special_from_date
    special_to_date

    `;
const priceRange = `
    price_range {
      minimum_price {
        discount {
          amount_off
          percent_off
        }
        final_price {
          currency
          value
        }
        fixed_product_taxes {
          amount {
            currency
            value
          }
          label
        }
        regular_price {
          currency
          value
        }
      }
      maximum_price {
         discount {
          amount_off
          percent_off
        }
        final_price {
          currency
          value
        }
        fixed_product_taxes {
          amount {
            currency
            value
          }
          label
        }
        regular_price {
          currency
          value
        }
      }
    }
    `;

const priceTiers = `
    price_tiers {
      discount {
        amount_off
        percent_off
      }
      final_price {
        currency
        value
      }
      quantity
    }
    `;

/**
 * scema dynamic resolver url
 * @param url String
 * @returns grapql query
 */

export const getProduct = (url) => {
    const query = gql`{
        products(
            search: "" ,filter: {
              url_key: {
                eq: "${url}"
              }
            }
          ) {
            items {
              ${productDetail}
              ${priceRange}
              ${priceTiers}
              description {
                html
              }
              ${modules.brands.enabled ? 'brand' : ''}
              short_description {
                html
              }
              more_info {
                label
                value
              }
              upsell_products {
                ${productDetail}
                ${priceRange}
                ${priceTiers}
              }
              media_gallery {
                label,
                url
              }
              related_products {
               ${productDetail}
               ${priceRange}
               ${priceTiers}
              }
            }
            total_count
          }
    }`;
    return query;
};

export const getProductBySku = () => {
    const query = gql`query(
      $sku: [String]
    ){
        products(
            search: "" ,filter: {
              sku: {
                in: $sku
              }
            }
          ) {
            items {
              ${productDetail}
              ${priceRange}
              ${priceTiers}
              description {
                html
              }
              ${modules.brands.enabled ? 'brand' : ''}
              short_description {
                html
              }
              more_info {
                label
                value
              }
              upsell_products {
                ${productDetail}
                ${priceRange}
                ${priceTiers}
              }
              media_gallery {
                label,
                url
              }
              related_products {
               ${productDetail}
               ${priceRange}
               ${priceTiers}
              }
            }
            total_count
          }
    }`;
    return query;
};

export const getBundleProduct = (sku) => {
    const query = gql`{
    products(
      search: "" ,filter: {
        sku: {
          eq: "${sku}"
        }
      }
    ) {
      items {
        ... on BundleProduct {
          id
          name
          url_key
          items {
            position
            option_id
            title
            type
            required
            options {
              id
              is_default
              label
              quantity
              product {
                id
                name
                price_range {
                  minimum_price {
                    discount {
                      amount_off
                      percent_off
                    }
                    final_price {
                      currency
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;
    return query;
};

export const getDownloadProduct = (sku) => {
    const query = gql`{
      products(
        search: "" ,filter: {
          sku: {
            eq: "${sku}"
          }
        }
      ) {
        items {
          ... on DownloadableProduct {
            id
            name
            url_key
            downloadable_product_links {
              id
              uid
              title
              price
            }
          }
        }
      }
    }`;
    return query;
};

export const getConfigurableProduct = (sku) => {
    const query = gql`{
      products(
        search: "" ,filter: {
          sku: {
            eq: "${sku}"
          }
        }
      ) {
        items {
          ... on ConfigurableProduct {
            configurable_options {
              id
              attribute_id
              label
              position
              use_default
              attribute_code
              values {
                value_index
                label
                swatch_data {
                  value
                  ... on ImageSwatchData {
                    thumbnail
                    value
                  }
                  ... on ColorSwatchData {
                    value
                  }
                  ... on TextSwatchData {
                    value
                  }
                }
              }
              product_id
            }
            variants {
              product {
                ${productDetail}
                ${priceRange}
                ${priceTiers}
                media_gallery {
                  label,
                  url
                }
              }
              attributes {
                label
                code
                value_index
              }
            }
          }
        }
      }
    }`;
    return query;
};

export const createEmptyCartGuest = gql`
    mutation {
        createEmptyCart
    }
`;

export const addSimpleProductsToCart = gql`
mutation addSimpleProductsToCart(
    $cartId: String!,
    $qty: Float!,
    $sku: String!,
) {
    addSimpleProductsToCart(input:{
      cart_id: $cartId,
      cart_items: {
        data: {
          quantity: $qty,
          sku: $sku
        }
      }
    }) {
      cart {
        id
        total_quantity
      }
    }
  }
`;

export const addVirtualProductToCart = gql`
mutation addVirtualProductToCart(
    $cartId: String!,
    $qty: Float!,
    $sku: String!,
) {
    addVirtualProductsToCart(input:{
      cart_id: $cartId,
      cart_items: {
        data: {
          quantity: $qty,
          sku: $sku
        }
      }
    }) {
      cart {
        id
        total_quantity
      }
    }
  }
`;

export const addDownloadableProductsToCart = gql`
mutation(
  $cartId : String!,
  $sku: String!,
  $qty: Float!,
  $download_product_link: [DownloadableProductLinksInput]
) {
  addDownloadableProductsToCart(
    input: {
      cart_id: $cartId
      cart_items: {
        data: {
          sku: $sku
          quantity: $qty
        }
        downloadable_product_links: $download_product_link
      }
    }
  ) {
    cart {
      total_quantity
      items {
        product {
          sku
        }
        quantity
        ... on DownloadableCartItem {
          links {
            title
            price
          }
          samples {
            title
            sample_url
          }
        }
      }
    }
  }
}
`;

export const addConfigProductsToCart = gql`
mutation (
  $cartId: String!,
  $qty: Float!,
  $sku: String!,
  $parentSku: String!,
) {
  addConfigurableProductsToCart(
    input: {
      cart_id: $cartId,
      cart_items: {
        data: {
          quantity : $qty,
          sku: $sku
        }
        parent_sku: $parentSku
      }
    }
  ) {
    cart {
      id
      total_quantity
    }
  }
}
`;

export const addBundleProductsToCart = gql`
mutation(
  $cartId : String!,
  $sku: String!,
  $qty: Float!,
  $download_product_link: [DownloadableProductLinksInput]
) {
  addDownloadableProductsToCart(
    input: {
      cart_id: $cartId
      cart_items: {
        data: {
          sku: $sku
          quantity: $qty
        }
        downloadable_product_links: $download_product_link
      }
    }
  ) {
    cart {
      items {
        product {
          sku
        }
        quantity
        ... on DownloadableCartItem {
          links {
            title
            price
          }
          samples {
            title
            sample_url
          }
        }
      }
    }
  }
}
`;

export const addReview = gql`
    mutation createReview($nickname: String!, $rating: Int!, $title: String!, $detail: String!, $pkValue: Int!) {
        addProductReview(
            input: {
                entity_pk_value: $pkValue
                title: $title
                detail: $detail
                nickname: $nickname
                ratings: { rating_name: "Rating", value: $rating }
            }
        ) {
            message
        }
    }
`;

export const getReview = () => {
    const query = gql`
        query getReview($sku: String!, $pageSize: Int, $currentPage: Int) {
            getProductReviews(sku: $sku, pageSize: $pageSize, currentPage: $currentPage) {
                items {
                    id
                    nickname
                    ratings {
                        rating_name
                        value
                    }
                    entity_pk_value
                    review_entity
                    review_type
                    review_status
                    title
                    detail
                    created_at
                }
                message
                totalCount
            }
        }
    `;
    return query;
};

export const addWishlist = gql`
    mutation addWishlist($productId: Int!) {
        addProductToWishlist(productId: $productId) {
            info
        }
    }
`;

export const createCartIdGuest = gql`
    mutation {
        createEmptyCart
    }
`;

export const getCartIdUser = gql`
    {
        customerCart {
            id
        }
    }
`;

export default {
    createEmptyCartGuest,
    addSimpleProductsToCart,
};