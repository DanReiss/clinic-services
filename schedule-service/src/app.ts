import express from "express";
import cors from "cors";
import { config } from "dotenv";
import router from "./Routers/router";
import routerAppointments from "./Routers/routerAppointments";

config();

const app = express();

const corsOptions = {
	origin: process.env.FRONTEND_ORIGIN_DEV,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(router);
app.use(routerAppointments);

export default app;