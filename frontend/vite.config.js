import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration for local development
// Use this configuration when running locally with XAMPP
const localConfig = {
  plugins: [react()],
  // base: './', // Uncomment for local development
  build: {
    outDir: '../backend/dist',
  }
};

// Configuration for production deployment to subdirectory
// Use this configuration when deploying to skbusinesslogics.com/dawn-school
const prodConfig = {
  plugins: [react()],
  base: '/dawn-school/',  // Set base path for subdirectory deployment
  build: {
    outDir: '../backend/dist',  // Build to backend's dist folder
  }
};

// Export the configuration to use
// Switch between localConfig and prodConfig as needed
export default defineConfig(prodConfig);  // Change to localConfig for local development

// To switch between local and production:
// For local development: export default defineConfig(localConfig);
// For production deployment: export default defineConfig(prodConfig);