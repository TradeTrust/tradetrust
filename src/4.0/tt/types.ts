// types generated by quicktype during postinstall phase
import { TradeTrustDocument as TradeTrustDocumentV4, ProofPurpose } from "../../__generated__/tt-schema.4.0";
import { TradeTrustHexString, TradeTrustSignatureAlgorithm as SignatureAlgorithm } from "../../shared/@types/document";
import { Array, Literal, Record, Static, String, Union } from "runtypes";

export interface Salt {
  value: string;
  path: string;
}

export const PrivacyObfuscation = Record({
  obfuscated: Array(TradeTrustHexString),
});
export type PrivacyObfuscation = Static<typeof PrivacyObfuscation>;

export const WrappedProof = Record({
  type: SignatureAlgorithm,
  /* FIXME: No straightforward way to represent enum in runtypes */
  // proofPurpose: runtypesFromEnum(ProofPurpose),
  // proofPurpose: ProofPurpose,
  proofPurpose: Union(Literal(ProofPurpose.AssertionMethod)),
  targetHash: String,
  proofs: Array(String),
  merkleRoot: String,
  salts: String,
  privacy: PrivacyObfuscation,
});
export type WrappedProof = Static<typeof WrappedProof>;

export const WrappedProofStrict = WrappedProof.And(
  Record({
    targetHash: TradeTrustHexString,
    merkleRoot: TradeTrustHexString,
    proofs: Array(TradeTrustHexString),
  })
);
export type WrappedProofStrict = Static<typeof WrappedProofStrict>;

export const SignedWrappedProof = WrappedProof.And(
  Record({
    key: String,
    signature: String,
  })
);
export type SignedWrappedProof = Static<typeof SignedWrappedProof>;

export type WrappedDocument<T extends TradeTrustDocumentV4 = TradeTrustDocumentV4> = T & {
  proof: WrappedProof;
};

export type SignedWrappedDocument<T extends TradeTrustDocumentV4 = TradeTrustDocumentV4> = T & {
  proof: SignedWrappedProof;
};

export * from "../../__generated__/tt-schema.4.0";