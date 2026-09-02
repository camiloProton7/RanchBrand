import FacebookPixel from './components/FacebookPixel';
import SiteHeader from './components/SiteHeader';
import Footer from './components/Footer';
import {useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router';
import {HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import siteHeaderStyles from '~/styles/site-header.css?url';
import footerStyles from '~/styles/footer.css?url';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  return false;
};

export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/gif', href: '/favicon.gif'},
    {rel: 'stylesheet', href: siteHeaderStyles},
    {rel: 'stylesheet', href: footerStyles},
  ];
}

/**
 * Layout mínimo: solo cargamos el logo de la marca (para el header editorial),
 * sin carrito, búsqueda ni menú de la plantilla Hydrogen.
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const {storefront} = args.context;

  const header = await storefront.query(HEADER_QUERY, {
    cache: storefront.CacheLong(),
    variables: {
      headerMenuHandle: 'main-menu',
    },
  });

  return {header};
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {/* El Pixel se inserta al inicio del cuerpo */}
        <FacebookPixel />

        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData();
  const logoSrc = data?.header?.shop?.brand?.logo?.image?.url;
  return (
    <>
      <SiteHeader logoSrc={logoSrc} />
      <Outlet />
      <Footer logoSrc={logoSrc} />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
