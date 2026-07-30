// Solidgate merchant accounts. Each `id` is also the URL segment
// (/solidgate/:id) and the key used to look up the public key in config.js.
const SOLIDGATE_BRANDS = [
  {
    id: 'infochecker',
    name: 'Infochecker',
    description: 'Load a Solidgate checkout for the Infochecker merchant account.',
  },
  {
    id: 'iqcenter',
    name: 'IQ Center',
    description: 'Load a Solidgate checkout for the IQ Center merchant account.',
  },
  {
    id: 'fitday',
    name: 'Fitday',
    description: 'Load a Solidgate checkout for the Fitday merchant account.',
  },
  {
    id: 'public_registry',
    name: 'Public Registry',
    description: 'Load a Solidgate checkout for the Public Registry merchant account.',
  },
];

export const getBrand = (id) => SOLIDGATE_BRANDS.find((brand) => brand.id === id) || null;

export default SOLIDGATE_BRANDS;
