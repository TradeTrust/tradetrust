import { hashToBuffer, isStringArray, SchemaValidationError } from "../../shared/utils";
import { MerkleTree } from "../../shared/merkle";
import { ContextUrl, SchemaId } from "../../shared/@types/document";
import { WrappedDocument } from "./types";
import { digestCredential } from "../../4.0/oa/digest";
import { validateSchema as validate } from "../../shared/validate";
import { WrapDocumentOptionV4 } from "../../shared/@types/wrap";
import { OpenAttestationDocument } from "../../__generated__/oa-schema.4.0";
import { encodeSalt, salt } from "./salt";
import { validateW3C } from "./validate";
import { getSchema } from "../../shared/ajv";

export const wrapDocument = async <T extends OpenAttestationDocument>(
  credential: T,
  options: WrapDocumentOptionV4, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<WrappedDocument<T>> => {
  const document = { ...credential };

  // 1. Ensure that required @contexts are present and in the correct order
  // @context: [Base, OA, ...]
  const contexts = new Set(["https://www.w3.org/2018/credentials/v1", ContextUrl.oa_v4_alpha]);

  if (typeof document["@context"] === "string") {
    contexts.add(document["@context"]);
  } else if (isStringArray(document["@context"])) {
    document["@context"].forEach((context) => contexts.add(context));
  }

  // Since JavaScript Sets preserve insertion order and duplicated inserts do not affect the order, we can do this:
  document["@context"] = Array.from(contexts);

  // 2. Ensure that required types are present and in the correct order
  // type: ["VerifiableCredential", "OpenAttestationCredential", ...]
  const types = new Set(["VerifiableCredential", "OpenAttestationCredential"]);

  if (typeof document["type"] === "string") {
    types.add(document["type"]);
  } else if (isStringArray(document["type"])) {
    document["type"].forEach((type) => types.add(type));
  }

  // Since JavaScript Sets preserve insertion order and duplicated inserts do not affect the order, we can do this:
  document["type"] = Array.from(types);

  // 3. OA wrapping
  const salts = salt(document);
  const digest = digestCredential(document, salts, []);

  const batchBuffers = [digest].map(hashToBuffer);

  const merkleTree = new MerkleTree(batchBuffers);
  const merkleRoot = merkleTree.getRoot().toString("hex");
  const merkleProof = merkleTree.getProof(hashToBuffer(digest)).map((buffer: Buffer) => buffer.toString("hex"));

  const verifiableCredential: WrappedDocument<T> = {
    ...document,
    proof: {
      type: "OpenAttestationMerkleProofSignature2018",
      proofPurpose: "assertionMethod",
      targetHash: digest,
      proofs: merkleProof,
      merkleRoot,
      salts: encodeSalt(salts),
      privacy: {
        obfuscated: [],
      },
    },
  };

  const errors = validate(verifiableCredential, getSchema(SchemaId.oa_v4));
  if (errors.length > 0) {
    throw new SchemaValidationError("Invalid document", errors, verifiableCredential);
  }
  await validateW3C(verifiableCredential);
  return verifiableCredential;
};

export const wrapDocuments = async <T extends OpenAttestationDocument>(
  documents: T[],
  options: WrapDocumentOptionV4,
): Promise<WrappedDocument<T>[]> => {
  // create individual verifiable credential
  const verifiableCredentials = await Promise.all(documents.map((document) => wrapDocument(document, options)));

  // get all the target hashes to compute the merkle tree and the merkle root
  const merkleTree = new MerkleTree(
    verifiableCredentials.map((verifiableCredential) => verifiableCredential.proof.targetHash).map(hashToBuffer),
  );
  const merkleRoot = merkleTree.getRoot().toString("hex");

  // for each document, update the merkle root and add the proofs needed
  return verifiableCredentials.map((verifiableCredential) => {
    const digest = verifiableCredential.proof.targetHash;
    const merkleProof = merkleTree.getProof(hashToBuffer(digest)).map((buffer: Buffer) => buffer.toString("hex"));

    return {
      ...verifiableCredential,
      proof: {
        ...verifiableCredential.proof,
        proofs: merkleProof,
        merkleRoot,
      },
    };
  });
};