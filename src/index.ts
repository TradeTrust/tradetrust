import { ethers, Signer } from "ethers";

import { getSchema } from "./shared/ajv";
import * as utils from "./shared/utils";
import { SchemaValidationError } from "./shared/utils";
import { validateSchema as validate } from "./shared/validate";
import { SchemaId, WrappedDocument, OpenAttestationDocument } from "./shared/@types/document";
import { WrapDocumentOptionV2, WrapDocumentOptionV3, WrapDocumentOptionV4 } from "./shared/@types/wrap";
import { SigningKey, SUPPORTED_SIGNING_ALGORITHM } from "./shared/@types/sign";

import * as v2 from "./2.0/types";
import { WrappedDocument as WrappedDocumentV2 } from "./2.0/types";
import { wrapDocument as wrapDocumentV2, wrapDocuments as wrapDocumentsV2 } from "./2.0/wrap";
import { signDocument as signDocumentV2 } from "./2.0/sign";
import { verify } from "./2.0/verify";
import { obfuscateDocument as obfuscateDocumentV2 } from "./2.0/obfuscate";
import { OpenAttestationDocument as OpenAttestationDocumentV2 } from "./__generated__/schema.2.0";

import * as v3 from "./3.0/types";
import { WrappedDocument as WrappedDocumentV3 } from "./3.0/types";
import { wrapDocument as wrapDocumentV3, wrapDocuments as wrapDocumentsV3 } from "./3.0/wrap";
import { signDocument as signDocumentV3 } from "./3.0/sign";
import { verify as verifyV3 } from "./3.0/verify";
import { digestCredential as digestCredentialV3 } from "./3.0/digest";
import { obfuscateVerifiableCredential as obfuscateVerifiableCredentialV3 } from "./3.0/obfuscate";
import { OpenAttestationDocument as OpenAttestationDocumentV3 } from "./__generated__/schema.3.0";

import * as OAv4 from "./4.0/oa/types";
import { WrappedDocument as OAWrappedDocumentV4 } from "./4.0/oa/types";
import { wrapDocument as OAwrapDocumentV4, wrapDocuments as OAwrapDocumentsV4 } from "./4.0/oa/wrap";
import { signDocument as OAsignDocumentV4 } from "./4.0/oa/sign";
import { verify as OAverifyV4 } from "./4.0/oa/verify";
import { digestCredential as OAdigestCredentialV4 } from "./4.0/oa/digest";
import { obfuscateVerifiableCredential as OAobfuscateVerifiableCredentialV4 } from "./4.0/oa/obfuscate";
import { OpenAttestationDocument as OpenAttestationDocumentV4 } from "./__generated__/oa-schema.4.0";

import * as TTv4 from "./4.0/tt/types";
import { WrappedDocument as TTWrappedDocumentV4 } from "./4.0/tt/types";
import { wrapDocument as TTwrapDocumentV4, wrapDocuments as TTwrapDocumentsV4 } from "./4.0/tt/wrap";
import { signDocument as TTsignDocumentV4 } from "./4.0/tt/sign";
import { verify as TTverifyV4 } from "./4.0/tt/verify";
import { digestCredential as TTdigestCredentialV4 } from "./4.0/tt/digest";
import { obfuscateVerifiableCredential as TTobfuscateVerifiableCredentialV4 } from "./4.0/tt/obfuscate";
import { TradeTrustDocument as TradeTrustDocumentV4 } from "./__generated__/tt-schema.4.0";

export function wrapDocument<T extends OpenAttestationDocumentV2>(
  data: T,
  options?: WrapDocumentOptionV2
): WrappedDocumentV2<T> {
  return wrapDocumentV2(data, { externalSchemaId: options?.externalSchemaId });
}

export function wrapDocuments<T extends OpenAttestationDocumentV2>(
  dataArray: T[],
  options?: WrapDocumentOptionV2
): WrappedDocumentV2<T>[] {
  return wrapDocumentsV2(dataArray, { externalSchemaId: options?.externalSchemaId });
}

export function __unsafe__use__it__at__your__own__risks__wrapDocument<T extends OpenAttestationDocumentV3>(
  data: T,
  options?: WrapDocumentOptionV3
): Promise<WrappedDocumentV3<T>> {
  return wrapDocumentV3(data, options ?? { version: SchemaId.v3 });
}

