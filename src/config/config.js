const config = {
  stripe: {
    tracelo: import.meta.env.VITE_TRACELO_STRIPE_PUBLIC_KEY,
    locationTool: import.meta.env.VITE_LOCATION_TOOL_STRIPE_PUBLIC_KEY,
  },
  solidgate: {
    tracelo: import.meta.env.VITE_TRACELO_SOLIDGATE_PUBLIC_KEY,
    locationTool: import.meta.env.VITE_LOCATION_TOOL_SOLIDGATE_PUBLIC_KEY,
    infochecker: import.meta.env.VITE_INFOCHECKER_SOLIDGATE_PUBLIC_KEY,
    locatico: import.meta.env.VITE_LOCATICO_SOLIDGATE_PUBLIC_KEY,
    reversly: import.meta.env.VITE_REVERSLY_SOLIDGATE_PUBLIC_KEY,
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