// src/app/config/config.factory.ts
import { Configuration } from "../configuration";// Adjust path if needed

export function apiConfigFactory(): Configuration {
  return new Configuration({
    basePath: 'https://localhost:7107' // Your API base URL
  });
}
