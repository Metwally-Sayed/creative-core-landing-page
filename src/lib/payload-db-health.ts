import net from "node:net";

const DEFAULT_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5432/hello_monday_payload";

function getDatabaseURL() {
  return process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
}

function getConnectionTarget(connectionString: string) {
  const url = new URL(connectionString);

  return {
    host: url.hostname || "127.0.0.1",
    port: Number(url.port || "5432"),
  };
}

export async function isPayloadDatabaseReachable(timeoutMs = 800): Promise<boolean> {
  const connectionString = getDatabaseURL();
  const { host, port } = getConnectionTarget(connectionString);

  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    const finalize = (reachable: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(reachable);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finalize(true));
    socket.once("timeout", () => finalize(false));
    socket.once("error", () => finalize(false));
  });
}

export function getPayloadDatabaseURL() {
  return getDatabaseURL();
}
