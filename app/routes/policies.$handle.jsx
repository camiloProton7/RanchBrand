import {Link, useLoaderData} from 'react-router';
import policyStyles from '~/styles/policy.css?url';

export const links = () => [{rel: 'stylesheet', href: policyStyles}];

// Las políticas casi nunca cambian: que Oxygen sirva el HTML desde el edge.
export const headers = () => ({
  'Oxygen-Cache-Control':
    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  Vary: 'Accept-Encoding, Accept-Language',
});

// handle de la URL -> campo de la API de Shopify + título en español.
// El footer enlaza a estas cuatro rutas (antes daban 404).
const POLICIES = {
  'privacy-policy': {field: 'privacyPolicy', title: 'Política de Privacidad'},
  'refund-policy': {field: 'refundPolicy', title: 'Política de Devoluciones'},
  'shipping-policy': {field: 'shippingPolicy', title: 'Política de Envíos'},
  'terms-of-service': {
    field: 'termsOfService',
    title: 'Términos y Condiciones del Servicio',
  },
};

const POLICIES_QUERY = `#graphql
  query ShopPolicies {
    shop {
      name
      privacyPolicy {
        title
        body
      }
      refundPolicy {
        title
        body
      }
      shippingPolicy {
        title
        body
      }
      termsOfService {
        title
        body
      }
    }
  }
`;

export async function loader({params, context}) {
  const config = POLICIES[params.handle];
  if (!config) {
    throw new Response('Not Found', {status: 404});
  }

  const {shop} = await context.storefront.query(POLICIES_QUERY, {
    cache: context.storefront.CacheLong(),
  });

  const policy = shop?.[config.field];
  if (!policy?.body) {
    throw new Response('Not Found', {status: 404});
  }

  return {
    handle: params.handle,
    title: config.title,
    subtitle: policy.title,
    body: policy.body,
  };
}

export const meta = ({data}) => {
  const title = data?.title ? `${data.title} — The Ranch` : 'The Ranch';
  const url = `https://ranch.com.co/policies/${data?.handle ?? ''}`;
  const description = `${data?.title ?? 'Políticas'} de The Ranch. Envíos, devoluciones, privacidad y términos del servicio.`;
  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: url},
    {tagName: 'link', rel: 'canonical', href: url},
  ];
};

export default function PolicyPage() {
  const {title, subtitle, body} = useLoaderData();

  return (
    <main className="policy">
      <div className="policy-inner">
        <Link to="/" className="policy-back">
          ← Volver al inicio
        </Link>

        <header className="policy-head">
          <h1 className="policy-title">{title}</h1>
          <p className="policy-note">
            Última actualización: contenido oficial de la tienda.
          </p>
        </header>

        {/* El cuerpo viene de las políticas de Shopify (contenido propio). */}
        <div
          className="policy-body"
          dangerouslySetInnerHTML={{__html: body}}
        />

        <footer className="policy-foot">
          <p>
            ¿Tienes dudas?{' '}
            <a
              href="https://wa.me/573209157343"
              target="_blank"
              rel="noopener noreferrer"
            >
              Escríbenos por WhatsApp
            </a>
          </p>
          <p className="policy-orig">{subtitle}</p>
        </footer>
      </div>
    </main>
  );
}
