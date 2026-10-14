// Combo Botas + Gorra (ficha /products/botas-gorra).
// Las gorras se eligen por FOTO, no por texto, y cada una muestra cuánto se ahorra.
// Este mapa SOLO lo usa la ficha del combo: ningún otro producto cambia.

export const COMBO_BOTAS_GORRA = 'botas-gorra';

// gorra -> foto (la de su propia ficha) y precio de comprarla aparte
export const GORRAS_COMBO = {
  "Gorra Tributo": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-2bde8e8a.webp?v=1789998352", antes: 415000, ahorro: 105000 },
  "Gorra Bronco": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo22_efd251c0-2c2a-4923-9cba-5f4f4eaf745b.webp?v=1790290006", antes: 410000, ahorro: 100000 },
  "Gorra Mustang": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo27_c7fa8f5e-e58c-4a87-a01c-33494ed56011.webp?v=1779766001", antes: 405000, ahorro: 95000 },
  "Gorra Desert": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo110.webp?v=1779766644", antes: 417000, ahorro: 107000 },
  "Gorra Cabras": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-835414de.jpg?v=1789999279", antes: 424000, ahorro: 114000 },
  "Gorra Territory": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo45_3d197dc5-253d-4d97-977c-6587e83125b0.webp?v=1779766158", antes: 412000, ahorro: 102000 },
  "Gorra Forester": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo1_0a76a54b-2715-4200-8afd-32b08f0c8833.webp?v=1791205435", antes: 435000, ahorro: 125000 },
  "Gorra Outland": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo99.webp?v=1779766560", antes: 390000, ahorro: 80000 },
  "Gorra Green": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/the-ranch-gorra-verde-camuflada_45389521-af5b-41b6-b286-bc784c69af2c.jpg?v=1790037088", antes: 405000, ahorro: 95000 },
  "Gorra Rodeo": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/a_2d206dc4-6c74-440d-acc7-125e9c891d48.webp?v=1779931972", antes: 428000, ahorro: 118000 },
  "Gorra Hunter": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-2e2c7204.webp?v=1789998417", antes: 375000, ahorro: 65000 },
  "Gorra Hidalgo": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo7_9ae8d476-0195-4e7e-b5e7-d58a5b632fc9.webp?v=1782781499", antes: 411000, ahorro: 101000 },
  "Gorra Bull": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo94.webp?v=1779766530", antes: 415000, ahorro: 105000 },
  "Gorra GOAT": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesa_de_trabajo16_208f1d39-2f15-4f3b-9018-8e83989b924f.webp?v=1790289940", antes: 425000, ahorro: 115000 },
  "Gorra The Ranch": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-ddc3ce35.webp?v=1790810963", antes: 425000, ahorro: 115000 },
  "Gorra Redwood": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesa_de_trabajo8.webp?v=1790264240", antes: 430000, ahorro: 120000 },
  "Gorra Camp Trucker": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-8f24ddf8.webp?v=1789999137", antes: 412000, ahorro: 102000 },
  "Gorra Andina": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-d83b1c1e.webp?v=1789999155", antes: 430000, ahorro: 120000 },
  "Gorra LandMan": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo16_bd4e2207-c4bd-4c26-b3ff-443c4edacc16.webp?v=1790263399", antes: 430000, ahorro: 120000 },
  "Gorra Heritage 89": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-20d379d0.webp?v=1789999123", antes: 424000, ahorro: 114000 },
  "Gorra Fishing": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo12_75e31c66-f891-4c12-9705-50a73cef56b3.webp?v=1790290054", antes: 425000, ahorro: 115000 },
  "Gorra Forza": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo89.webp?v=1779766491", antes: 423000, ahorro: 113000 },
  "Gorra Bovina": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/Mesadetrabajo69_c5ac7dfe-7dbb-4911-9c46-4e74351d6618.webp?v=1779766396", antes: 405000, ahorro: 95000 },
  "Gorra Camo": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-4255a3e0.webp?v=1789998209", antes: 405000, ahorro: 95000 },
  "Gorra Gryzzly": { img: "https://cdn.shopify.com/s/files/1/0678/1386/7760/files/opt-6144c182.jpg?v=1789995642", antes: 377000, ahorro: 67000 },
};
