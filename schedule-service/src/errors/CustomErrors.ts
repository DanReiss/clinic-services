class InternalServerError extends Error{
	public statusCode: number;

	constructor(msg: string){
		super(msg);
		this.name = "InternalServerError";
		this.statusCode = 500;
	}
}

class StatusError extends Error{
	public statusCode: number;

	constructor(statusCode: number, msg: string){
		super(msg);
		this.statusCode = statusCode;
	}
}

export {InternalServerError, StatusError};