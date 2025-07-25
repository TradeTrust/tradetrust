import { keccak256 } from "js-sha3";
import { OpenAttestationDocument as OpenAttestationDocumentV2, TemplateObject } from "../../__generated__/schema.2.0";
import { OpenAttestationDocument as OpenAttestationDocumentV3 } from "../../__generated__/schema.3.0";
import { WrappedDocument as WrappedDocumentV2 } from "../../2.0/types";
import { WrappedDocument as WrappedDocumentV3 } from "../../3.0/types";
import { unsaltData } from "../../2.0/salt";
import { ErrorObject } from "ajv";
import { isRawV2Document, isRawV3Document, isWrappedV2Document, isWrappedV3Document } from "./guard";
import { OpenAttestationDocument, WrappedDocument } from "../@types/document";
import * as v2 from "../../__generated__/schema.2.0";
import * as v3 from "../../__generated__/schema.3.0";
import { isSignedDocument, SignedVerifiableCredential } from "@trustvc/w3c-vc";

export type Hash = string | Buffer;
type Extract<P> = P extends WrappedDocumentV2<infer T> ? T : never;
export const getData = <T extends WrappedDocumentV2<OpenAttestationDocumentV2>>(document: T): Extract<T> => {
  return unsaltData(document.data);
};

/**
 * Sorts the given Buffers lexicographically and then concatenates them to form one continuous Buffer
 */
export function bufSortJoin(...args: Buffer[]): Buffer {
  return Buffer.concat([...args].sort(Buffer.compare));
}

// If hash is not a buffer, convert it to buffer (without hashing it)
export function hashToBuffer(hash: Hash): Buffer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore https://github.com/Microsoft/TypeScript/issues/23155
  return Buffer.isBuffer(hash) && hash.length === 32 ? hash : Buffer.from(hash, "hex");
}

// If element is not a buffer, stringify it and then hash it to be a buffer
export function toBuffer(element: any): Buffer {
  return Buffer.isBuffer(element) && element.length === 32 ? element : hashToBuffer(keccak256(JSON.stringify(element)));
}
/**
 * Turns array of data into sorted array of hashes
 */
export function hashArray(arr: any[]) {
  return arr.map((i) => toBuffer(i)).sort(Buffer.compare);
}

/**
 * Returns the keccak hash of two buffers after concatenating them and sorting them
 * If either hash is not given, the input is returned
 */
export function combineHashBuffers(first?: Buffer, second?: Buffer): Buffer {
  if (!second) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return first!; // it should always be valued if second is not
  }
  if (!first) {
    return second;
  }
  return hashToBuffer(keccak256(bufSortJoin(first, second)));
}

/**
 * Returns the keccak hash of two string after concatenating them and sorting them
 * If either hash is not given, the input is returned
 * @param first A string to be hashed (without 0x)
 * @param second A string to be hashed (without 0x)
 * @returns Resulting string after the hash is combined (without 0x)
 */
export function combineHashString(first?: string, second?: string): string {
  return first && second
    ? combineHashBuffers(hashToBuffer(first), hashToBuffer(second)).toString("hex")
    : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (first || second)!; // this should always return a value right ? :)
}

export function getIssuerAddress(document: any): any {
  if (isWrappedV2Document(document)) {
    const data = getData(document);
    return data.issuers.map((issuer) => issuer.certificateStore || issuer.documentStore || issuer.tokenRegistry);
  } else if (isWrappedV3Document(document)) {
    return document.openAttestationMetadata.proof.value;
  }

  throw new Error(
    "Unsupported document type: Only can retrieve issuer address from wrapped OpenAttestation v2 & v3 documents.",
  );
}

export const getMerkleRoot = (document: any): string => {
  switch (true) {
    case isWrappedV2Document(document):
      return document.signature.merkleRoot;
    case isWrappedV3Document(document):
      return document.proof.merkleRoot;
    default:
      throw new Error(
        "Unsupported document type: Only can retrieve merkle root from wrapped OpenAttestation v2 & v3 documents.",
      );
  }
};

export const getTargetHash = (document: any): string => {
  switch (true) {
    case isWrappedV2Document(document):
      return document.signature.targetHash;
    case isWrappedV3Document(document):
      return document.proof.targetHash;
    default:
      throw new Error(
        "Unsupported document type: Only can retrieve target hash from wrapped OpenAttestation v2 & v3 documents.",
      );
  }
};

