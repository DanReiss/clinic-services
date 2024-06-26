import { Schema, Model, model, models, Types } from "mongoose";
import IDBDocument from "./Interfaces/IDBDocument";
import IAppointment from "./Interfaces/IAppointment";
import IDBAppointment from "./Interfaces/IDBAppointment";
import {StatusError} from "./errors/CustomErrors";

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
			throw new StatusError(400, "You cannot have two appointments in the same period of time");
		}

		const updatedDocument: IDBDocument | null = await this.model.findByIdAndUpdate(
			doctorDocument._id, 
			{appointments: [...doctorDocument.appointments, appointmentObject]},
			{new: true}
		);

		return updatedDocument;
	}

	public async deleteOne(_doctor_id: string, appointmentID: string){
		const doctorDocument = await this.model.findOne({_doctor_id});
		
		if(!doctorDocument){
			throw new StatusError(400, "We could not find this doctor");
		}

		const updatedAppointments: IDBAppointment[] = doctorDocument.appointments.filter(appointment => {
			return String(appointment._id) != appointmentID;
		});

		if(updatedAppointments.length === doctorDocument.appointments.length){
			throw new StatusError(400, "We could not find this appointment. Insert a valid ID or verify if this task exists.");
		}
		
		const updateDocument = await this.model.findByIdAndUpdate(doctorDocument._id, {appointments: updatedAppointments}, {new: true});

		return updateDocument;
	}

	public async getAll(_doctor_id: string){
		const doctorDocument = await this.model.findOne({_doctor_id});

		if(!doctorDocument){
			throw new StatusError(400, "We could not find this doctor. Insert a valid ID.");
		}

		return doctorDocument.appointments;
	}

	public async updateOne(_doctor_id: string, appointmentID: string, newData: Partial<IDBAppointment>){
		const doctorDocument = await this.model.findOne({_doctor_id});
		let updatedAppointment: null | IDBAppointment = null;
		
		if(!doctorDocument){
			throw new StatusError(400, "We could not find this doctor. Insert a valid ID");
		}

		const updatedAppointments: IDBAppointment[] = doctorDocument.appointments.map(appointment =>{
			if(appointment._id.toString() === appointmentID){
				const updated: IDBAppointment = {
					_id: appointment._id,
					_client_id: newData._client_id || appointment._client_id,
					date: newData.date || appointment.date,
				};


				updatedAppointment = updated;
				return updated; 
			}
			return appointment;
		});

		if(!updatedAppointment){
			throw new StatusError(400, "We could not find this task. Insert a valid ID.");
		}

		const appointmentInConflict: IDBAppointment | undefined = doctorDocument.appointments.find(appointment => {
			if(appointment._id.toString() !== appointmentID.toString() && updatedAppointment){
				return this.verifyAppointmentsConflict(appointment, updatedAppointment);
			}

			return false;
		});

		if(appointmentInConflict){
			throw new StatusError(400, "You cannot have two appointments in the same period of time");
		}

		return await this.model.findByIdAndUpdate(doctorDocument.id, {appointments: updatedAppointments}, {new: true});
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

		if(appointmentBInit >= appointmentAInit && appointmentBInit < appointmentAFinish){
			return true;
		} 

		if(appointmentBFinish > appointmentAInit && appointmentAFinish > appointmentBFinish){
			return true;
		}

		return false;
	}
}