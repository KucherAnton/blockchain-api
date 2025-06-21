export const logger = {
	log: (...args: any[]) => {
		if (process.env.MODE === 'DEBUG') {
			console.log(...args);
		}
	},
	warn: (...args: any[]) => {
		if (process.env.MODE === 'DEBUG') {
			console.warn(...args);
		}
	},
	error: (...args: any[]) => {
		console.error(...args);
	},
};
