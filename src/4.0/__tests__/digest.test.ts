import {
  OAVerifiableCredential,
  ProoflessOAVerifiableCredential,
  OADigestedOAVerifiableCredential,
  W3cVerifiableCredential,
  ProoflessW3cVerifiableCredential,
} from "../types";
import { digestVc } from "../digest";

describe("V4.0 digest", () => {
  test("given a valid v4 VC, should digest correctly", async () => {
    const digested = await digestVc({
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://schemata.openattestation.com/com/openattestation/4.0/context.json",
      ],
      type: ["VerifiableCredential", "OpenAttestationCredential"],
      credentialSubject: {
        id: "0x1234567890123456789012345678901234567890",
        name: "John Doe",
        country: "SG",
      },
      issuer: {
        id: "did:ethr:0xB26B4941941C51a4885E5B7D3A1B861E54405f90",
        type: "OpenAttestationIssuer",
        name: "Government Technology Agency of Singapore (GovTech)",
        identityProof: { identityProofType: "DNS-DID", identifier: "example.openattestation.com" },
      },
    });
    const parsedResults = OADigestedOAVerifiableCredential.safeParse(digested);
    if (!parsedResults.success) {
      throw new Error("Parsing failed");
    }
    const { proof } = parsedResults.data;
    expect(proof.merkleRoot.length).toBe(64);
    expect(proof.privacy.obfuscated).toEqual([]);
    expect(proof.proofPurpose).toBe("assertionMethod");
    expect(proof.proofs).toEqual([]);
    expect(proof.salts.length).toBeGreaterThan(0);
    expect(proof.targetHash.length).toBe(64);
    expect(proof.type).toBe("OpenAttestationHashProof2018");
  });

  test("given a VC with explicit v4 contexts, but does not conform to the V4 VC schema, should throw", async () => {
    await expect(
      digestVc({
        "@context": [
          "https://www.w3.org/ns/credentials/v2",
          "https://schemata.openattestation.com/com/openattestation/4.0/context.json",
        ],

        type: ["VerifiableCredential", "OpenAttestationCredential"],
        credentialSubject: {
          id: "0x1234567890123456789012345678901234567890",
          name: "John Doe",
          country: "SG",
        },
        issuer: {
          id: "did:ethr:0xB26B4941941C51a4885E5B7D3A1B861E54405f90",
          name: "Government Technology Agency of Singapore (GovTech)",
          identityProof: { identityProofType: "DNS-DID", identifier: "example.openattestation.com" },
        } as OAVerifiableCredential["issuer"],
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Input VC does not conform to Open Attestation v4.0 Data Model: 
       {
        "_errors": [],
        "issuer": {
          "_errors": [],
          "type": {
            "_errors": [
              "Invalid literal value, expected \\"OpenAttestationIssuer\\""
            ]
          }
        }
      }"
    `);
  });

  test("given a valid v4 VC but has an extra field, should throw", async () => {
    await expect(
      digestVc({
        "@context": [
          "https://www.w3.org/ns/credentials/v2",
          "https://schemata.openattestation.com/com/openattestation/4.0/context.json",
        ],

        type: ["VerifiableCredential", "OpenAttestationCredential"],
        credentialSubject: {
          id: "0x1234567890123456789012345678901234567890",
          name: "John Doe",
          country: "SG",
        },
        issuer: {
          id: "did:ethr:0xB26B4941941C51a4885E5B7D3A1B861E54405f90",
          type: "OpenAttestationIssuer",
          name: "Government Technology Agency of Singapore (GovTech)",
          extraField: "extra",
          identityProof: { identityProofType: "DNS-DID", identifier: "example.openattestation.com" },
        },
        // this should not exist
        extraField: "extra",
      } as ProoflessOAVerifiableCredential)
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Input VC does not conform to Open Attestation v4.0 Data Model: 
       {
        "_errors": [
          "Unrecognized key(s) in object: 'extraField'"
        ]
      }"
    `);
  });

  test("given a generic W3C VC and with validate with OA data model disabled, should digest with context and type corrected", async () => {
    const genericW3cVc: W3cVerifiableCredential = {
      "@context": ["https://www.w3.org/ns/credentials/v2"],
      type: ["VerifiableCredential"],
      credentialSubject: {
        id: "0x1234567890123456789012345678901234567890",
        name: "John Doe",
        country: "SG",
      },
      issuer: {
        id: "https://example.com/issuer/123",
      },
    };
    const digested = await digestVc(genericW3cVc as unknown as ProoflessW3cVerifiableCredential, true);
    const parsedResults = OADigestedOAVerifiableCredential.pick({ "@context": true, type: true })
      .passthrough()
      .safeParse(digested);
    expect(parsedResults.success).toBe(true);
    expect(digested.proof.merkleRoot.length).toBe(64);
    expect(digested.proof.privacy.obfuscated).toEqual([]);
    expect(digested.proof.proofPurpose).toBe("assertionMethod");
    expect(digested.proof.proofs).toEqual([]);
    expect(digested.proof.salts.length).toBeGreaterThan(0);
    expect(digested.proof.targetHash.length).toBe(64);
    expect(digested.proof.type).toBe("OpenAttestationHashProof2018");
  });

  test("given a generic W3C VC and with validate with OA data model disabled, should digest with context and type corrected - TradeTrust - Token Registry", async () => {
    const genericW3cVc: W3cVerifiableCredential = {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://w3id.org/security/bbs/v1",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://trustvc.io/context/transferable-records-context.json",
        "https://trustvc.io/context/attachments-context.json",
        "https://trustvc.io/context/bill-of-lading.json",
      ],
      credentialStatus: {
        type: "TransferableRecords",
        tokenNetwork: {
          chain: "MATIC",
          chainId: "80001",
        },
        tokenRegistry: "0xE0a94770B8e969B5D9179d6dA8730B01e19279e2",
        tokenId: "398124e7f1ec797a3dea6322e5ce4ff5ee242ab6293c2acf41a95178dfb27dae",
      },
      id: "urn:uuid:0192d19c-d82c-7cc7-9431-cb495374f43b",
      credentialSubject: {
        billOfLadingName: "TrustVC Bill of Lading",
        scac: "SGPU",
        blNumber: "SGCNM21566325",
        vessel: "vessel",
        voyageNo: "voyageNo",
        portOfLoading: "Singapore",
        portOfDischarge: "Paris",
        carrierName: "A.P. Moller",
        placeOfReceipt: "Beijing",
        placeOfDelivery: "Singapore",
        packages: [
          { packagesDescription: "package 1", packagesWeight: "10", packagesMeasurement: "20" },
          { packagesDescription: "package 2", packagesWeight: "10", packagesMeasurement: "20" },
        ],
        shipperName: "Shipper Name",
        shipperAddressStreet: "101 ORCHARD ROAD",
        shipperAddressCountry: "SINGAPORE",
        consigneeName: "Consignee name",
        notifyPartyName: "Notify Party Name",
        links: "https://localhost:3000/url",
        attachments: [
          { data: "BASE64_ENCODED_FILE", filename: "sample1.pdf", mimeType: "application/pdf" },
          { data: "BASE64_ENCODED_FILE", filename: "sample2.pdf", mimeType: "application/pdf" },
        ],
        type: ["BillOfLading"],
      },
      renderMethod: [
        {
          id: "https://localhost:3000/renderer",
          type: "EMBEDDED_RENDERER",
          templateName: "BILL_OF_LADING",
        },
      ],
      issuer: "did:web:trustvc.github.io:did:1",
      type: ["VerifiableCredential"],
    };

    const digested = await digestVc(genericW3cVc as unknown as ProoflessW3cVerifiableCredential, true);
    const parsedResults = OADigestedOAVerifiableCredential.pick({ "@context": true, type: true })
      .passthrough()
      .safeParse(digested);
    expect(parsedResults.success).toBe(true);
    expect(digested.proof.merkleRoot.length).toBe(64);
    expect(digested.proof.privacy.obfuscated).toEqual([]);
    expect(digested.proof.proofPurpose).toBe("assertionMethod");
    expect(digested.proof.proofs).toEqual([]);
    expect(digested.proof.salts.length).toBeGreaterThan(0);
    expect(digested.proof.targetHash.length).toBe(64);
    expect(digested.proof.type).toBe("OpenAttestationHashProof2018");
  }, 30_000);

  test("given a generic W3C VC and with validate with OA data model disabled, should digest with context and type corrected - TradeTrust - Status List", async () => {
    const genericW3cVc: W3cVerifiableCredential = {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://w3id.org/security/bbs/v1",
        "https://w3id.org/vc/status-list/2021/v1",
        "https://trustvc.io/context/transferable-records-context.json",
        "https://trustvc.io/context/attachments-context.json",
        "https://trustvc.io/context/bill-of-lading.json",
      ],
      credentialStatus: {
        id: "https://trustvc.github.io/did/credentials/statuslist/1#1",
        statusListCredential: "https://trustvc.github.io/did/credentials/statuslist/1",
        statusListIndex: "1",
        statusPurpose: "revocation",
        type: "StatusList2021Entry",
      },
      id: "urn:uuid:0192d19c-d82c-7cc7-9431-cb495374f43b",
      credentialSubject: {
        billOfLadingName: "TrustVC Bill of Lading",
        scac: "SGPU",
        blNumber: "SGCNM21566325",
        vessel: "vessel",
        voyageNo: "voyageNo",
        portOfLoading: "Singapore",
        portOfDischarge: "Paris",
        carrierName: "A.P. Moller",
        placeOfReceipt: "Beijing",
        placeOfDelivery: "Singapore",
        packages: [
          { packagesDescription: "package 1", packagesWeight: "10", packagesMeasurement: "20" },
          { packagesDescription: "package 2", packagesWeight: "10", packagesMeasurement: "20" },
        ],
        shipperName: "Shipper Name",
        shipperAddressStreet: "101 ORCHARD ROAD",
        shipperAddressCountry: "SINGAPORE",
        consigneeName: "Consignee name",
        notifyPartyName: "Notify Party Name",
        links: "https://localhost:3000/url",
        attachments: [
          { data: "BASE64_ENCODED_FILE", filename: "sample1.pdf", mimeType: "application/pdf" },
          { data: "BASE64_ENCODED_FILE", filename: "sample2.pdf", mimeType: "application/pdf" },
        ],
        type: ["BillOfLading"],
      },
      renderMethod: [
        {
          id: "https://localhost:3000/renderer",
          type: "EMBEDDED_RENDERER",
          templateName: "BILL_OF_LADING",
        },
      ],
      issuer: "did:web:trustvc.github.io:did:1",
      type: ["VerifiableCredential"],
    };

    const digested = await digestVc(genericW3cVc as unknown as ProoflessW3cVerifiableCredential, true);
    const parsedResults = OADigestedOAVerifiableCredential.pick({ "@context": true, type: true })
      .passthrough()
      .safeParse(digested);
    expect(parsedResults.success).toBe(true);
    expect(digested.proof.merkleRoot.length).toBe(64);
    expect(digested.proof.privacy.obfuscated).toEqual([]);
    expect(digested.proof.proofPurpose).toBe("assertionMethod");
    expect(digested.proof.proofs).toEqual([]);
    expect(digested.proof.salts.length).toBeGreaterThan(0);
    expect(digested.proof.targetHash.length).toBe(64);
    expect(digested.proof.type).toBe("OpenAttestationHashProof2018");
  }, 30_000);
});
