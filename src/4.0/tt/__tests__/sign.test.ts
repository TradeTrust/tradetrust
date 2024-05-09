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
      "0xc36147bf357c4703e283a2739e08a4eb2c31885a3c7d9ed8ee831bcb3e65397b02458522c020b5a6b5a0202123d893700174260cfd2a32027bb8c0c9261502ed1b"
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
      "0x32fce17287c04a5c78baecacbc9fa012b656dfdd03a08378c2d5099a73bff6da617f9b6f23d8f8ee7d2f306e7f6215ce333e8f5ad67dd70dbbc97fe252ecfa521c"
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
