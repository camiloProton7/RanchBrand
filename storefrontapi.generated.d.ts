/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
};

export type CartLineComponentFragment = Pick<
  StorefrontAPI.ComponentizableCartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  appliedGiftCards: Array<
    Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
      amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    }
  >;
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
        })
      | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    >
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type HeaderQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeaderQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type FooterQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  footerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FooterQuery = {
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type CollectionProductsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type CollectionProductsQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {nodes: Array<Pick<StorefrontAPI.Product, 'handle'>>};
  }>;
};

export type ProductoQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ProductoQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      compareAtPriceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
    }
  >;
};

export type CollectionQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type CollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'title' | 'handle'> & {
      products: {
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'handle' | 'description'
          > & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            images: {
              nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>;
            };
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            compareAtPriceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
          }
        >;
      };
    }
  >;
};

export type RecommendedQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type RecommendedQuery = {
  r0?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'handle' | 'availableForSale'
    > & {
      featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
    }
  >;
  r1?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'handle' | 'availableForSale'
    > & {
      featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
    }
  >;
  r2?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'handle' | 'availableForSale'
    > & {
      featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
    }
  >;
  r3?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'handle' | 'availableForSale'
    > & {
      featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
    }
  >;
  r4?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'handle' | 'availableForSale'
    > & {
      featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
    }
  >;
  r5?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'handle' | 'availableForSale'
    > & {
      featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
    }
  >;
};

export type CollectionByHandleQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type CollectionByHandleQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url' | 'altText'>>;
      products: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
            images: {
              nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>;
            };
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            compareAtPriceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            variants: {
              nodes: Array<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale'
                > & {
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                }
              >;
            };
          }
        >;
      };
    }
  >;
};

export type PersonalizableProductQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PersonalizableProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
    }
  >;
};

export type ShopPoliciesQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type ShopPoliciesQuery = {
  shop: Pick<StorefrontAPI.Shop, 'name'> & {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'title' | 'body'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'title' | 'body'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'title' | 'body'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'title' | 'body'>
    >;
  };
};

export type ProductQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'handle'
      | 'vendor'
      | 'description'
      | 'productType'
      | 'tags'
    > & {
      collections: {nodes: Array<Pick<StorefrontAPI.Collection, 'handle'>>};
      metafield?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      images: {
        nodes: Array<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
      };
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      compareAtPriceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
      };
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name'> & {
          optionValues: Array<Pick<StorefrontAPI.ProductOptionValue, 'name'>>;
        }
      >;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'quantityAvailable'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }
        >;
      };
    }
  >;
};

export type RelatedProductsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type RelatedProductsQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
          featuredImage?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText'>
          >;
          priceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          compareAtPriceRange: {
            minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
          };
          variants: {
            nodes: Array<
              Pick<StorefrontAPI.ProductVariant, 'id'> & {
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              }
            >;
          };
        }
      >;
    };
  }>;
};

export type ComboBotasQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ComboBotasQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      compareAtPriceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
      };
      variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
    }
  >;
};

export type ComboProductsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ComboProductsQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
          featuredImage?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText'>
          >;
          variants: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
        }
      >;
    };
  }>;
};

export type CamisaComboQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type CamisaComboQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {
        nodes: Array<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
      };
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }
        >;
      };
    }
  >;
};

export type SearchProductsQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type SearchProductsQuery = {
  search: Pick<StorefrontAPI.SearchResultItemConnection, 'totalCount'> & {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
        };
      }
    >;
  };
};

export type BestSellersQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type BestSellersQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'availableForSale'
      > & {
        featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
        priceRange: {minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>};
        compareAtPriceRange: {
          minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
        };
      }
    >;
  };
};

