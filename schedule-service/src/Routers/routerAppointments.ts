import { Router } from "express";
import AppointmentsODM from "../appointmentsODM";
import IAppointment from "../Interfaces/IAppointment";

const routerAppointments = Router();
const appointmentsODM = new AppointmentsODM();

const testDoctorID = "000-000-000-00";

type postRequestBody = {
  date: string;
  _client_id: string;
}

routerAppointments.post("/appointments", async (req, res) => {
	const {date: dateString, _client_id}: postRequestBody = req.body;

	if(!dateString){
		res.status(400).json("É necessária uma data válida para a consulta");
	}

	if(!_client_id){
		res.status(400).json("É necessário o cpf do cliente");
	}

	const appointmentData: IAppointment = {
		date: new Date(dateString),
		_client_id: _client_id,
	};

	try{
		const doctorDocument =  await appointmentsODM.getDoctorDocument(testDoctorID);
		
		if(doctorDocument){
			await appointmentsODM.updateCollection(doctorDocument, appointmentData);
		} else {
			await appointmentsODM.createCollection(appointmentData, testDoctorID);
		}

	
		res.status(200).json("Consulta adicionada com sucesso");
	} catch(err){
		const errObject = err as Error;
		res.status(400).json(errObject.message);
	}
});

export default routerAppointments;