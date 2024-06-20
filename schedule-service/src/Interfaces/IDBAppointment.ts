import { Types } from "mongoose";
interface IDBAppointment{
  _id: Types.ObjectId;
  date: Date;
  _client_id: string;
}

export default IDBAppointment;