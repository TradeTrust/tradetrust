import {
  _unsafe_use_it_at_your_own_risk_v4_alpha_tt_wrapDocument as wrapDocument,
  obfuscate,
  SchemaId,
  validateSchema,
  verifySignature,
} from "../../..";
import { validateSchema as validate } from "../../../shared/validate";
import { getSchema } from "../../../shared/ajv";
import { SignedWrappedDocument, WrappedDocument } from "../../../4.0/tt/types";
import {
  IdentityProofType,
  TradeTrustDocument,
  RenderMethodType,
  CredentialStatusType,
} from "../../../__generated__/tt-schema.4.0";
import { cloneDeep, omit } from "lodash";
import sample from "../../../../test/fixtures/v4/tt/did-raw.json";
import sampleWrapped from "../../../../test/fixtures/v4/tt/did-wrapped.json";
import sampleWrappedSigned from "../../../../test/fixtures/v4/tt/did-wrapped-signed.json";

const documentDid = sample as TradeTrustDocument;

const sampleTradeTrustDoc: TradeTrustDocument = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schemata.tradetrust.io/io/tradetrust/4.0/alpha-context.json",
  ],
  id: "http://example.edu/credentials/58473",
  type: ["VerifiableCredential", "TradeTrustCredential", "AlumniCredential"],
  network: { chain: "NA", chainId: "NA" },
  issuer: {
    id: "https://example.edu/issuers/14",
    identityProof: {
      identityProofType: IdentityProofType.DNSDid,
      identifier: "example.tradetrust.io",
    },
    name: "hello",
    type: "TradeTrustIssuer",
  },
  issuanceDate: "2010-01-01T19:23:24Z",
  credentialStatus: {
    type: "TradeTrustCredentialStatus",
    credentialStatusType: CredentialStatusType.None,
  },
  credentialSubject: {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    alumniOf: "Example University",
  },
  renderMethod: {
    type: "TradeTrustRenderMethod",
    renderMethodType: RenderMethodType.EmbeddedRenderer,
    name: "INVOICE",
    url: "https://generic-templates.tradetrust.io",
  },
};

const datum = [
  {
    key1: "test",
    ...sampleTradeTrustDoc,
  },
  {
    key1: "hello",
    key2: "item2",
    ...sampleTradeTrustDoc,
  },
  {
    key1: "item1",
    key2: "true",
    key3: 3.14159,
    key4: false,
    ...sampleTradeTrustDoc,
  },
  {
    key1: "item2",
    ...sampleTradeTrustDoc,
  },
];