export function __unsafe__use__it__at__your__own__risks__wrapDocuments<T extends OpenAttestationDocumentV3>(
  dataArray: T[],
  options?: WrapDocumentOptionV3
): Promise<WrappedDocumentV3<T>[]> {
  return wrapDocumentsV3(dataArray, options ?? { version: SchemaId.v3 });
}

export function _unsafe_use_it_at_your_own_risk_v4_alpha_oa_wrapDocument<T extends OpenAttestationDocumentV4>(
  data: T,
  options?: WrapDocumentOptionV4
): Promise<OAWrappedDocumentV4<T>> {
  return OAwrapDocumentV4(data, options ?? { version: SchemaId.oa_v4 });
}

export function _unsafe_use_it_at_your_own_risk_v4_alpha_tt_wrapDocument<T extends TradeTrustDocumentV4>(
  data: T,
  options?: WrapDocumentOptionV4
): Promise<TTWrappedDocumentV4<T>> {
  return TTwrapDocumentV4(data, options ?? { version: SchemaId.tt_v4 });
}

export function _unsafe_use_it_at_your_own_risk_v4_alpha_oa_wrapDocuments<T extends OpenAttestationDocumentV4>(
  dataArray: T[],
  options?: WrapDocumentOptionV4
): Promise<OAWrappedDocumentV4<T>[]> {
  return OAwrapDocumentsV4(dataArray, options ?? { version: SchemaId.oa_v4 });
}

export function _unsafe_use_it_at_your_own_risk_v4_alpha_tt_wrapDocuments<T extends TradeTrustDocumentV4>(
  dataArray: T[],
  options?: WrapDocumentOptionV4
): Promise<TTWrappedDocumentV4<T>[]> {
  return TTwrapDocumentsV4(dataArray, options ?? { version: SchemaId.tt_v4 });
}

export const validateSchema = (document: WrappedDocument<any>): boolean => {
  if (utils.isWrappedV2Document(document) || document?.version === SchemaId.v2)
    return validate(document, getSchema(SchemaId.v2)).length === 0;
  else if (utils.isWrappedV3Document(document) || document?.version === SchemaId.v3)
    return validate(document, getSchema(SchemaId.v3)).length === 0;
  else if (utils.isWrappedOAV4Document(document)) {
    return validate(document, getSchema(SchemaId.oa_v4)).length === 0;
  } else if (utils.isWrappedTTV4Document(document)) {
    return validate(document, getSchema(SchemaId.tt_v4)).length === 0;
  }

  return validate(document, getSchema(`${document?.version || SchemaId.v2}`)).length === 0;
};

export function verifySignature<T extends WrappedDocument<OpenAttestationDocument>>(document: T) {
  if (utils.isWrappedV2Document(document)) return verify(document);
  else if (utils.isWrappedV3Document(document)) return verifyV3(document);
  else if (utils.isWrappedOAV4Document(document)) return OAverifyV4(document);
  else if (utils.isWrappedTTV4Document(document)) return TTverifyV4(document);

  throw new Error("Unsupported document type: Only OpenAttestation v2, v3 or v4 documents can be signature verified");
}

export function digest(document: OpenAttestationDocumentV3, salts: v3.Salt[], obfuscatedData: string[]): string;
export function digest(document: TradeTrustDocumentV4, salts: TTv4.Salt[], obfuscatedData: string[]): string;
export function digest(
  document: OpenAttestationDocumentV3 | TradeTrustDocumentV4,
  salts: v3.Salt[] | TTv4.Salt[],
  obfuscatedData: string[]
): string {
  if (utils.isRawV3Document(document)) return digestCredentialV3(document, salts, obfuscatedData);
  else if (utils.isRawTTV4Document(document)) return TTdigestCredentialV4(document, salts, obfuscatedData);
  else if (utils.isRawOAV4Document(document)) return OAdigestCredentialV4(document, salts, obfuscatedData);

  throw new Error(
    "Unsupported credential type: This function only supports digest generation for OpenAttestation v3 or v4 credentials"
  );
}

