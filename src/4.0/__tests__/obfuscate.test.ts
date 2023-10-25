/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { get } from "lodash";
import {
  _unsafe_use_it_at_your_own_risk_v4_alpha_wrapDocument as wrapDocument,
  verifySignature,
  obfuscate,
} from "../..";
import { decodeSalt } from "../salt";
import { toBuffer, isObfuscated, getObfuscatedData } from "../../shared/utils";
import { Salt, WrappedDocument, TradeTrustDocument, CredentialStatusType, IdentityProofType } from "../../4.0/types";

import ObfuscatedWrapped from "../../../test/fixtures/v4/did-wrapped-obfuscated.json";
import NotObfuscatedWrapped from "../../../test/fixtures/v4/did-wrapped.json";

jest.mock("../../4.0/validate"); // Skipping schema verification while wrapping

const data: TradeTrustDocument = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1",
    "http://localhost:8080/alpha-context.json",
    "https://schemata.openattestation.com/com/openattestation/1.0/CustomContext.json",
  ],
  issuanceDate: "2010-01-01T19:23:24Z",
  name: "document owner name",
  type: ["VerifiableCredential", "TradeTrustCredential"],
  credentialSubject: {
    name: "TradeTrust Invoice",
    alumniOf: "Example University",
    id: "urn:uuid:a013fb9d-bb03-4056-b696-05575eceaf42",
    date: "2018-02-21",
    customerId: "564",
    terms: "Due Upon Receipt",
    array: ["one", "two", "three", "four"],
    arrayOfObject: [
      { foo: "bar", doo: "foo" },
      { foo: "baz", doo: "faz" },
    ],
  },
  credentialStatus: {
    type: "TradeTrustCredentialStatus",
    credentialStatusType: CredentialStatusType.None,
  },
  issuer: {
    id: "https://example.edu/issuers/14",
    identityProof: {
      identityProofType: IdentityProofType.DNSDid,
      identifier: "example.tradetrust.io",
    },
    name: "hello",
    type: "TradeTrustIssuer",
  },
  attachments: [
    {
      mimeType: "image/png",
      fileName: "aaa",
      data: "abcd",
    },
    {
      mimeType: "image/png",
      fileName: "bbb",
      data: "abcd",
    },
  ],
};

const testData = {
  key1: "value1",
  key2: "value2",
  keyObject: { foo: "bar", bar: "dod" },
  ...data,
};

const findSaltByPath = (salts: string, path: string): Salt | undefined => {
  return decodeSalt(salts).find((salt) => salt.path === path);
};

/**
 * /!\ This method doesn't work with array like notation
 * This method will ensure
 * - the field has been added to the obfuscated array
 * - the salt bound to the field has been removed
 * - the field has been removed
 */
const expectRemovedFieldsWithoutArrayNotation = (
  field: string,
  document: WrappedDocument,
  obfuscatedDocument: WrappedDocument
) => {
  const value = get(document, field);
  const salt = findSaltByPath(document.proof.salts, field);

  expect(obfuscatedDocument.proof.privacy.obfuscated).toContain(
    toBuffer({ [field]: `${salt?.value}:${value}` }).toString("hex")
  );
  expect(findSaltByPath(obfuscatedDocument.proof.salts, field)).toBeUndefined();
  expect(obfuscatedDocument).not.toHaveProperty(field);
};

