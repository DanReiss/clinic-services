import IDBAppointment from "./IDBAppointment";
import { Types } from "mongoose";

interface IDBDocument{
  _id: Types.ObjectId;
  _doctor_id: string;
  appointments: IDBAppointment[];
}

export default IDBDocument;