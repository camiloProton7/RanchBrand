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

export type SugeridosQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type SugeridosQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'title' | 'handle'> & {
      products: {
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'handle' | 'availableForSale'
          > & {
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
          }
        >;
      };
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

export type WindsorQueryVariables = StorefrontAPI.Exact<{[key: string]: never}>;

export type WindsorQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'title' | 'handle' | 'description'> & {
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      compareAtPriceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
      };
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
      metafields: Array<
        StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
      >;
    }
  >;
};

export type BotasQueryVariables = StorefrontAPI.Exact<{[key: string]: never}>;

export type BotasQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'title' | 'handle' | 'description'> & {
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      compareAtPriceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
      };
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
      metafields: Array<
        StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
      >;
    }
  >;
};

export type ComboQueryVariables = StorefrontAPI.Exact<{[key: string]: never}>;

export type ComboQuery = {
  camisa?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'title' | 'handle' | 'description'> & {
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
      variants: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }
        >;
      };
      metafields: Array<
        StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
      >;
    }
  >;
  gorra?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'title' | 'handle' | 'description'> & {
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
      variants: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }
        >;
      };
      metafields: Array<
        StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
      >;
    }
  >;
};

export type ChaquetasQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type ChaquetasQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<
          StorefrontAPI.Product,
          'id' | 'title' | 'handle' | 'description' | 'availableForSale'
        > & {
          priceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          compareAtPriceRange: {
            minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
          };
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
          metafields: Array<
            StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
          >;
        }
      >;
    };
  }>;
};

export type CamisasQueryVariables = StorefrontAPI.Exact<{[key: string]: never}>;

export type CamisasQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<
          StorefrontAPI.Product,
          'id' | 'title' | 'handle' | 'description' | 'availableForSale'
        > & {
          priceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          compareAtPriceRange: {
            minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
          };
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
          metafields: Array<
            StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
          >;
        }
      >;
    };
  }>;
};

export type CategoriasQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type CategoriasQuery = {
  gorras?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'title'> & {
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      products: {
        nodes: Array<{
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
        }>;
      };
    }
  >;
  camisas?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'title'> & {
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      products: {
        nodes: Array<{
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
        }>;
      };
    }
  >;
  botas?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'title'> & {
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      products: {
        nodes: Array<{
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
        }>;
      };
    }
  >;
  chaquetas?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'title'> & {
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      products: {
        nodes: Array<{
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
        }>;
      };
    }
  >;
  sacos?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'title'> & {
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      products: {
        nodes: Array<{
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
        }>;
      };
    }
  >;
};

export type GorrasQueryVariables = StorefrontAPI.Exact<{[key: string]: never}>;

export type GorrasQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<
          StorefrontAPI.Product,
          'id' | 'title' | 'handle' | 'availableForSale' | 'description'
        > & {
          priceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          compareAtPriceRange: {
            minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
          };
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
          metafields: Array<
            StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
          >;
        }
      >;
    };
  }>;
};

export type TopProductosQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
}>;

export type TopProductosQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle' | 'description'> & {
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
        };
        images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
        metafields: Array<
          StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
        >;
      }
    >
  >;
};

export type RellenoQueryVariables = StorefrontAPI.Exact<{[key: string]: never}>;

export type RellenoQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
        };
        images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      }
    >;
  };
};

export type BuscarQueryVariables = StorefrontAPI.Exact<{
  q: StorefrontAPI.Scalars['String']['input'];
}>;

export type BuscarQuery = {
  predictiveSearch?: StorefrontAPI.Maybe<{
    products: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'productType'
      > & {
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
      }
    >;
    collections: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'>
    >;
  }>;
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

export type PiezasQueryVariables = StorefrontAPI.Exact<{[key: string]: never}>;

export type PiezasQuery = {
  gorras?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<
          StorefrontAPI.Product,
          'id' | 'title' | 'handle' | 'availableForSale'
        > & {
          priceRange: {minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>};
          compareAtPriceRange: {
            minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
          };
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
        }
      >;
    };
  }>;
  chaquetas?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<
          StorefrontAPI.Product,
          'id' | 'title' | 'handle' | 'availableForSale'
        > & {
          priceRange: {minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>};
          compareAtPriceRange: {
            minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
          };
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
        }
      >;
    };
  }>;
};

export type PiezaFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle' | 'availableForSale'
> & {
  priceRange: {minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>};
  compareAtPriceRange: {minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>};
  images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
};

