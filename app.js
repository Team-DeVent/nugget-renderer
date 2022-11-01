import express from 'express';

import * as loaderExpress from './loaders/express.js';
import { renderStart } from './render.js';

async function startExpressServer() {
    const app = express();
    await loaderExpress.init(app);
    renderStart()


    app.listen(3030, err => {
        console.log('info', 'The server is running.');
    });
}
  
startExpressServer();