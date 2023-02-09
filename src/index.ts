import * as dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from 'cors';

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Healthy");
});
app.use(require('./api'))

//if you want only your frontend to connect
app.use(cors({ origin: "http://localhost:3000" }))

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
console.log(process.env.SECRET_CODE);

