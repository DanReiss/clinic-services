import IAppointment from "./IAppointment";
import { ObjectId } from "mongoose";

interface IDBDocument{
  _id: ObjectId;
  _doctor_id: string;
  appointments: IAppointment[];
}

export default IDBDocument;