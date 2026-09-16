import Shirt3D from '~/components/Shirt3D';
import shirt3dStyles from '~/styles/shirt3d.css?url';

export const links = () => [{rel: 'stylesheet', href: shirt3dStyles}];

export const meta = () => [{title: 'Visor 3D — Camisa (prueba) | The Ranch'}];

const CAMISA_IMG =
  'https://cdn.shopify.com/s/files/1/0678/1386/7760/files/37b302bf-02a3-4f47-9233-177c95d628e6_Maniquifantasma_f7acf7f4-0947-4c9f-b751-d6f864d29581.webp?v=1789420467';

export default function Shirt3DTest() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '28px 20px 60px',
        fontFamily: 'Georgia, serif',
      }}
    >
      <h1 style={{fontSize: 24, margin: '0 0 6px'}}>Visor 3D — Camisa (prueba)</h1>
      <p style={{color: '#6b6255', fontSize: 14, margin: '0 0 20px'}}>
        Arrastra para rotar · Toca/agarra la tela para moverla
      </p>

      <Shirt3D modelUrl="/models/camisa_low.glb" imageUrl={CAMISA_IMG} alt="Camisa Outdoor The Ranch" />
    </main>
  );
}
