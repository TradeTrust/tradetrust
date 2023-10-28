import { signDocument, TTv4 as v4 } from "../../../index";
import { SUPPORTED_SIGNING_ALGORITHM } from "../../../shared/@types/sign";
import sample from "../../../../test/fixtures/v4/tt/did-wrapped2.json";
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
      "0x0830cbd0a56ffea5d94f56ce3aabb9ec4de9996bad1d35f63ca4795d09fb46807d532bc730578611750092a92621f0f0a89f78dcf2f33bc06361a80b417395641c"
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
      "0x3f1b55c7a822ea7bdbfb739eb818fa91e4086dc60b616dec32fd0d32b584beed504531d93e36c808941ed04c7a2c3f252795671fd8201b27fea51c2f8ea9c2f91b"
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
