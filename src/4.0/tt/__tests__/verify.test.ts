import { verify } from "../verify";
import sample from "../../../../test/fixtures/v4/tt/did-wrapped.json";
import { WrappedDocument } from "../../../4.0/tt/types";

const sampleVerifiableCredential = sample as WrappedDocument;

describe("signature", () => {
  describe("verify", () => {
    // Documents without proofs mean these documents are wrapped individually (i.e. targetHash == merkleRoot)
    describe("documents without proofs", () => {
      test("returns true for documents with unaltered data", () => {
        expect(verify(sampleVerifiableCredential)).toBe(true);
      });
      test("returns false for documents with altered value", () => {
        const verifiableCredential = {
          ...sampleVerifiableCredential,
          credentialSubject: {
            id: "urn:uuid:a013fb9d-bb03-4056-b696-05575eceaf42",
            name: "newName",
          },
        };

        expect(verify(verifiableCredential)).toBe(false);
      });
      test("returns false for documents with altered key", () => {
        const verifiableCredential = {
          ...sampleVerifiableCredential,
          credentialStatus: {
            type: "SomeNewCredentialStatus",
            credentialStatusType: "NONE",
          },
        };

        expect(verify(verifiableCredential as any)).toBe(false);
      });
      test("returns false for documents with additional data not part of salt", () => {
        // In this test case, we added the Class 2A licence which is not found in the original salts
        const verifiableCredential = {
          ...sampleVerifiableCredential,
          credentialSubject: {
            ...sampleVerifiableCredential.credentialSubject,
            billableItems: [
              { description: "Service Fee", quantity: "1", unitPrice: "200", amount: "200" },
              { description: "Labor: 5 hours at $75/hr", quantity: "5", unitPrice: "75", amount: "375" },
              { description: "New client discount", quantity: "1", unitPrice: "50", amount: "50" },
              // here we are adding billableItems data that
              // did not belong to the original.
              { description: "Another new client discount", quantity: "1", unitPrice: "60", amount: "50" },
            ],
          },
        };

        expect(verify(verifiableCredential)).toBe(false);
      });
      test("returns false for documents with missing data", () => {
        // In this test case, we removed the Labor item which is in the original salts
        const verifiableCredential = {
          ...sampleVerifiableCredential,
          credentialSubject: {
            ...sampleVerifiableCredential.credentialSubject,
            billableItems: [
              { description: "Service Fee", quantity: "1", unitPrice: "200", amount: "200" },
              { description: "New client discount", quantity: "1", unitPrice: "50", amount: "50" },
            ],
          },
        };

        expect(verify(verifiableCredential)).toBe(false);
      });
    });
  });
});
