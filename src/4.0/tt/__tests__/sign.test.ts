import { signDocument, TTv4 as v4 } from "../../../index";
import { SUPPORTED_SIGNING_ALGORITHM } from "../../../shared/@types/sign";
import sample from "../../../../test/fixtures/v4/tt/did-wrapped.json";
import { Wallet } from "ethers";

const wrappedDocumentV4 = sample as v4.WrappedDocument;

describe("v4", () => {
  it("should sign a document", async () => {
    const { proof } = await signDocument(wrappedDocumentV4, SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018, {
      public: "did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89#controller",
      private: "0x497c85ed89f1874ba37532d1e33519aba15bd533cdcb90774cc497bfe3cde655",
    });

    expect(Object.keys(proof).length).toBe(9);
    expect(proof.key).toBe("did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89#controller");
    expect(proof.signature).toBe(
      "0xf08422c35dd34997ee9d16fd405cd5990d8cd48f8d9fced74b0d42428ab5c3f9524a7b4eb4178ccbb29b0c731ca82e901bc92df37c55537cae959e295fe0b2971c"
    );
  });
  it("should sign a document with a wallet", async () => {
    const wallet = Wallet.fromMnemonic(
      "tourist quality multiply denial diary height funny calm disease buddy speed gold"
    );
    const { proof } = await signDocument(
      wrappedDocumentV4,
      SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
      wallet
    );
    expect(Object.keys(proof).length).toBe(9);
    expect(proof.key).toBe("did:ethr:0x906FB815De8976b1e38D9a4C1014a3acE16Ce53C#controller");
    expect(proof.signature).toBe(
      "0x60d7f8799607b7d3fb99ec5ca1cf7cfb996895fcadc34e165bb9496bd00896951f95d9006c717c2552a22c42a90543e9ebdcf96f520fc1412d3bcf3c0b34e03d1b"
    );
  });

  it("should throw error if a document was previously signed", async () => {
    const signedDocument = await signDocument(
      wrappedDocumentV4,
      SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
      {
        public: "did:ethr:0xb6De3744E1259e1aB692f5a277f053B79429c5a2#controller",
        private: "0x812269266b34d2919f737daf22db95f02642f8cdc0ca673bf3f701599f4971f5",
      }
    );

    await expect(
      signDocument(signedDocument, SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018, {
        public: "did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89#controller",
        private: "0x497c85ed89f1874ba37532d1e33519aba15bd533cdcb90774cc497bfe3cde655",
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Document has been signed"`);
  });

  it("should throw error if a key or signer is invalid", async () => {
    await expect(
      // @ts-expect-error invalid call
      signDocument(wrappedDocumentV4, SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018, {})
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Either a keypair or ethers.js Signer must be provided"`);
  });
});