export type DestacadosCestaQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type DestacadosCestaQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
          priceRange: {minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>};
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url'>>};
        }
      >;
    };
  }>;
};

export type ColeccionQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  orden: StorefrontAPI.ProductCollectionSortKeys;
  alreves: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type ColeccionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'title' | 'handle' | 'description'> & {
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url' | 'altText'>>;
      products: {
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'handle' | 'availableForSale' | 'productType'
          > & {
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            compareAtPriceRange: {
              minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
            };
            images: {
              nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>;
            };
            metafields: Array<
              StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'key' | 'value'>
              >
            >;
          }
        >;
      };
    }
  >;
};

export type OtrasQueryVariables = StorefrontAPI.Exact<{[key: string]: never}>;

export type OtrasQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'handle' | 'title'> & {
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
        products: {
          nodes: Array<
            Pick<StorefrontAPI.Product, 'id'> & {
              featuredImage?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url'>
              >;
            }
          >;
        };
      }
    >;
  };
};

export type DeGeneroQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type DeGeneroQuery = {
  hombre?: StorefrontAPI.Maybe<{
    products: {nodes: Array<Pick<StorefrontAPI.Product, 'handle'>>};
  }>;
  mujer?: StorefrontAPI.Maybe<{
    products: {nodes: Array<Pick<StorefrontAPI.Product, 'handle'>>};
  }>;
};

export type GorrasComboQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GorrasComboQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'title' | 'handle' | 'productType'> & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText'>
        >;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            }
          >;
        };
      }
    >;
  };
};

export type PrendaBordadoFragment = Pick<
  StorefrontAPI.Product,
  'title' | 'handle'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText'>
  >;
  options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
  variants: {
    nodes: Array<
      Pick<StorefrontAPI.ProductVariant, 'availableForSale'> & {
        price: Pick<StorefrontAPI.MoneyV2, 'amount'>;
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      }
    >;
  };
};

export type PrendasBordadoQueryVariables = StorefrontAPI.Exact<{
  h1: StorefrontAPI.Scalars['String']['input'];
  h2: StorefrontAPI.Scalars['String']['input'];
  h3: StorefrontAPI.Scalars['String']['input'];
  h4: StorefrontAPI.Scalars['String']['input'];
}>;

export type PrendasBordadoQuery = {
  p1?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'title' | 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
      variants: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariant, 'availableForSale'> & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount'>;
            image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
      };
    }
  >;
  p2?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'title' | 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
      variants: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariant, 'availableForSale'> & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount'>;
            image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
      };
    }
  >;
  p3?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'title' | 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
      variants: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariant, 'availableForSale'> & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount'>;
            image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
      };
    }
  >;
  p4?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'title' | 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
      variants: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariant, 'availableForSale'> & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount'>;
            image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
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

export type ProductoQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ProductoQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'handle'
      | 'description'
      | 'descriptionHtml'
      | 'productType'
      | 'vendor'
      | 'tags'
    > & {
      collections: {
        nodes: Array<Pick<StorefrontAPI.Collection, 'handle' | 'title'>>;
      };
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale' | 'quantityAvailable'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
          }
        >;
      };
      metafields: Array<
        StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
      >;
    }
  >;
};

export type RecosQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type RecosQuery = {
  productRecommendations?: StorefrontAPI.Maybe<
    Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount'>;
        };
        images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
        metafields: Array<
          StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
        >;
      }
    >
  >;
};

export type DeColeccionQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  excluir: StorefrontAPI.Scalars['String']['input'];
}>;

