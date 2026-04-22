import { resolveHardcodedContext } from "../validate";
import openAttestationV3Context from "../contexts/OpenAttestation.v3.json";
import drivingLicenceCredentialContext from "../contexts/DrivingLicenceCredential.json";
import customContext from "../contexts/CustomContext.json";
import didWrapped from "../../../../test/fixtures/v3/did-wrapped.json";
import notObfuscatedWrapped from "../../../../test/fixtures/v3/not-obfuscated-wrapped.json";
import obfuscatedWrapped from "../../../../test/fixtures/v3/obfuscated-wrapped.json";
import rawDocument from "../../../../test/fixtures/v3/raw-document.json";
import wrappedTransferableDocument from "../../../../test/fixtures/v3/wrapped-transferable-document.json";

const fixtures = {
  "did-wrapped.json": didWrapped,
  "not-obfuscated-wrapped.json": notObfuscatedWrapped,
  "obfuscated-wrapped.json": obfuscatedWrapped,
  "raw-document.json": rawDocument,
  "wrapped-transferable-document.json": wrappedTransferableDocument,
};

const expectedLocalContextByFilename: Record<string, unknown> = {
  "OpenAttestation.v3.json": openAttestationV3Context,
  "DrivingLicenceCredential.json": drivingLicenceCredentialContext,
  "CustomContext.json": customContext,
};

const isSchemataOpenAttestationUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return hostname === "schemata.openattestation.com" || hostname === "www.schemata.openattestation.com";
  } catch {
    return false;
  }
};

describe("resolveHardcodedContext", () => {
  describe("OpenAttestation.v3.json", () => {
    it("resolves the canonical schemata URL", () => {
      expect(
        resolveHardcodedContext("https://schemata.openattestation.com/com/openattestation/1.0/OpenAttestation.v3.json"),
      ).toBe(openAttestationV3Context);
    });

    it("resolves the www. prefix variant", () => {
      expect(
        resolveHardcodedContext(
          "https://www.schemata.openattestation.com/com/openattestation/1.0/OpenAttestation.v3.json",
        ),
      ).toBe(openAttestationV3Context);
    });

    it("resolves a different path version (e.g. 3.0)", () => {
      expect(
        resolveHardcodedContext(
          "https://www.schemata.openattestation.com/com/openattestation/3.0/OpenAttestation.v3.json",
        ),
      ).toBe(openAttestationV3Context);
    });
  });

  it("resolves DrivingLicenceCredential.json", () => {
    expect(
      resolveHardcodedContext(
        "https://schemata.openattestation.com/com/openattestation/1.0/DrivingLicenceCredential.json",
      ),
    ).toBe(drivingLicenceCredentialContext);
  });

  it("resolves CustomContext.json", () => {
    expect(
      resolveHardcodedContext("https://schemata.openattestation.com/com/openattestation/1.0/CustomContext.json"),
    ).toBe(customContext);
  });

  describe("non-matching URLs", () => {
    it("returns undefined for an unknown host", () => {
      expect(resolveHardcodedContext("https://www.w3.org/2018/credentials/v1")).toBeUndefined();
    });

    it("returns undefined for a lookalike host", () => {
      expect(
        resolveHardcodedContext("https://schemata.openattestation.com.evil.example/OpenAttestation.v3.json"),
      ).toBeUndefined();
    });

    it("returns undefined for a schemata host with an unknown filename", () => {
      expect(
        resolveHardcodedContext("https://schemata.openattestation.com/com/openattestation/1.0/Unknown.json"),
      ).toBeUndefined();
    });

    it("returns undefined for a malformed URL", () => {
      expect(resolveHardcodedContext("not a url")).toBeUndefined();
    });
  });

  describe("v3 fixtures", () => {
    it.each(Object.entries(fixtures))(
      "%s: every schemata.openattestation.com @context URL resolves to the bundled local JSON",
      (_name, fixture) => {
        const contextUrls: string[] = (fixture as { "@context": string[] })["@context"];
        expect(Array.isArray(contextUrls)).toBe(true);

        const schemataUrls = contextUrls.filter(isSchemataOpenAttestationUrl);
        // every fixture references all three schemata contexts — guard against silent fixture changes
        expect(schemataUrls).toHaveLength(3);

        for (const url of schemataUrls) {
          const filename = new URL(url).pathname.split("/").pop() as string;
          const expected = expectedLocalContextByFilename[filename];
          expect(expected).toBeDefined();
          expect(resolveHardcodedContext(url)).toBe(expected);
        }
      },
    );

    it.each(Object.entries(fixtures))("%s: non-schemata @context URLs are not hardcoded", (_name, fixture) => {
      const contextUrls: string[] = (fixture as { "@context": string[] })["@context"];
      const nonSchemataUrls = contextUrls.filter((url) => !isSchemataOpenAttestationUrl(url));

      for (const url of nonSchemataUrls) {
        expect(resolveHardcodedContext(url)).toBeUndefined();
      }
    });
  });
});
