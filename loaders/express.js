import express from 'express';
import bodyParser from 'body-parser';


export async function init (app) {
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended : true}));

    app.use('/', express.static('export'));
    return app;
}