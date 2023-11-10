import { SignedWrappedDocument } from "../@types/document";
import {
  OpenAttestationDocument as OpenAttestationDocumentV2,
  WrappedDocument as WrappedDocumentV2,
} from "../../2.0/types";
import {
  OpenAttestationDocument as OpenAttestationDocumentV3,
  WrappedDocument as WrappedDocumentV3,
} from "../../3.0/types";
import { TradeTrustDocument as TradeTrustDocumentV4, WrappedDocument as TTWrappedDocumentV4 } from "../../4.0/tt/types";
import {
  OpenAttestationDocument as OpenAttestationDocumentV4,
  WrappedDocument as OAWrappedDocumentV4,
} from "../../4.0/oa/types";
import { diagnose, handleError } from "./diagnose";
import { Mode } from "./@types/diagnose";

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isRawV2Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is OpenAttestationDocumentV2 => {
  return diagnose({ version: "2.0", kind: "raw", document, debug: false, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isRawV3Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is OpenAttestationDocumentV3 => {
  return diagnose({ version: "3.0", kind: "raw", document, debug: false, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isRawOAV4Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is OpenAttestationDocumentV4 => {
  const debug = false;
  if (!document.type) {
    handleError(debug, "A raw verifiable credential needs to have a type");
    return false;
  }
  if (typeof document.type === "string") {
    handleError(
      debug,
      "A raw open-attestation credential needs to have a VerifiableCredential and OpenAttestationCredential in an array"
    );
    return false;
  }
  if (!document.type.includes("OpenAttestationCredential")) {
    handleError(debug, "A raw open-attestation credential needs to have the OpenAttestationCredential type");
    return false;
  }
  return diagnose({ version: "oa_4.0", kind: "raw", document, debug, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isRawTTV4Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is TradeTrustDocumentV4 => {
  const debug = false;
  if (!document.type) {
    handleError(debug, "A raw verifiable credential needs to have a type");
    return false;
  }
  if (typeof document.type === "string") {
    handleError(
      debug,
      "A raw tradetrust credential needs to have a VerifiableCredential and TradeTrustCredential in an array"
    );
    return false;
  }
  if (!document.type.includes("TradeTrustCredential")) {
    handleError(debug, "A raw tradetrust credential needs to have the TradeTrustCredential type");
    return false;
  }
  return diagnose({ version: "tt_4.0", kind: "raw", document, debug, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isWrappedV2Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is WrappedDocumentV2<OpenAttestationDocumentV2> => {
  return diagnose({ version: "2.0", kind: "wrapped", document, debug: false, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isWrappedV3Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is WrappedDocumentV3<OpenAttestationDocumentV3> => {
  return diagnose({ version: "3.0", kind: "wrapped", document, debug: false, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isWrappedOAV4Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is OAWrappedDocumentV4<OpenAttestationDocumentV4> => {
  return diagnose({ version: "oa_4.0", kind: "wrapped", document, debug: false, mode }).length === 0;
};
/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isWrappedTTV4Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is TTWrappedDocumentV4<TradeTrustDocumentV4> => {
  return diagnose({ version: "tt_4.0", kind: "wrapped", document, debug: false, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isSignedWrappedV2Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is SignedWrappedDocument<OpenAttestationDocumentV2> => {
  return diagnose({ version: "2.0", kind: "signed", document, debug: false, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isSignedWrappedV3Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is SignedWrappedDocument<OpenAttestationDocumentV3> => {
  return diagnose({ version: "3.0", kind: "signed", document, debug: false, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isSignedWrappedOAV4Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is SignedWrappedDocument<OpenAttestationDocumentV4> => {
  return diagnose({ version: "oa_4.0", kind: "signed", document, debug: false, mode }).length === 0;
};

/**
 *
 * @param document
 * @param mode strict or non-strict. Strict will perform additional check on the data. For instance strict validation will ensure that a target hash is a 32 bytes hex string while non strict validation will just check that target hash is a string.
 */
export const isSignedWrappedTTV4Document = (
  document: any,
  { mode }: { mode: Mode } = { mode: "non-strict" }
): document is SignedWrappedDocument<TradeTrustDocumentV4> => {
  return diagnose({ version: "tt_4.0", kind: "signed", document, debug: false, mode }).length === 0;
};
