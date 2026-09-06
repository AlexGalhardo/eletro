export default class DateTime {
	static timestampToGetNow(timestamp: number) {
		const date = new Date(timestamp * 1000).toLocaleDateString("pt-BR");
		const time = new Date(timestamp * 1000).toLocaleTimeString("pt-BR");
		return `${date} ${time}`;
	}

	static getNow() {
		const date = new Date().toLocaleDateString("pt-BR");
		const time = new Date().toLocaleTimeString("pt-BR");
		return `${date} ${time}`;
	}
}
