import { cloneDeep } from "lodash";
import { digestCredential } from "../digest";
import { WrappedDocument } from "../../../4.0/tt/types";
import { obfuscateVerifiableCredential } from "../obfuscate";
import { decodeSalt } from "../salt";
import sample from "../../../../test/fixtures/v4/tt/did-idvc-wrapped.json";

const verifiableCredential = sample as WrappedDocument;
// Digest will change whenever sample document is regenerated
const credentialRoot = "84edabc618b2a5a7bad7eee9b58c287e9a39959d231eef3ab9270bd99922e54c";

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
          "64f21c91615d91a7430eb834b33b409259625f33a2e3891c7f6976cc5be6ee9e",
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
          "0c5c136c958df65ca70ea7c8a8fa2dc076bbb24d9d040e92a4c434a3d399e13b",
          "3f303d3023c4f9fdaff8a930a76d7eaa9379cdb91c0a139dbcc33809da24499c",
          "60dcf42761bbad28607ebee19657335c79539ebb49e905edffb69c743d878848",
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
          "334773dd035f824f9f6d6c990a9352c86ca0212f1e6ab1b6830408940243633b",
          "73766305cdd739bbb42392cb12c6caaa8aab04a49b1ca3fa72e635a0fd965054",
          "cea40f9d495354864581b58704407bb86ea2a800ddcee4119bb6f6b464b1d08d",
          "37c7347e8fbea3ddaa9b013cba3b4d168dbb5fa0eb655f93948c375b65ab0ed6",
          "019361c659697addc497621f6b5379e8e25a05526d41f6b132e3327ccffcd28f",
          "64f21c91615d91a7430eb834b33b409259625f33a2e3891c7f6976cc5be6ee9e",
          "aed3887fb97eb2eda746589f940fcb26c7d8f838a5c8d38e717e83d070e8a9e2",
          "aee7ef0d7cb1de180a885c4321511c60ffd0d12a7ac34755e8ed43ecafc44494",
          "16ce1de2cb512f8b0e759e1c63de8e9108cfeec33be6125eb047d55d1a1a3b97",
          "e2605099b77afbf81b696a32288bddd5bc2aee7a7cd50456ca52adb8d94e38cf",
          "51842bb2f40dbd01aa58f0382789db9c3c25910651362350817a5d6a02643467",
          "f704cceab35a1cca3b33731545cb70f7c9915036c4887f82eb1e3e84f839ab9d",
          "861108158a9bb6649ca027369cd9f5b8fc04d99401f7b03383ac741eb823cf39",
          "537d2e7d9bbbadaf5ded31b02da3b8e5f4c80684005ea8e5774cd674fbf3980f",
          "b7f784b55c2e0b88bad3a8ae7844486eca1f757b6e3abd21d7ea2f677b546fe1",
          "cd47120779cb2c36fa75125084dccf59b9b019db15698cd190eb8a622e0fa72e",
          "44b01dfc0da17a24f22baeaeaf311bf08576b493ab20d5417996f40ca559027e",
          "8ce101f5bbb344f5d0d369c879e84f7a0df2accd7b37b6440636c2077190ad68",
          "6d003e734c84fc5c1742a54a37c816bffddec958b7de17a9608c57b9684d6595",
          "06175801c35d7cfc2e5bfb4dc491efeeff6830259df4c5ebdc29a02c77dae1dc",
          "806b2cc2ff30b4f536d3e58f3d39a0716bdc1a58920759be63c7ff8d6614293e",
          "ac1984071ec67e3ea61a39539d5639860d9061475a180b1a34d291143d9e17da",
          "4e840ded70d9087c8cb14ec7cf36f794399b7b3b0f58f4cff5d603f795a10026",
          "0a29a1423813d456c2992d50ae1f768ea64b8919fcbd9c0f2070ca8f1dc5282c",
          "6a7e73a39abcde6a61f801a44080bd008dab25eaecefd013b5638e311557afe9",
          "c1fbf60a25017ee08db4d9e3fb1a35de1ed07ce31123a9d16d4f386948beb00a",
          "3c71562f88dd131f8f2e87744bdd8b5dafaedc72bb5a1334f08ccc12fd1eac2a",
          "c1ce27fb0c124e6a48c57a461f01ae88cd9757f32a88b1cfd72ce1b16335d195",
          "271bad071400301f6a5d1b87bc57c621832fbc005ed376c0930e4e2fefb7e8a6",
          "19c62aa3091996e4ad8ff87327968d8c9732b0d52fae1d7957cdca066a8dae2a",
          "969a6b4fed64cc6bc03cb39e555471cbfd4c688aabd73408e1a75d10a45fe232",
          "e6f1c5fecea3fd20f19cd401e32c756a70b2515296c1a84cad1241ccfbb46d9a",
          "1f65a38f57c58bf97f17d1b39d1b3a5132a445e7d7a4c1382263bca4d7e2f6da",
          "27079c9b4d0da7bb296b76990077a5428a1da3acab23533e33f71044cd30e4ca",
          "0e264ed0ed64142ff89d1271b31c8af1089041cfe88dafd7edb8b180d61f3fac",
          "473c14d6b5003ae5b90338f1e2d1a96ad74abb303ea36a9b2d0997718d4bea3a",
          "e27fee4caab163c8c296cadfaa7de3d51b358c024fb841f9bba3f5fd2242120d",
          "453ef4ea13d029f93384f1fb435cca0bb98f6abced0d4714fc382b6f139b1bbd",
          "d53fe2271521650fa3f340d71585697a2132402fb67b1dc6bb4af600247698f9",
          "3f303d3023c4f9fdaff8a930a76d7eaa9379cdb91c0a139dbcc33809da24499c",
          "0c5c136c958df65ca70ea7c8a8fa2dc076bbb24d9d040e92a4c434a3d399e13b",
          "9b349234d4048af5f4bfa7b49a8f538b5a871897bafe6cd5d12b892d9a8fe047",
          "02c501a51a5b98ffb40c0cc49ed028830a4e51ba7ac64b069abf2504b4036a5f",
          "7deecd85f4987312f1694ee04596f1925db14f24b9ef1a49d80d9b53e9a3004d",
          "60dcf42761bbad28607ebee19657335c79539ebb49e905edffb69c743d878848",
          "73c597d557aefe29d90e91ed173786447ca8a844a48ab9e6b7754011b9dc3d11",
          "042d21eda4189c66e217843fdaa05fbeac71ca18dc8bd756c40240020b588f04",
          "f274edd3f04bfbfd1ee20ea3ba7f2a77e53295647163c1484b77e490df536fb0",
          "119e94cf3b6880f62a17e0a4deb4a532b8af37a9432865abc316c4b348c55970",
          "d7e9d77fc4549ab28029673b2b627856036d460afe08cb0a42e399e276e6aad6",
          "83a3300c5ed08e9be72f8b57d0f91b093abf86280d28cacf6418d62d35c82966",
          "88b36e1a32740562ef9a5014087c4c12d9e3a2b3149fa916f6da51c720e6ac5e",
          "13f5f1932d2e163ea88f610cf19184eaca0dbe9516fbb267f33f23382ebcd9b7",
          "b337d898307b99a8b4594994de2a083d694c7609346103e5f320d77e92db6839",
          "da9567df9b5533f5dcac74396ee921869a670d23b3216ad3360a09c0afd34391",
          "420389026e9af30df94163660c52b601b2b83be2f6c1220b5eafd8a557755edd",
          "00caf617c53702c65a2c86544976a65775bc28d4bc4b42d6e8b988b9093d23dc",
          "d8c7fe69cbd871ef8de6d22a3f85fe1c173abd1b5421d12574d03c9c3af86523",
          "3a33a800cfba77e683853342964eb974c5a94f37426c5adf815595dd4f235dcd",
          "0e5437bd41ec3a59361e3933d4c3447ac052fed32cdc5e745a233f910527fad4",
          "b8f3b26f2e8ed9a04c480fd02ec1c7e51857923ce6b18beb4421b70f87cfefd5",
          "33b614be854ae6aa03694b4ba0a947da6a3c639be225cf0820c5f9fae241b92c",
          "541f832d5844d6a69854abca2acf0bef5801a9106b586bd477c861647bdff993",
          "83c4c43c35313cbc7121dc832a33ed1215f3cd38277a2c556e2698fc5e58c00b",
          "5ecc72d784dfb60394e7c94b28afbb799f541a3fe3931b7b7bdb310204fd18af",
          "35848fabcd2d6d2bc0ba889b5d1d25f9ec8af8c1753c0ac93f84f15269e7970d",
          "47c2c8f5ec53afa14da2116874b2c67fd22608da54e5b7b50759c9778b4a15d1",
          "87100106b645b241ee223fbc27689540612057bf9e9a1013acab4e6422c70b52",
          "ac0ae1d4877c9399776466d34fa3d5ebe2e36535e303a458033e592641822399",
          "9ec16217b63485709169d817f4fac105170440daba9aa3448589813f17b0ea72",
          "52d56439e7047eaafee32002d0c16ac396a875fcbaa68503b85f8b456396933f",
          "545e3d045e169b6d9514c788c6760efee7bf39689a6b3808204a53b7bbb8ebca",
        ]
      `);
      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toHaveLength(72);
      expect(digest).toBe(credentialRoot);
    });
  });
});