export type DeColeccionQuery = {
  collection?: StorefrontAPI.Maybe<{
    products: {
      nodes: Array<
        Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
          priceRange: {
            minVariantPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
          };
          variants: {
            nodes: Array<
              Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
            >;
          };
          images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
          metafields: Array<
            StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
          >;
        }
      >;
    };
  }>;
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
        'id' | 'title' | 'handle' | 'availableForSale' | 'tags' | 'productType'
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
        'id' | 'title' | 'handle' | 'availableForSale' | 'tags' | 'productType'
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
  '#graphql\n  query Sugeridos {\n    collection(handle: "gorras") {\n      title\n      handle\n      products(first: 4, sortKey: BEST_SELLING) {\n        nodes {\n          id\n          title\n          handle\n          availableForSale\n          priceRange { minVariantPrice { amount currencyCode } }\n          images(first: 2) { nodes { url } }\n        }\n      }\n    }\n  }\n': {
    return: SugeridosQuery;
    variables: SugeridosQueryVariables;
  };
  '#graphql\n        query CollectionProducts($handle: String!) {\n          collection(handle: $handle) {\n            products(first: 100) {\n              nodes { handle }\n            }\n          }\n        }': {
    return: CollectionProductsQuery;
    variables: CollectionProductsQueryVariables;
  };
  '#graphql\n  query Windsor {\n    product(handle: "chaqueta-encerada-windsor-verde") {\n      title\n      handle\n      description\n      priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n      images(first: 3) { nodes { url } }\n      metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {\n        key\n        value\n      }\n    }\n  }\n': {
    return: WindsorQuery;
    variables: WindsorQueryVariables;
  };
  '#graphql\n  query Botas {\n    product(handle: "botas-gamuza-lariat") {\n      title\n      handle\n      description\n      priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n      images(first: 3) { nodes { url } }\n      metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "count"}]) {\n        key\n        value\n      }\n    }\n  }\n': {
    return: BotasQuery;
    variables: BotasQueryVariables;
  };
  '#graphql\n  query Combo {\n    camisa: product(handle: "camisa-outdoor-proteccion-solar-upf-50") {\n      title\n      handle\n      description\n      images(first: 4) { nodes { url } }\n      variants(first: 40) { nodes { id price { amount currencyCode } availableForSale } }\n      metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {\n        key\n        value\n      }\n    }\n    gorra: product(handle: "gorra-1") {\n      title\n      handle\n      description\n      images(first: 4) { nodes { url } }\n      variants(first: 40) { nodes { id price { amount currencyCode } availableForSale } }\n      metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {\n        key\n        value\n      }\n    }\n  }\n': {
    return: ComboQuery;
    variables: ComboQueryVariables;
  };
  '#graphql\n  query Chaquetas {\n    collection(handle: "chaquetas") {\n      products(first: 8, sortKey: BEST_SELLING) {\n        nodes {\n          id title handle description availableForSale\n          priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n          images(first: 4) { nodes { url } }\n          metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {\n            key\n            value\n          }\n        }\n      }\n    }\n  }\n': {
    return: ChaquetasQuery;
    variables: ChaquetasQueryVariables;
  };
  '#graphql\n  query Camisas {\n    collection(handle: "camisetas") {\n      products(first: 16, sortKey: BEST_SELLING) {\n        nodes {\n          id title handle description availableForSale\n          priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n          images(first: 4) { nodes { url } }\n          metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {\n            key\n            value\n          }\n        }\n      }\n    }\n  }\n': {
    return: CamisasQuery;
    variables: CamisasQueryVariables;
  };
  '#graphql\n  query Categorias {\n    gorras: collection(handle: "gorras") {\n      title\n      image { url }\n      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }\n    }\n    camisas: collection(handle: "camisetas") {\n      title\n      image { url }\n      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }\n    }\n    botas: collection(handle: "botas-1") {\n      title\n      image { url }\n      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }\n    }\n    chaquetas: collection(handle: "chaquetas") {\n      title\n      image { url }\n      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }\n    }\n    sacos: collection(handle: "bordados") {\n      title\n      image { url }\n      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }\n    }\n  }\n': {
    return: CategoriasQuery;
    variables: CategoriasQueryVariables;
  };
  '#graphql\n  query Gorras {\n    collection(handle: "gorras") {\n      products(first: 6, sortKey: BEST_SELLING) {\n        nodes {\n          id title handle availableForSale\n          description\n          priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n          images(first: 4) { nodes { url } }\n          metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {\n            key\n            value\n          }\n        }\n      }\n    }\n  }\n': {
    return: GorrasQuery;
    variables: GorrasQueryVariables;
  };
  '#graphql\n  query TopProductos($ids: [ID!]!) {\n    nodes(ids: $ids) {\n      ... on Product {\n        id\n        title\n        handle\n        description\n        priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n        images(first: 4) { nodes { url altText } }\n        metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {\n          key\n          value\n        }\n      }\n    }\n  }\n': {
    return: TopProductosQuery;
    variables: TopProductosQueryVariables;
  };
  '#graphql\n        query Relleno { products(first: 12, sortKey: BEST_SELLING) {\n          nodes { id title handle priceRange { minVariantPrice { amount currencyCode } }\n        compareAtPriceRange { minVariantPrice { amount } } images(first: 4) { nodes { url altText } } }\n        } }': {
    return: RellenoQuery;
    variables: RellenoQueryVariables;
  };
  '#graphql\n  query Buscar($q: String!) {\n    predictiveSearch(\n      query: $q\n      limit: 8\n      types: [PRODUCT, COLLECTION]\n      unavailableProducts: LAST\n    ) {\n      products {\n        id\n        title\n        handle\n        vendor\n        productType\n        featuredImage {\n          url\n          altText\n        }\n        priceRange {\n          minVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n        compareAtPriceRange {\n          minVariantPrice {\n            amount\n          }\n        }\n      }\n      collections {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: BuscarQuery;
    variables: BuscarQueryVariables;
  };
  '#graphql\n      query Recommended {\n        r0: product(handle: "gorra-redwood") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r1: product(handle: "gorra-andina") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r2: product(handle: "chaqueta-ganadera-gamuza") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r3: product(handle: "saco-bordado-rebano") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r4: product(handle: "gorra-goat") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n        r5: product(handle: "termo-digital-the-ranch") {\n          id title handle availableForSale\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id } }\n        }\n      }': {
    return: RecommendedQuery;
    variables: RecommendedQueryVariables;
  };
  '#graphql\n  query Piezas {\n    gorras: collection(handle: "gorras") {\n      products(first: 8, sortKey: BEST_SELLING) {\n        nodes { ...Pieza }\n      }\n    }\n    chaquetas: collection(handle: "chaquetas") {\n      products(first: 6, sortKey: BEST_SELLING) {\n        nodes { ...Pieza }\n      }\n    }\n  }\n  fragment Pieza on Product {\n    id\n    title\n    handle\n    availableForSale\n    priceRange { minVariantPrice { amount } }\n    compareAtPriceRange { minVariantPrice { amount } }\n    images(first: 2) { nodes { url } }\n  }\n': {
    return: PiezasQuery;
    variables: PiezasQueryVariables;
  };
  '#graphql\n  query DestacadosCesta {\n    collection(handle: "gorras") {\n      products(first: 6, sortKey: BEST_SELLING) {\n        nodes {\n          id\n          title\n          handle\n          priceRange { minVariantPrice { amount } }\n          images(first: 1) { nodes { url } }\n        }\n      }\n    }\n  }\n': {
    return: DestacadosCestaQuery;
    variables: DestacadosCestaQueryVariables;
  };
  '#graphql\n  query Coleccion($handle: String!, $orden: ProductCollectionSortKeys!, $alreves: Boolean!) {\n    collection(handle: $handle) {\n      title\n      handle\n      description\n      image { url altText }\n      products(first: 60, sortKey: $orden, reverse: $alreves) {\n        nodes {\n          id\n          title\n          handle\n          availableForSale\n          productType\n          priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n          images(first: 4) { nodes { url altText } }\n          metafields(identifiers: [\n            {namespace: "reviews", key: "rating"},\n            {namespace: "reviews", key: "rating_count"}\n          ]) { key value }\n        }\n      }\n    }\n  }\n': {
    return: ColeccionQuery;
    variables: ColeccionQueryVariables;
  };
  '#graphql\n  query Otras {\n    collections(first: 24) {\n      nodes {\n        handle\n        title\n        image { url }\n        products(first: 1) { nodes { id featuredImage { url } } }\n      }\n    }\n  }\n': {
    return: OtrasQuery;
    variables: OtrasQueryVariables;
  };
  '#graphql\n  query DeGenero {\n    hombre: collection(handle: "chaquetas-hombre") {\n      products(first: 100) { nodes { handle } }\n    }\n    mujer: collection(handle: "chaquetas-mujer") {\n      products(first: 100) { nodes { handle } }\n    }\n  }\n': {
    return: DeGeneroQuery;
    variables: DeGeneroQueryVariables;
  };
  '#graphql\n  query GorrasCombo {\n    products(first: 100, sortKey: BEST_SELLING) {\n      nodes {\n        title\n        handle\n        productType\n        featuredImage { url altText }\n        variants(first: 5) {\n          nodes { id price { amount currencyCode } availableForSale }\n        }\n      }\n    }\n  }\n': {
    return: GorrasComboQuery;
    variables: GorrasComboQueryVariables;
  };
  '#graphql\n  query PrendasBordado($h1: String!, $h2: String!, $h3: String!, $h4: String!) {\n    p1: product(handle: $h1) { ...PrendaBordado }\n    p2: product(handle: $h2) { ...PrendaBordado }\n    p3: product(handle: $h3) { ...PrendaBordado }\n    p4: product(handle: $h4) { ...PrendaBordado }\n  }\n  #graphql\n  fragment PrendaBordado on Product {\n    title\n    handle\n    featuredImage {url altText}\n    options {name values}\n    variants(first: 120) {\n      nodes {\n        availableForSale\n        price {amount}\n        image {url}\n        selectedOptions {name value}\n      }\n    }\n  }\n\n': {
    return: PrendasBordadoQuery;
    variables: PrendasBordadoQueryVariables;
  };
  '#graphql\n  query PersonalizableProduct($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      featuredImage {\n        url\n        altText\n      }\n      priceRange {\n        minVariantPrice { amount currencyCode }\n      }\n      variants(first: 1) {\n        nodes { id }\n      }\n    }\n  }\n': {
    return: PersonalizableProductQuery;
    variables: PersonalizableProductQueryVariables;
  };
  '#graphql\n  query ShopPolicies {\n    shop {\n      name\n      privacyPolicy {\n        title\n        body\n      }\n      refundPolicy {\n        title\n        body\n      }\n      shippingPolicy {\n        title\n        body\n      }\n      termsOfService {\n        title\n        body\n      }\n    }\n  }\n': {
    return: ShopPoliciesQuery;
    variables: ShopPoliciesQueryVariables;
  };
  '#graphql\n  query Producto($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      description\n      descriptionHtml\n      productType\n      vendor\n      tags\n      collections(first: 2) { nodes { handle title } }\n      priceRange { minVariantPrice { amount currencyCode } }\n      images(first: 12) { nodes { url altText } }\n      options { name values }\n      variants(first: 60) {\n        nodes {\n          id\n          title\n          availableForSale\n          quantityAvailable\n          selectedOptions { name value }\n          price { amount currencyCode }\n          compareAtPrice { amount currencyCode }\n        }\n      }\n      metafields(identifiers: [\n        {namespace: "reviews", key: "rating"},\n        {namespace: "reviews", key: "rating_count"}\n      ]) { key value }\n    }\n  }\n': {
    return: ProductoQuery;
    variables: ProductoQueryVariables;
  };
  '#graphql\n  query Recos($id: ID!) {\n    productRecommendations(productId: $id) {\n      id\n      title\n      handle\n      priceRange { minVariantPrice { amount currencyCode } }\n      compareAtPriceRange { minVariantPrice { amount } }\n      images(first: 2) { nodes { url altText } }\n      metafields(identifiers: [\n        {namespace: "reviews", key: "rating"},\n        {namespace: "reviews", key: "rating_count"}\n      ]) { key value }\n    }\n  }\n': {
    return: RecosQuery;
    variables: RecosQueryVariables;
  };
  '#graphql\n  query DeColeccion($handle: String!, $excluir: String!) {\n    collection(handle: $handle) {\n      products(first: 10, sortKey: BEST_SELLING) {\n        nodes {\n          id title handle\n          priceRange { minVariantPrice { amount currencyCode } }\n          variants(first: 1) { nodes { id availableForSale } }\n          images(first: 2) { nodes { url altText } }\n          metafields(identifiers: [\n            {namespace: "reviews", key: "rating"},\n            {namespace: "reviews", key: "rating_count"}\n          ]) { key value }\n        }\n      }\n    }\n  }\n': {
    return: DeColeccionQuery;
    variables: DeColeccionQueryVariables;
  };
  '#graphql\n  query SearchProducts($query: String!, $first: Int!) {\n    search(\n      first: $first\n      query: $query\n      types: PRODUCT\n      sortKey: RELEVANCE\n      unavailableProducts: LAST\n    ) {\n      totalCount\n      nodes {\n        ... on Product {\n          id\n          title\n          handle\n          availableForSale\n          tags\n          productType\n          featuredImage { url }\n          priceRange { minVariantPrice { amount currencyCode } }\n          compareAtPriceRange { minVariantPrice { amount } }\n        }\n      }\n    }\n  }\n': {
    return: SearchProductsQuery;
    variables: SearchProductsQueryVariables;
  };
  '#graphql\n  query BestSellers($first: Int!) {\n    products(first: $first, sortKey: BEST_SELLING) {\n      nodes {\n        id\n        title\n        handle\n        availableForSale\n        tags\n        productType\n        featuredImage { url }\n        priceRange { minVariantPrice { amount } }\n        compareAtPriceRange { minVariantPrice { amount } }\n      }\n    }\n  }\n': {
    return: BestSellersQuery;
    variables: BestSellersQueryVariables;
  };
}

interface GeneratedMutationTypes {}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