interface GeneratedQueryTypes {
  '#graphql\n  fragment Shop on Shop {\n    id\n    name\n    description\n    primaryDomain {\n      url\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  query Header(\n    $country: CountryCode\n    $headerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      ...Shop\n    }\n    menu(handle: $headerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: HeaderQuery;
    variables: HeaderQueryVariables;
  };
  '#graphql\n  query Footer(\n    $country: CountryCode\n    $footerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    menu(handle: $footerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: FooterQuery;
    variables: FooterQueryVariables;
  };
  '#graphql\n        query CollectionProducts($handle: String!) {\n          collection(handle: $handle) {\n            products(first: 100) {\n              nodes { handle }\n            }\n          }\n        }': {
    return: CollectionProductsQuery;
    variables: CollectionProductsQueryVariables;
  };
  '#graphql\n  query Producto($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      featuredImage { url altText }\n      images(first: 10) { nodes { url altText } }\n      priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount currencyCode } }\n    }\n  }\n': {
    return: ProductoQuery;
    variables: ProductoQueryVariables;
  };
  '#graphql\n  query Collection($handle: String!) {\n    collection(handle: $handle) {\n      title\n      handle\n      products(first: 15) {\n        nodes {\n          id\n          title\n          handle\n          description\n          featuredImage {\n            url\n            altText\n            width\n            height\n          }\n          images(first: 5) {\n            nodes {\n              url\n              altText\n            }\n          }\n          priceRange {\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n          compareAtPriceRange {\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: CollectionQuery;
    variables: CollectionQueryVariables;
  };
  '#graphql\n      query Recommended {\n        r0: product(handle: "gorra-redwood") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r1: product(handle: "gorra-andina") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r2: product(handle: "chaqueta-ganadera-gamuza") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r3: product(handle: "saco-bordado-rebano") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r4: product(handle: "gorra-goat") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r5: product(handle: "termo-digital-the-ranch") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n      }': {
    return: RecommendedQuery;
    variables: RecommendedQueryVariables;
  };
  '#graphql\n  query CollectionByHandle($handle: String!) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      image {\n        url\n        altText\n      }\n      products(first: 48) {\n        nodes {\n          id\n          title\n          handle\n          featuredImage {\n            url\n            altText\n          }\n          images(first: 2) {\n            nodes {\n              url\n              altText\n            }\n          }\n          priceRange {\n            minVariantPrice { amount currencyCode }\n          }\n          compareAtPriceRange {\n            minVariantPrice { amount currencyCode }\n          }\n          variants(first: 10) {\n            nodes {\n              id\n              availableForSale\n              selectedOptions { name value }\n              price { amount currencyCode }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: CollectionByHandleQuery;
    variables: CollectionByHandleQueryVariables;
  };
  '#graphql\n  query PersonalizableProduct($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      featuredImage {\n        url\n        altText\n      }\n      priceRange {\n        minVariantPrice { amount currencyCode }\n      }\n      variants(first: 1) {\n        nodes { id }\n      }\n    }\n  }\n': {
    return: PersonalizableProductQuery;
    variables: PersonalizableProductQueryVariables;
  };
  '#graphql\n  query ShopPolicies {\n    shop {\n      name\n      privacyPolicy {\n        title\n        body\n      }\n      refundPolicy {\n        title\n        body\n      }\n      shippingPolicy {\n        title\n        body\n      }\n      termsOfService {\n        title\n        body\n      }\n    }\n  }\n': {
    return: ShopPoliciesQuery;
    variables: ShopPoliciesQueryVariables;
  };
  '#graphql\n  query Product($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      vendor\n      description\n      productType\n      tags\n      collections(first: 8) { nodes { handle } }\n      metafield(namespace: "custom", key: "tabla_medidas") { value }\n      featuredImage {\n        url\n        altText\n        width\n        height\n      }\n      images(first: 50) {\n        nodes {\n          url\n          altText\n          width\n          height\n        }\n      }\n      priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n      options { name optionValues { name } }\n      variants(first: 250) {\n        nodes {\n          id\n          availableForSale\n          quantityAvailable\n          selectedOptions { name value }\n          price { amount currencyCode }\n          image { url altText }\n        }\n      }\n    }\n  }\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  query RelatedProducts($handle: String!) {\n    collection(handle: $handle) {\n      products(first: 12) {\n        nodes {\n          id\n          title\n          handle\n          featuredImage {\n            url\n            altText\n          }\n          priceRange {\n            minVariantPrice { amount currencyCode }\n          }\n          compareAtPriceRange {\n            minVariantPrice { amount }\n          }\n          variants(first: 10) {\n            nodes {\n              id\n              selectedOptions { name value }\n              price { amount currencyCode }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: RelatedProductsQuery;
    variables: RelatedProductsQueryVariables;
  };
  '#graphql\n  query ComboBotas($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      featuredImage {\n        url\n        altText\n      }\n      priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n      variants(first: 1) {\n        nodes {\n          id\n        }\n      }\n    }\n  }\n': {
    return: ComboBotasQuery;
    variables: ComboBotasQueryVariables;
  };
  '#graphql\n  query ComboProducts($handle: String!) {\n    collection(handle: $handle) {\n      products(first: 50) {\n        nodes {\n          id\n          title\n          handle\n          featuredImage {\n            url\n            altText\n          }\n          variants(first: 1) {\n            nodes {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: ComboProductsQuery;
    variables: ComboProductsQueryVariables;
  };
  '#graphql\n  query CamisaCombo($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      featuredImage {\n        url\n        altText\n      }\n      images(first: 50) {\n        nodes {\n          url\n          altText\n          width\n          height\n        }\n      }\n      variants(first: 50) {\n        nodes {\n          id\n          title\n          availableForSale\n          selectedOptions { name value }\n          image {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n': {
    return: CamisaComboQuery;
    variables: CamisaComboQueryVariables;
  };
  '#graphql\n  query SearchProducts($query: String!, $first: Int!) {\n    search(\n      first: $first\n      query: $query\n      types: PRODUCT\n      sortKey: RELEVANCE\n      unavailableProducts: LAST\n    ) {\n      totalCount\n      nodes {\n        ... on Product {\n          id\n          title\n          handle\n          availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          compareAtPriceRange { minVariantPrice { amount } }\n        }\n      }\n    }\n  }\n': {
    return: SearchProductsQuery;
    variables: SearchProductsQueryVariables;
  };
  '#graphql\n  query BestSellers($first: Int!) {\n    products(first: $first, sortKey: BEST_SELLING) {\n      nodes {\n        id\n        title\n        handle\n        availableForSale\n        featuredImage { url }\n        priceRange { minVariantPrice { amount } }\n        compareAtPriceRange { minVariantPrice { amount } }\n      }\n    }\n  }\n': {
    return: BestSellersQuery;
    variables: BestSellersQueryVariables;
  };
}

interface GeneratedMutationTypes {}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
