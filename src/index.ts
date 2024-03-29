import * as dotenv from "dotenv";
dotenv.config();
const config = require("config");

import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import morgan from 'morgan';
import compression from "compression";

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.get("/", (req: Request, res: Response) => {
//   res.send("Healthy");
// });
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

// morgan.token('remote-addr', function (req, res) {
//   const ffHeaderValue = req.header('x-forwarded-for') ? req.header('x-forwarded-for').split(',')[0] : ''
//   return ffHeaderValue || req.connection.remoteAddress
// })
app.use(morgan('common'))

app.use(require('./api'))

//if you want only your frontend to connect
// app.use(cors({ origin: "http://localhost:000" }))

//const PORT = process.env.PORT || 3000;

const PORT = config.server["port"]
console.log(PORT)


app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
// console.log(process.env.SECRET_CODE);

