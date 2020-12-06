let { google } = require("googleapis"),
	fs = require("fs"),
	mime = require("mime-types");

// the main object
let storage = {};

// the drive object
let drive = null;

// the default error if something went wrongsetting up the drive
const errNoDrive = {
	ok: false,
	error: "drive-001",
	message: "Something went wrong in the authentication",
	details: "Make sure you called the authentication methond.",
};

// initialize the communication with the drive with authenticatication
storage.auth = (credentials) => {
	const scopes = ["https://www.googleapis.com/auth/drive"];
	const auth = new google.auth.JWT(
		credentials.client_email,
		null,
		credentials.private_key,
		scopes
	);
	drive = google.drive({ version: "v3", auth });
};

/* 
* list different files
* options:
	- paretn (optional): the id of the folder containing the elements to list
*/
storage.list = (options, cb) => {
	if (!drive) return cb ? cb(errNoDrive) : null;

	const { parent } = options;

	drive.files.list(
		{
			q: parent ? `parents='${parent}'` : "",
		},
		(err, res) => {
			if (err) {
				if (cb) cb(err);
				else throw err;
			}
			try {
				const files = res.data.files;
				if (files.length) {
					if (cb) cb(null, files);
				} else {
					if (cb) cb(null, []);
				}
			} catch (error) {
				if (cb) cb(error);
			}
		}
	);
};

/* 
* download a single file
* options:
	- fileId (required): the id of the file to download
	- fileName (required): the name the file will be saved with
	- destination (optional, default: ./download): the path of the folder where the file will be saved
*/
storage.download = (options, cb) => {
	if (!drive) return cb ? cb(errNoDrive) : null;

	const { fileId, fileName } = options;
	const destination = options.destination
		? options.destination
		: "./downloads";

	const dest = fs.createWriteStream(destination + "/" + fileName);
	drive.files
		.get({ fileId, alt: "media" }, { responseType: "stream" })
		.then((response) => {
			response.data
				.on("end", () => {
					if (cb) cb();
				})
				.on("error", (err) => {
					if (cb) cb(err);
				})
				.pipe(dest);
		})
		.catch((err) => {
			if (cb) cb(err);
		});
};

/* 
* upload a single file
* options: 
	- filePath (required): the path of the file in the local storage
	- fileName (required): the name the file will be saved with
	- parents (required) {array}: a list of folder IDs the file will be son of
*/
storage.upload = (options, cb) => {
	if (!drive) return cb ? cb(errNoDrive) : null;

	const { filePath, fileName, parents } = options;
	const mimeType = mime.lookup(fileName);

	drive.files.create(
		{
			requestBody: {
				name: fileName,
				mimeType: mimeType,
				parents: parents,
			},
			media: {
				mimeType: mimeType,
				body: fs.createReadStream(filePath),
			},
		},
		(err, res) => {
			if (err) return cb ? cb(err) : null;
			if (cb) cb(null, res.data);
		}
	);
};

/* 
* remove a single file or folder
* options:
	- fileId (required): the id of the file to delete
*/
storage.remove = (options, cb) => {
	if (!drive) return cb ? cb(errNoDrive) : null;

	const { fileId } = options;

	drive.files.delete({ fileId }, (err, res) => {
		if (err) return cb ? cb(err) : null;
		if (cb) cb(null, { ok: true });
	});
};

/* 
* get informations (id, name, mimeType) about one file by id
* options:
	- fileId (required): the id of the file
*/
storage.info = (options, cb) => {
	if (!drive) return cb ? cb(errNoDrive) : null;

	const { fileId } = options;

	drive.files.get({ fileId, fields: "id, name, mimeType" }, (err, res) => {
		if (err) return cb ? cb(err) : null;
		if (cb) cb(null, res.data);
	});
};

/* 
* create a single folder file
* options: 
	- name (required): the name the folder will be created with
	- parents (required) {array}: a list of folder IDs the folder will be son of
*/
storage.createFolder = (options, cb) => {
	if (!drive) return cb ? cb(errNoDrive) : null;
	const { name, parents } = options;

	drive.files.create(
		{
			requestBody: {
				name: name,
				mimeType: "application/vnd.google-apps.folder",
				parents: parents,
			},
		},
		(err, res) => {
			if (err) return cb ? cb(err) : null;
			if (cb) cb(null, res.data);
		}
	);
};

module.exports = storage;
