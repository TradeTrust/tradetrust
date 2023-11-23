import { cloneDeep } from "lodash";
import { digestCredential } from "../digest";
import { WrappedDocument } from "../../../4.0/tt/types";
import { obfuscateVerifiableCredential } from "../obfuscate";
import { decodeSalt } from "../salt";
import sample from "../../../../test/fixtures/v4/tt/did-idvc-wrapped.json";

const verifiableCredential = sample as WrappedDocument;
// Digest will change whenever sample document is regenerated
const credentialRoot = "3c5401c548ac5b663bca8207f5748edda676406236fe6ef7db0ccdf4e5c8838a";

const { proof, ...credential } = verifiableCredential;

describe("digest v4.0", () => {
  describe("digestCredential", () => {
    test("digests a document with all visible content correctly", () => {
      const clonedCredential = cloneDeep(credential);

      const digest = digestCredential(clonedCredential, decodeSalt(proof.salts), []);
      expect(digest).toBe(credentialRoot);
    });
    test("digests a document when one single element is obfuscated", () => {
      const obfuscatedVerifiableCredential = obfuscateVerifiableCredential(verifiableCredential, "issuer.id");
      const digest = digestCredential(
        obfuscatedVerifiableCredential,
        decodeSalt(obfuscatedVerifiableCredential.proof.salts),
        obfuscatedVerifiableCredential.proof.privacy.obfuscated
      );

      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toMatchInlineSnapshot(`
        [
          "ccd6e53f84965dedba3964d55f2a7b545649ec0ceb14844ad202efcab8888fc9",
        ]
      `);
      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toHaveLength(1);
      expect(digest).toBe(credentialRoot);
    });
    test("digests a document when multiple element are obfuscated", () => {
      const obfuscatedVerifiableCredential = obfuscateVerifiableCredential(verifiableCredential, [
        "credentialSubject.id",
        "credentialSubject.name",
        "credentialSubject.billFrom.name",
      ]);
      const digest = digestCredential(
        obfuscatedVerifiableCredential,
        decodeSalt(obfuscatedVerifiableCredential.proof.salts),
        obfuscatedVerifiableCredential.proof.privacy.obfuscated
      );

      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toMatchInlineSnapshot(`
        [
          "407ea767b3a016d40f5490d04fb67f30e2017ea1c0f1ab28d7ea47af1800fd21",
          "fbf4407034c89a628d748bf65fce9f43673e035623165274396f23b46bd467df",
          "37c02ebc0a5ef682bd6fb68eafc1b7e5ca01bcdd09f11bb27ee07b6ad59dba53",
        ]
      `);
      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toHaveLength(3);
      expect(digest).toBe(credentialRoot);
    });
    test("digests a document with no visible content correctly", () => {
      const obfuscatedVerifiableCredential = obfuscateVerifiableCredential(
        verifiableCredential,
        Object.keys(verifiableCredential).filter((k) => k != "proof")
      );
      const digest = digestCredential(
        obfuscatedVerifiableCredential,
        decodeSalt(obfuscatedVerifiableCredential.proof.salts),
        obfuscatedVerifiableCredential.proof.privacy.obfuscated
      );

      expect(obfuscatedVerifiableCredential).toStrictEqual({ proof: obfuscatedVerifiableCredential.proof });
      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toMatchInlineSnapshot(`
        [
          "01b241a77e8d64fa21e8d11080a09b4d4769cea9af63bd8ba925218c5ef6c996",
          "e689aa11059d8f153e9142b7c1c619758328d8786085877b792333f9cfcbf48a",
          "7abf8a81c089d0f8af4319aa712fba6cb727619901c9624cfdd201c6fb8e5baf",
          "6bb8f118a773a549e69eb65ec98fd88a6fa7071c2ccbf2e0c0b284cc149cd2eb",
          "13efb7d247d9d63299cf9cd448e90cf8a9be01265fedaeb04224787ca9de6fca",
          "ccd6e53f84965dedba3964d55f2a7b545649ec0ceb14844ad202efcab8888fc9",
          "a768b82c5e71fbfd5ef303592b2a9aa7db4dae18e14fbabbc6e301cff6b85ba7",
          "62f031e82b590eae27e9cc2365e93b918297bf2a33df88aae7f12a7d8899021a",
          "d9b82865e7cbb81f561683a455c701ef8d430d45dfa86ccab7cd5c83652ed126",
          "5ccae3f3ed11e63e1358377e26cc9ca139024355060e5e72bb21cd14a91425ec",
          "65158e2ad7584862c63d60d8916deff6fec7d8e24b338eff4faeb130835ba428",
          "0605dc6b65966519af70bd229cc74dcfcb0349af5742c7b5e4d61f4cfec7ca2c",
          "47d091103bfd12c97c502d7fb0ef5241afe75455ecb858f40287cd03bdbb8ae1",
          "8a9af3e64c9d889498dfb10a26373968cd254c9d0b16bbf1746739fc4c8bd572",
          "8a201f7b6f1b95a00a388adc871a0318d799474a4751c8ae00cbe98882f532fd",
          "0274f3734cab3946515531e51b68d5b9c10bdd3c76dd1d19f550d60595f97b1b",
          "08cb7fdd24c0d88503e13e8e3a5862630d266da475dd21f850f17c1fe428b9c5",
          "9c7c1b03f078892dc4025452a37e1e9e7dd9a9fc714e04c376693fda4c87923b",
          "d130bd07ba386c01a7dd9463e9787c8a6a2bfb026d0a208be34c133b9025088f",
          "6aa3d3c976afde8fe4060943c4d674892844d1120569cc64aae55fa874fdd3d3",
          "d4d4ad7c36935f8230271183f8eb991c2dd17829fb6c236b53b214aaffad69b6",
          "0ef8adf01b8f6379683e3cffbbc038bd3a0e5a73fd779e7f6ba8597ba711feb7",
          "ef704f6f3e3406094b6d5f01c63faff7f1fb73d4579a30e4d9d1c06817afaf84",
          "2ca6cfd413f189556ac05b1befaf3b1b9ea5c71eb910db3138a4ff51cdaab869",
          "88c83462b4a52f1abf47fd658c10172dd9a7c7699743cd5293bce92adc674ff7",
          "b3531f772b9e732a574a3dfecf38353ce84785e92b55b1fbc63a61b9325fe054",
          "dfd95cd35943ac75aec028892d888b56d754f3db6840b9bb37d3437cdccf2620",
          "cf8b463fa2783dad3e2c3d2d017919133c35661d9268b670ce440eb7b8623b09",
          "376ecdbb4f1d0c11de8bcc2b588ef01bd5b90728eba542388a62cc71090f06f8",
          "d0404579904cf306d675a37dbbf03e53359a32f781f1418c653afd58ad9df19d",
          "818dd20f8540ac7d8bdfe77ed7e4d636b6dc72f87d71c2e811ab9b7a1232e3ee",
          "e8820132c6964c6e63c84cc189e643bd58ae9709279329e2d3092810dee854bd",
          "a02025a49403c6a41bf7bf65fcbb4ac82fed659e5963dabf811540eaf957094c",
          "b518d3d75ad357bd6d796140c75b2a613c95b841ba28fdd0b07c9c3e71653653",
          "ccaedda2d66a3616d11f1e5f6cffd66b57c56172d215c30190f2cb31963a8483",
          "0a5d68b40ed12153c165d634b0ed7d93de024bd027c823f2088434dce76fa543",
          "8fb1ec40ae1f71f4c0854756b3661e5a80e0a0ffead1e785d18791e232717811",
          "145ce1757428a794b3d44bc9ab8fda6d39834b0dc94aced4f42595785ffda8ef",
          "bdf9e08044baeff839cb2a9d0e494189d73171cd611f87e08ccdf2929e312566",
          "fbf4407034c89a628d748bf65fce9f43673e035623165274396f23b46bd467df",
          "407ea767b3a016d40f5490d04fb67f30e2017ea1c0f1ab28d7ea47af1800fd21",
          "e71772ae3415f684e6808c24bd6cf8060d78c1cbfa05c66ef9f55ac617bd6394",
          "1d4b19efb602e1342d7af32593bfc356305cb78d1f85c959c21e08fddaa4477e",
          "7b21d61a58ea22397666e2f21035f3022bf200bf37b239f4848df03ea80df286",
          "37c02ebc0a5ef682bd6fb68eafc1b7e5ca01bcdd09f11bb27ee07b6ad59dba53",
          "137e00bdd1056657ba1c91d93f8ec3309c3d0aba39a5f1e6cbf25f8f7b97f0d7",
          "0d575af675f6707e0ac52de82fc4e9097dbcb8b0da74b96bd64366cc0e19ae04",
          "debadc7dcc6bf5205499683ae93407b5c4511e28fb45f92204f919517e538d30",
          "be876a9f158b42692f0b8ff0ff6f6ac222d4c90ca7743df546b19ee6ed5d595d",
          "64d925e872859a660bdf85617960517623e4cbcfd52a7a152b9e271a9ce58e37",
          "ba556ca56190ebceda605c1b9e7c5a5596c9487ed515205ed2c1858f4fc01477",
          "76970a79034e656a69e625f8aebe8da51c7ecb367b755e7a8411ec4aeb187944",
          "c012b98abcda313da1a656eb36950d12af5bcc3e30b4d70a0c3f60b8477d0deb",
          "a9ae37a1f5b66112a04eef78d0e2942d0a2f7291f90a0b03fdcfff015efb00c0",
          "2cc4864f0858e26d44dbc382e508c197b07190f292d11143bdb58e8c3bea0fc7",
          "45a0b30ad3d88c4df852864c0b3fc84a42c19ba4d7625d8dc1ec357507f8fa98",
          "6a55f54dcb11e404902eb910b6af41d7000b856aaebbb0d5826161c5b2e50b89",
          "a6fe39d9f77f913f20b16e272aad77597b927bc49fac32280f673987224fc3f1",
          "28cdb956087b471e5ecb81b651832eab411cd917a193ddfb7a0fe651e7f1826d",
          "0579c939f469cfd1a2b25e2019b0a2a514faf63332c20665ceb38c533d802dab",
          "b11cb5642d8364683aa17afad48657c31084052988d3de24ffffcd622bc0bdf8",
          "04d7e011efdb33f19f6a476fd9e83bb8468424c3159d33427cbbc5bd5ef5b06c",
          "6c001eb9f2fdc253e4b55aeedd9a810ae6b739a9376b73cc619e2254c07ae2c4",
          "a8b3ed0b6c8cc46889d91e67c7cd96b93edf2ea0d0c09920d88fb5999a57aa6f",
          "01b391e21e4902e612c00db6093259a830a370fba80fc104e9a81010500a145d",
          "d74acc63a80eef43615ca4ad929e100fb485e8dbd8eae35915a1199f6d25f2ec",
          "ace3862122ecc0c63877c5edb08069c18329c7a3f17d62c73777fcd103c8dd8a",
          "605e631bb6cf231e1b4c102122474e938635901c140d4316bed5cbe645c2397e",
          "fde95f45e21502aa448d6403d2bd1e59aa4b36fb5df9c258b34b3c4f4fed0b29",
          "971a86d20d5cad959bad8f451473dfbc2e8defa3d1f90a8257cc8e66e3ad7a30",
          "923dc13cf7678a75a5fd0962ea251b5eacdc8e70d9a9564d7765a281e8fb6189",
          "159443533846c804415767becca240ce6c4df147f6fb826b096a0689aae64600",
        ]
      `);
      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toHaveLength(72);
      expect(digest).toBe(credentialRoot);
    });
  });
});
