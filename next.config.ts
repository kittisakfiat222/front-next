import fs from 'fs';
import path from 'path';

const nextConfig = {
  reactStrictMode: true,
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem')),
    },
  },
};

export default nextConfig;