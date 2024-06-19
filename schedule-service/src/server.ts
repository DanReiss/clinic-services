import app from "./app";
import mongoose from "mongoose";

const PORT = 3333;

const databaseUsername = process.env.DB_USERNAME;
const databasePassword = process.env.DB_PASSWORD;
const url = `mongodb+srv://${databaseUsername}:${databasePassword}@cluster0.ufx6f9p.mongodb.net/appointments?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(url)
	.then( () => {
		console.log("Connected to the database ");
	})
	.catch( (err) => {
		console.error(`Error connecting to the database. n${err}`);
	});

app.listen(PORT, () => console.log(`Running server on port: ${PORT}`));