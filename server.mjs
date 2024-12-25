import fs from 'fs';
import https from 'https';
import next from 'next';

const app = next({ dev: true });
const handle = app.getRequestHandler();

const key = fs.readFileSync('./localhost-key.pem');
const cert = fs.readFileSync('./localhost.pem');

app.prepare().then(() => {
  https
    .createServer({ key, cert }, (req, res) => {
      handle(req, res);
    })
    .listen(3000, () => {
      console.log('Server running on https://localhost:3000');
    });
});
