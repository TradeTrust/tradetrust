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
      "0x0c54251d00ef6cb000fdc297f77fca410f023ec5f3549af9755180ce2823079a3bc12de9a6f0629a4112c13eceb26e01e31e23d5bed4a9e542e3ebfb253ab13c1c"
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
      "0xc19b434f043d33d12d36d9f2af996ae8aa9c08ea65db44652b1f0943749b42e9192289d26ba50326e5267a3e6dc8203364144c703243cb84d2c3c8beffe7954d1b"
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