// get template url from raw document for document renderer preview.
export const getTemplateURL = (document: any): string | undefined => {
  switch (true) {
    case isWrappedV2Document(document):
      return (getData(document).$template as TemplateObject).url;
    case isRawV2Document(document):
      return (document.$template as TemplateObject).url;
    case isRawV3Document(document) || isWrappedV3Document(document):
      return document.openAttestationMetadata?.template?.url;
    default:
      throw new Error(
        "Unsupported document type: Only can retrieve template url from OpenAttestation v2 & v3 documents.",
      );
  }
};

export const getDocumentData = (document: WrappedDocument<OpenAttestationDocument>): OpenAttestationDocument => {
  if (isWrappedV3Document(document)) {
    const omit = (keys: any, obj: any): any =>
      Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
    return omit(["proof"], document);
  } else if (isWrappedV2Document(document)) {
    return getData(document);
  } else {
    throw "Unsupported document type: Only can retrieve document data for wrapped OpenAttestation v2 & v3 documents.";
  }
};

export const isTransferableAsset = (document: any): boolean => {
  return (
    !!getData(document)?.issuers[0]?.tokenRegistry ||
    document?.openAttestationMetadata?.proof?.method === "TOKEN_REGISTRY"
  );
};

export const isDocumentRevokable = (document: any): boolean => {
  switch (true) {
    case isTransferableAsset(document):
      return false;

    case isWrappedV2Document(document):
      const issuer = getData(document)?.issuers[0];
      const isDidRevokableV2 =
        (issuer.identityProof?.type === v2.IdentityProofType.Did ||
          issuer.identityProof?.type === v2.IdentityProofType.DNSDid) &&
        (issuer.revocation?.type === v2.RevocationType.RevocationStore ||
          issuer.revocation?.type === v2.RevocationType.OcspResponder);
      const isDocumentStoreRevokableV2 = !!issuer.certificateStore || !!issuer.documentStore;

      return isDocumentStoreRevokableV2 || isDidRevokableV2;

    case isWrappedV3Document(document):
      const isDidRevokableV3 =
        (document.openAttestationMetadata.identityProof.type === v3.IdentityProofType.Did ||
          document.openAttestationMetadata.identityProof.type === v3.IdentityProofType.DNSDid) &&
        document.openAttestationMetadata.proof.revocation?.type === v3.RevocationType.RevocationStore;
      const isDocumentStoreRevokableV3 =
        document.openAttestationMetadata.proof.method === v3.Method.DocumentStore &&
        !!document.openAttestationMetadata.proof.value;

      return isDocumentStoreRevokableV3 || isDidRevokableV3;

    default:
      return false;
  }
};

export const getAssetId = (document: any): string => {
  if (isTransferableAsset(document)) {
    return getTargetHash(document);
  }

  throw new Error(
    "Unsupported document type: Only can retrieve asset id from wrapped OpenAttestation v2 & v3 transferable documents.",
  );
};

export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: ErrorObject[],
    public document: any,
  ) {
    super(message);
  }
}
export const isSchemaValidationError = (error: any): error is SchemaValidationError => {
  return !!error.validationErrors;
};

// make it available for consumers
export { keccak256 } from "js-sha3";

export const isObfuscated = (
  document:
    | WrappedDocumentV3<OpenAttestationDocumentV3>
    | WrappedDocumentV2<OpenAttestationDocumentV2>
    | SignedVerifiableCredential,
): boolean => {
  if (isWrappedV3Document(document)) {
    return !!document.proof.privacy?.obfuscated?.length;
  }

  if (isWrappedV2Document(document)) {
    return !!document.privacy?.obfuscatedData?.length;
  }

  if (isSignedDocument(document)) {
    return document.proof?.type === "BbsBlsSignatureProof2020";
  }

  throw new Error(
    "Unsupported document type: Can only check if there are obfuscated data from wrapped OpenAttestation v2, v3 documents and signed verifiable credentials.",
  );
};

export const getObfuscatedData = (
  document: WrappedDocumentV3<OpenAttestationDocumentV3> | WrappedDocumentV2<OpenAttestationDocumentV2>,
): string[] => {
  if (isWrappedV3Document(document)) {
    return document.proof.privacy?.obfuscated;
  }

  if (isWrappedV2Document(document)) {
    return document.privacy?.obfuscatedData || [];
  }

  throw new Error(
    "Unsupported document type: Can only retrieve obfuscated data from wrapped OpenAttestation v2 & v3 documents.",
  );
};
