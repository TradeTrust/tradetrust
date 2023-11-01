import {
  _unsafe_use_it_at_your_own_risk_v4_alpha_tt_wrapDocument as TTwrapDocumentV4,
  _unsafe_use_it_at_your_own_risk_v4_alpha_oa_wrapDocument as OAwrapDocumentV4,
  signDocument,
  utils,
} from "../src/index";
import { SUPPORTED_SIGNING_ALGORITHM } from "../src/shared/@types/sign";
import fs from "fs";
import path from "path";

// DONT run the generation unnecessarily, you will break
// tests that looks at the signature/digest since the salts
// are randomly generated.

export const readFile = (url: string) => {
  return JSON.parse(fs.readFileSync(`${url}`, "utf-8"));
};
interface IRun {
  location: string;
  keys?: [string, string];
}
const run = async ({ location, keys }: IRun) => {
  let resolved = path.resolve(location);
  let name = path.basename(resolved);
  let dirName = path.dirname(resolved);
  let document = readFile(resolved);
  if (utils.isRawOAV4Document(document)) {
    let wrapName = name.replace("raw", "wrapped");
    let wrapped = await OAwrapDocumentV4(document);
    fs.writeFileSync(`${dirName}/${wrapName}`, JSON.stringify(wrapped, null, 2));
    let signName = wrapName.replace("wrapped", "signed");
    let signed = await signDocument(wrapped, SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018, {
      public: "did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89#controller",
      private: "0x497c85ed89f1874ba37532d1e33519aba15bd533cdcb90774cc497bfe3cde655",
    });
    fs.writeFileSync(`${dirName}/${signName}`, JSON.stringify(signed, null, 2));
  } else if (utils.isRawTTV4Document(document)) {
    let wrapName = name.replace("raw", "wrapped");
    let wrapped = await TTwrapDocumentV4(document);
    fs.writeFileSync(`${dirName}/${wrapName}`, JSON.stringify(wrapped, null, 2));
    let pub, pte;
    if (keys) {
      [pub, pte] = keys;
    } else {
      pub = "0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89";
      pte = "0x497c85ed89f1874ba37532d1e33519aba15bd533cdcb90774cc497bfe3cde655";
    }
    let signName = wrapName.replace("wrapped", "wrapped-signed");
    // rmb to replace the signing keys before committing!!!
    let signed = await signDocument(wrapped, SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018, {
      public: `did:ethr:${pub}#controller`,
      private: `${pte}`,
    });
    fs.writeFileSync(`${dirName}/${signName}`, JSON.stringify(signed, null, 2));
  }
};

async function main() {
  let paths = [
    "./test/fixtures/v4/tt/did-idvc-raw.json",
    "./test/fixtures/v4/tt/did-idvc-raw-idvc-revoked.json",
    "./test/fixtures/v4/tt/did-idvc-raw-tampered-signature.json",
    "./test/fixtures/v4/tt/did-idvc-raw-wrong-binding.json",
    "./test/fixtures/v4/tt/did-raw.json",
    "./test/fixtures/v4/tt/did-raw2.json",
  ];

  await paths.forEach((path) => {
    if (path === "./test/fixtures/v4/tt/did-raw2.json") {
      run({
        location: path,
        keys: [
          "0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89",
          "0x497c85ed89f1874ba37532d1e33519aba15bd533cdcb90774cc497bfe3cde655",
        ],
      });
    } else {
      run({ location: path });
    }
  });
}

main()