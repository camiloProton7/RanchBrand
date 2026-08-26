import {useRouteLoaderData} from 'react-router';
import {ScrollVideoHero} from '~/components/ScrollVideoHero';
import homeStyles from '~/styles/scroll-video-hero.css?url';

export const meta = () => [
  {title: 'The Ranch — No seguimos modas'},
  {
    name: 'description',
    content:
      'The Ranch: ropa, gorras y accesorios para quienes hacen las cosas bien.',
  },
];

export function links() {
  return [{rel: 'stylesheet', href: homeStyles}];
}

export default function Home() {
  const rootData = useRouteLoaderData('root');
  const logoSrc = rootData?.header?.shop?.brand?.logo?.image?.url;

  return (
    <div className="tr-home">
      <ScrollVideoHero logoSrc={logoSrc} />
    </div>
  );
}