export function obfuscate<T extends OpenAttestationDocumentV2>(
  document: WrappedDocument<T>,
  fields: string[] | string
): WrappedDocument<T>;
export function obfuscate<T extends OpenAttestationDocumentV3>(
  document: WrappedDocument<T>,
  fields: string[] | string
): WrappedDocument<T>;
export function obfuscate<T extends OpenAttestationDocumentV4>(
  document: WrappedDocument<T>,
  fields: string[] | string
): WrappedDocument<T>;
export function obfuscate<T extends TradeTrustDocumentV4>(
  document: WrappedDocument<T>,
  fields: string[] | string
): WrappedDocument<T>;
export function obfuscate<T extends OpenAttestationDocument>(document: WrappedDocument<T>, fields: string[] | string) {
  if (utils.isWrappedV2Document(document)) return obfuscateDocumentV2(document, fields);
  else if (utils.isWrappedV3Document(document)) return obfuscateVerifiableCredentialV3(document, fields);
  else if (utils.isWrappedOAV4Document(document)) return OAobfuscateVerifiableCredentialV4(document, fields);
  else if (utils.isWrappedTTV4Document(document)) return TTobfuscateVerifiableCredentialV4(document, fields);

  throw new Error("Unsupported document type: Only OpenAttestation v2, v3 or v4 documents can be obfuscated");
}

export const isSchemaValidationError = (error: any): error is SchemaValidationError => {
  return !!error.validationErrors;
};

export async function signDocument<T extends v2.OpenAttestationDocument>(
  document: v2.SignedWrappedDocument<T> | v2.WrappedDocument<T>,
  algorithm: SUPPORTED_SIGNING_ALGORITHM,
  keyOrSigner: SigningKey | ethers.Signer
): Promise<v2.SignedWrappedDocument<T>>;
export async function signDocument<T extends v3.OpenAttestationDocument>(
  document: v3.SignedWrappedDocument<T> | v3.WrappedDocument<T>,
  algorithm: SUPPORTED_SIGNING_ALGORITHM,
  keyOrSigner: SigningKey | ethers.Signer
): Promise<v3.SignedWrappedDocument<T>>;
export async function signDocument<T extends OAv4.OpenAttestationDocument>(
  document: OAv4.SignedWrappedDocument<T> | OAv4.WrappedDocument<T>,
  algorithm: SUPPORTED_SIGNING_ALGORITHM,
  keyOrSigner: SigningKey | ethers.Signer
): Promise<OAv4.SignedWrappedDocument<T>>;
export async function signDocument<T extends TTv4.TradeTrustDocument>(
  document: TTv4.SignedWrappedDocument<T> | TTv4.WrappedDocument<T>,
  algorithm: SUPPORTED_SIGNING_ALGORITHM,
  keyOrSigner: SigningKey | ethers.Signer
): Promise<TTv4.SignedWrappedDocument<T>>;
export async function signDocument(
  document: any,
  algorithm: SUPPORTED_SIGNING_ALGORITHM,
  keyOrSigner: SigningKey | ethers.Signer
) {
  // rj was worried it could happen deep in the code, so I moved it to the boundaries
  if (!SigningKey.guard(keyOrSigner) && !Signer.isSigner(keyOrSigner)) {
    throw new Error(`Either a keypair or ethers.js Signer must be provided`);
  }

  if (utils.isWrappedV2Document(document)) return signDocumentV2(document, algorithm, keyOrSigner);
  else if (utils.isWrappedV3Document(document)) return signDocumentV3(document, algorithm, keyOrSigner);
  else if (utils.isWrappedOAV4Document(document)) return OAsignDocumentV4(document, algorithm, keyOrSigner);
  else if (utils.isWrappedTTV4Document(document)) return TTsignDocumentV4(document, algorithm, keyOrSigner);

  // Unreachable code atm until utils.isWrappedV2Document & utils.isWrappedV3Document becomes more strict
  throw new Error("Unsupported document type: Only OpenAttestation v2, v3 or v4 documents can be signed");
}

export { digestDocument } from "./2.0/digest";
export { checkProof, MerkleTree } from "./shared/merkle";
export { digest as digestCredential };
export { obfuscate as obfuscateDocument };
export { utils };
export * from "./shared/@types/document";
export * from "./shared/@types/sign";
export * from "./shared/signer";
export { getData } from "./shared/utils"; // keep it to avoid breaking change, moved from privacy to utils
export { v2 };
export { v3 };
export { TTv4 };
export { OAv4 };
