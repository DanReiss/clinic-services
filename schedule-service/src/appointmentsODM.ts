import { Schema, Model, model, models, Types } from "mongoose";
import IDBDocument from "./Interfaces/IDBDocument";
import IAppointment from "./Interfaces/IAppointment";
import IDBAppointment from "./Interfaces/IDBAppointment";
export default class AppointmentsODM {
	private schema: Schema;
	private model: Model<IDBDocument>;

	constructor() {
		this.schema = new Schema<IDBDocument>({
			_doctor_id: {type: String, required: true},
			appointments: {type: [Object], required: false},
		});

		this.model = models.doctors_appointments || model("Appointment", this.schema, "doctors_appointments");
	}

	public async createCollection(appointmentData: IAppointment, doctorID: string) {
		const appointmentObject = {...appointmentData, _id: new Types.ObjectId()};

		return this.model.create({ _doctor_id: doctorID, appointments: [appointmentObject] });
	}

	public async getDoctorDocument(_doctor_id: string){
		const doctorDocument = await this.model.findOne({_doctor_id: _doctor_id});

		return doctorDocument;
	}

	public async updateCollection(doctorDocument: IDBDocument, newAppointmentData: IAppointment){
		const appointmentObject: IDBAppointment = {...newAppointmentData, _id: new Types.ObjectId()};

		const appointmentInConflict: IDBAppointment | undefined = doctorDocument.appointments.find(appointment => {
			if(appointment._id.toString() !== appointmentObject._id.toString()){
				return this.verifyAppointmentsConflict(appointment, newAppointmentData);
			}

			return false;
		});

		if(appointmentInConflict){
			throw Error("You cannot have two tasks in the same period of time");
		}

		const updatedDocument: IDBDocument | null = await this.model.findByIdAndUpdate(
			doctorDocument._id, 
			{appointments: [...doctorDocument.appointments, appointmentObject]},
			{new: true}
		);

		return updatedDocument;
	}

	private verifyAppointmentsConflict(appointmentA: IAppointment, appointmentB: IAppointment){
		const appointmentADate = new Date(appointmentA.date);
		const appointmentBDate = new Date(appointmentB.date);

		if(appointmentADate.toDateString().split("T")[0] !== appointmentBDate.toDateString().split("T")[0]){
			return false;
		}

		const appointmentAInit = appointmentADate.getUTCHours() + appointmentADate.getUTCMinutes() / 60;
		const appointmentAFinish = appointmentAInit + 45 / 60;
		
		const appointmentBInit = appointmentBDate.getUTCHours() + appointmentBDate.getUTCMinutes() / 60;
		const appointmentBFinish = appointmentBInit + 45 / 60;

		console.log(appointmentAInit, appointmentAFinish);
		console.log(appointmentBInit, appointmentBFinish);

		if(appointmentBInit >= appointmentAInit && appointmentBInit < appointmentAFinish){
			return true;
		} 

		if(appointmentBFinish > appointmentAInit && appointmentAFinish > appointmentBFinish){
			return true;
		}

		return false;
	}
}