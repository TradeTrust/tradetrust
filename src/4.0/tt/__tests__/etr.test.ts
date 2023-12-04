import {
  _unsafe_use_it_at_your_own_risk_v4_alpha_tt_wrapDocument as wrapDocument,
  validateSchema,
  verifySignature,
  signDocument,
  SUPPORTED_SIGNING_ALGORITHM,
} from "../../..";
import { WrappedDocument } from "../../../4.0/tt/types";
import { TradeTrustDocument } from "../../../__generated__/tt-schema.4.0";
import sample from "../../../../test/fixtures/v4/etr/etr-did-idvc-raw.json";
import sampleWrapped from "../../../../test/fixtures/v4/etr/etr-did-idvc-wrapped.json";
import { Wallet } from "ethers";
import { verify } from "../verify";

const documentDid = sample as TradeTrustDocument;
const wrappedDocument = sampleWrapped as any;

describe("4.0 ETR E2E Test Scenarios", () => {
  test("wrapDocument", async () => {
    const wrappedDocument: WrappedDocument<TradeTrustDocument> = await wrapDocument(documentDid);

    expect(wrappedDocument.proof.type).toBe("TradeTrustMerkleProofSignature2018");
    expect(wrappedDocument.proof.targetHash).toBeDefined();
    expect(wrappedDocument.proof.merkleRoot).toBeDefined();
    expect(wrappedDocument.proof.proofs).toEqual([]);
    expect(wrappedDocument.proof.merkleRoot).toBe(wrappedDocument.proof.targetHash);
    expect(validateSchema(wrappedDocument)).toBe(true);

    const verified = verifySignature(wrappedDocument);
    expect(verified).toBe(true);
  });

  test("signDocument", async () => {
    const wallet = new Wallet("0x497c85ed89f1874ba37532d1e33519aba15bd533cdcb90774cc497bfe3cde655");

    const signedDocument = await signDocument(
      wrappedDocument,
      SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
      wallet
    );

    const { proof } = signedDocument;

    const verifed = verify(signedDocument);
    expect(verifed).toBe(true);

    expect(Object.keys(proof).length).toBe(9);
    expect(proof.key).toBe("did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89#controller");
    expect(proof.signature).toBe(
      "0x4da35f7bd52dcdfccc3e534e4cf8c60808d450859cdc50c17cfad5f0d02a3019074468fa956af7ef3e17bea0d61ca781a3662aee1786cc226ce73321a9c1fa2e1c"
    );
  });
});
