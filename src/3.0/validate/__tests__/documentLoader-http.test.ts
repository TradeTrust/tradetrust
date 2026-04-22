import { createServer, Server } from "http";
import type { AddressInfo } from "net";

import { documentLoader } from "../validate";

type RequestLog = { path: string | undefined; method: string | undefined };

/**
 * Stands up a local HTTP server and asserts the real jsonld node loader
 * issues an actual HTTP request for non-hardcoded URLs. This is the ground
 * truth that the mock-based fallback tests rely on: without this, a passing
 * mock proves only that a function was called, not that the network was.
 */
describe("documentLoader issues a real HTTP request for non-schemata URLs", () => {
  let server: Server;
  let baseUrl: string;
  const contextBody = { "@context": { name: "http://schema.org/name" } };
  const requests: RequestLog[] = [];

  beforeAll(async () => {
    server = createServer((req, res) => {
      requests.push({ path: req.url, method: req.method });
      res.setHeader("Content-Type", "application/ld+json");
      res.end(JSON.stringify(contextBody));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  beforeEach(() => {
    requests.length = 0;
  });

  it("sends an HTTP GET to the endpoint and returns the server's JSON", async () => {
    // unique URL per run so the module-level context cache can't shortcut us
    const path = `/context-${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
    const url = `${baseUrl}${path}`;

    const result = await documentLoader(url);

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("GET");
    expect(requests[0].path).toBe(path);
    expect(result.document).toEqual(contextBody);
    expect(result.documentUrl).toBe(url);
  });

  it("does NOT send any HTTP request for a schemata.openattestation.com URL", async () => {
    await documentLoader("https://schemata.openattestation.com/com/openattestation/1.0/OpenAttestation.v3.json");
    await documentLoader("https://www.schemata.openattestation.com/com/openattestation/3.0/OpenAttestation.v3.json");
    await documentLoader("https://schemata.openattestation.com/com/openattestation/1.0/DrivingLicenceCredential.json");
    await documentLoader("https://schemata.openattestation.com/com/openattestation/1.0/CustomContext.json");

    expect(requests).toHaveLength(0);
  });
});