describe("4.0 E2E Test Scenarios", () => {
  describe("Issuing a single document", () => {
    const document = datum[0];

    test("fails for missing data", async () => {
      const missingData = {
        ...omit(cloneDeep(document), "issuer"),
      };
      await expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wrapDocument(missingData),
      ).rejects.toThrow("Invalid document");
    });
    test("creates a wrapped document", async () => {
      const wrappedDocument = await wrapDocument({
        ...sampleTradeTrustDoc,
        key1: "test",
      });
      expect(wrappedDocument.key1).toEqual(expect.stringContaining("test"));
      expect(wrappedDocument.proof.type).toBe("TradeTrustMerkleProofSignature2018");
      expect(wrappedDocument.proof.targetHash).toBeDefined();
      expect(wrappedDocument.proof.merkleRoot).toBeDefined();
      expect(wrappedDocument.proof.proofs).toEqual([]);
      expect(wrappedDocument.proof.merkleRoot).toBe(wrappedDocument.proof.targetHash);
    });
    test("creates a wrapped document with DNS-DID IdentityProof", async () => {
      const wrappedDocumentWithDnsDID = await wrapDocument(documentDid);
      expect(wrappedDocumentWithDnsDID.proof.type).toBe("TradeTrustMerkleProofSignature2018");
      expect(wrappedDocumentWithDnsDID.proof.targetHash).toBeDefined();
      expect(wrappedDocumentWithDnsDID.proof.merkleRoot).toBeDefined();
      expect(wrappedDocumentWithDnsDID.proof.proofs).toEqual([]);
      expect(wrappedDocumentWithDnsDID.proof.merkleRoot).toBe(wrappedDocumentWithDnsDID.proof.targetHash);
      expect(wrappedDocumentWithDnsDID.issuer.identityProof.identityProofType).toContain(IdentityProofType.DNSDid);
      expect(wrappedDocumentWithDnsDID.issuer.identityProof.identifier).toContain(
        documentDid.issuer.identityProof.identifier,
      );
    });
    test("checks that document is wrapped correctly", async () => {
      const wrappedDocument = await wrapDocument(document);
      const verified = verifySignature(wrappedDocument);
      expect(verified).toBe(true);
    });
    test("checks that document conforms to the schema", async () => {
      const wrappedDocument = await wrapDocument(document);
      expect(validateSchema(wrappedDocument)).toBe(true);
    });
    test("does not allow for the same merkle root to be generated", async () => {
      // This test takes some time to run, so we set the timeout to 14s
      const wrappedDocument = await wrapDocument(document);
      const newDocument = await wrapDocument(document);
      expect(wrappedDocument.proof.merkleRoot).not.toBe(newDocument.proof.merkleRoot);
    }, 14000);
    test("obfuscate data correctly", async () => {
      const newDocument = await wrapDocument(datum[2]);
      const obfuscatedDocument = await obfuscate(newDocument, ["key2"]);
      expect(verifySignature(obfuscatedDocument)).toBe(true);
      expect(validateSchema(obfuscatedDocument)).toBe(true);
    });
    test("obfuscate data transistively", async () => {
      const newDocument = await wrapDocument(datum[2]);
      const intermediateDocument = obfuscate(newDocument, ["key2"]);
      const obfuscatedDocument = obfuscate(intermediateDocument, ["key3"]);
      expect(obfuscate(newDocument, ["key2", "key3"])).toEqual(obfuscatedDocument);
    });
  });

  describe("validate", () => {
    test("should return true when document is valid and version is 4.0", () => {
      const credential = sample;
      expect(validate(credential, getSchema(SchemaId.tt_v4)).length).toStrictEqual(0);
    });
    test("should return true when document is valid and version is 4.0 and identityProof is DNS-DID", () => {
      const credential: WrappedDocument = sampleWrapped as WrappedDocument;
      expect(validateSchema(credential)).toStrictEqual(true);
    });
    test("should return true when signed document is valid and version is 4.0 and identityProof is DNS-DID", () => {
      const credential: SignedWrappedDocument = sampleWrappedSigned as SignedWrappedDocument;
      expect(validateSchema(credential)).toStrictEqual(true);
    });
    test("should return false when document is invalid due to no DNS-DID identifier", () => {
      const credential = cloneDeep(documentDid) as any;
      delete credential.issuer;
      expect(validateSchema(credential)).toStrictEqual(false);
    });
    test("should default to 2.0 when document is valid and version is undefined", () => {
      expect(
        validateSchema({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore run test with version being undefined to only ignore that part
          version: undefined,
          data: {
            issuers: [
              {
                name: "issuer.name",
                certificateStore: "0x9178F546D3FF57D7A6352bD61B80cCCD46199C2d",
              },
            ],
          },
          signature: {
            merkleRoot: "0xabc",
            proof: [],
            targetHash: "0xabc",
            type: "SHA3MerkleProof",
          },
        }),
      ).toStrictEqual(true);
    });
  });

  describe("unicode", () => {
    test("should not corrupt unicode document", async () => {
      const extraData = {
        key1: "哦喷啊特特是他题哦你",
        key2: "นยำืฟะะำหะฟะรนื",
        key3: "おぺなってsたちおn",
        key4: "خحثىشففثسفشفهخى",
      };
      const document = {
        ...sampleTradeTrustDoc,
        ...extraData,
      };
      const wrapped = await wrapDocument(document);
      expect(wrapped.proof.merkleRoot).toBeTruthy();
      expect(wrapped.key1).toBe(extraData.key1);
      expect(wrapped.key2).toBe(extraData.key2);
      expect(wrapped.key3).toBe(extraData.key3);
      expect(wrapped.key4).toBe(extraData.key4);
    });
  });
});