describe("privacy", () => {
  describe("obfuscateDocument", () => {
    test("removes one field from the root object", async () => {
      const field = "key1";
      const newDocument = await wrapDocument(testData);
      const obfuscatedDocument = await obfuscate(newDocument, field);
      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectRemovedFieldsWithoutArrayNotation(field, newDocument, obfuscatedDocument);
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(1);
    });
    test("removes one object from the root object", async () => {
      const field = "keyObject";
      const expectedFieldsToBeRemoved = ["keyObject.foo", "keyObject.bar"];
      const newDocument = await wrapDocument(testData);
      const obfuscatedDocument = await obfuscate(newDocument, field);

      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectedFieldsToBeRemoved.forEach((field) => {
        expectRemovedFieldsWithoutArrayNotation(field, newDocument, obfuscatedDocument);
      });
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(2);
    });
    test("removes one key of an object from an array", async () => {
      const field = "credentialSubject.arrayOfObject[0].foo";
      const newDocument = await wrapDocument(testData);
      const obfuscatedDocument = await obfuscate(newDocument, field);

      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      const value = get(newDocument, field);
      const salt = findSaltByPath(newDocument.proof.salts, field);

      expect(obfuscatedDocument.proof.privacy.obfuscated).toContain(
        toBuffer({ [field]: `${salt?.value}:${value}` }).toString("hex")
      );
      expect(findSaltByPath(obfuscatedDocument.proof.salts, field)).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(obfuscatedDocument.credentialSubject.arrayOfObject![0]).toStrictEqual({ doo: "foo" });
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(1);
    });
    test("removes one object from an array", async () => {
      const field = "credentialSubject.arrayOfObject[0]";
      const expectedFieldsToBeRemoved = [
        "credentialSubject.arrayOfObject[0].foo",
        "credentialSubject.arrayOfObject[0].doo",
      ];
      const newDocument = await wrapDocument(testData);
      const obfuscatedDocument = await obfuscate(newDocument, field);

      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectedFieldsToBeRemoved.forEach((field) => {
        const value = get(newDocument, field);
        const salt = findSaltByPath(newDocument.proof.salts, field);

        expect(obfuscatedDocument.proof.privacy.obfuscated).toContain(
          toBuffer({ [field]: `${salt?.value}:${value}` }).toString("hex")
        );
        expect(findSaltByPath(obfuscatedDocument.proof.salts, field)).toBeUndefined();
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(obfuscatedDocument.credentialSubject.arrayOfObject![0]).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(obfuscatedDocument.credentialSubject.arrayOfObject![1]).not.toBeUndefined(); // let's make sure only the first item has been removed
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(2);
    });
    test("removes an array of object", async () => {
      const field = "attachments";
      const expectedFieldsToBeRemoved = [
        "attachments[0].mimeType",
        "attachments[0].fileName",
        "attachments[0].data",
        "attachments[1].mimeType",
        "attachments[1].fileName",
        "attachments[1].data",
      ];
      const newDocument = await wrapDocument(testData);
      const obfuscatedDocument = await obfuscate(newDocument, field);

      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectedFieldsToBeRemoved.forEach((field) => {
        const value = get(newDocument, field);
        const salt = findSaltByPath(newDocument.proof.salts, field);

        expect(obfuscatedDocument.proof.privacy.obfuscated).toContain(
          toBuffer({ [field]: `${salt?.value}:${value}` }).toString("hex")
        );
        expect(findSaltByPath(obfuscatedDocument.proof.salts, field)).toBeUndefined();
      });
      expect(obfuscatedDocument.attachments).toBeUndefined();
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(6);
    });

    test("removes multiple fields", async () => {
      const fields = ["key1", "key2"];
      const newDocument = await wrapDocument(testData);
      const obfuscatedDocument = await obfuscate(newDocument, fields);
      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      fields.forEach((field) => {
        expectRemovedFieldsWithoutArrayNotation(field, newDocument, obfuscatedDocument);
      });
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(2);
    });

    test("removes values from nested object", async () => {
      const field = "credentialSubject.alumniOf";
      const newDocument = await wrapDocument(data);
      const obfuscatedDocument = await obfuscate(newDocument, field);
      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      expectRemovedFieldsWithoutArrayNotation(field, newDocument, obfuscatedDocument);
      expect(obfuscatedDocument.proof.privacy.obfuscated).toHaveLength(1);
    });

    test("removes values from arrays", async () => {
      const fields = ["credentialSubject.array[2]", "credentialSubject.array[3]"];
      const newDocument = await wrapDocument(data);
      const obfuscatedDocument = await obfuscate(newDocument, fields);
      const verified = verifySignature(obfuscatedDocument);
      expect(verified).toBe(true);

      const salts = decodeSalt(newDocument.proof.salts);
      const salt1 = salts.find((s) => s.path === fields[0]);
      const value1 = get(newDocument, fields[0]);
      const salt2 = salts.find((s) => s.path === fields[1]);
      const value2 = get(newDocument, fields[1]);

      expect(obfuscatedDocument.proof.privacy.obfuscated).toEqual([
        toBuffer({ [fields[0]]: `${salt1?.value}:${value1}` }).toString("hex"),
        toBuffer({ [fields[1]]: `${salt2?.value}:${value2}` }).toString("hex"),
      ]);
      expect(findSaltByPath(obfuscatedDocument.proof.salts, fields[0])).toBeUndefined();
      expect(findSaltByPath(obfuscatedDocument.proof.salts, fields[1])).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore not typable
      expect(obfuscatedDocument.credentialSubject.array).not.toContain("three");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore not typable
      expect(obfuscatedDocument.credentialSubject.array).not.toContain("four");
    });

    test("is transitive", async () => {
      const newDocument = await wrapDocument(testData);
      const intermediateDoc = obfuscate(newDocument, "key1");
      const finalDoc1 = obfuscate(intermediateDoc, "key2");
      const finalDoc2 = obfuscate(newDocument, ["key1", "key2"]);

      expect(finalDoc1).toEqual(finalDoc2);
      expect(intermediateDoc).not.toHaveProperty("key1");
      expect(finalDoc1).not.toHaveProperty("key1");
      expect(finalDoc1).not.toHaveProperty("key2");
      expect(finalDoc2).not.toHaveProperty("key1");
      expect(finalDoc2).not.toHaveProperty("key2");
    });
  });

  describe("getObfuscated", () => {
    const documentObfuscatedV4 = ObfuscatedWrapped as WrappedDocument;
    const documentNotObfuscatedV4 = NotObfuscatedWrapped as WrappedDocument;

    test("should return empty array when there is no obfuscated data in document v4", () => {
      expect(getObfuscatedData(documentNotObfuscatedV4)).toHaveLength(0);
    });

    test("should return array of hashes when there is obfuscated data in document v4", () => {
      const obfuscatedData = getObfuscatedData(documentObfuscatedV4);
      expect(obfuscatedData.length).toBe(1);
      expect(obfuscatedData?.[0]).toBe("9e1e02a3e73cde8796839caac22c98379ed04a815ee9b80a9ee46e0ef251aa22");
    });
  });

  describe("isObfuscated", () => {
    const documentObfuscatedV4 = ObfuscatedWrapped as WrappedDocument;
    const documentNotObfuscatedV4 = NotObfuscatedWrapped as WrappedDocument;

    test("should return false when there is no obfuscated data in document v4", () => {
      expect(isObfuscated(documentNotObfuscatedV4)).toBe(false);
    });

    test("should return true where there is obfuscated data in document v4", () => {
      expect(isObfuscated(documentObfuscatedV4)).toBe(true);
    });
  });
});
