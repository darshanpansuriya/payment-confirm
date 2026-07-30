const config = {
  stripe: {
    tracelo: import.meta.env.VITE_TRACELO_STRIPE_PUBLIC_KEY,
    locationTool: import.meta.env.VITE_LOCATION_TOOL_STRIPE_PUBLIC_KEY,
  },
  solidgate: {
    infochecker: import.meta.env.VITE_INFOCHECKER_SOLIDGATE_PUBLIC_KEY,
    iqcenter: import.meta.env.VITE_IQCENTER_SOLIDGATE_PUBLIC_KEY,
    fitday: import.meta.env.VITE_FITDAY_SOLIDGATE_PUBLIC_KEY,
    public_registry: import.meta.env.VITE_PUBLIC_REGISTRY_SOLIDGATE_PUBLIC_KEY,
  }
};

// Validate that all required environment variables are present
Object.entries(config).forEach(([service, keys]) => {
  Object.entries(keys).forEach(([provider, value]) => {
    if (!value) {
      console.warn(`Missing environment variable for ${service} - ${provider}`);
    }
  });
});

export default config;