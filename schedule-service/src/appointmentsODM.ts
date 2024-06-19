import { Schema, Model, model, models } from "mongoose";
import { Types } from "mongoose";
import IDBDocument from "./Interfaces/IDBDocument";
import IAppointment from "./Interfaces/IAppointment";

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
}