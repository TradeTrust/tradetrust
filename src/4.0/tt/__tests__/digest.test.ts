import { cloneDeep } from "lodash";
import { digestCredential } from "../digest";
import { WrappedDocument } from "../../../4.0/tt/types";
import { obfuscateVerifiableCredential } from "../obfuscate";
import { decodeSalt } from "../salt";
import sample from "../../../../test/fixtures/v4/tt/did-idvc-wrapped.json";

const verifiableCredential = sample as WrappedDocument;
// Digest will change whenever sample document is regenerated
const credentialRoot = "5743f73d71ac8150c264ee7229e9977de788a6f29f9bf86558a78971b05935ed";

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
        obfuscatedVerifiableCredential.proof.privacy.obfuscated,
      );

      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toMatchInlineSnapshot(`
        [
          "e28d6a653a8d345a80d0820a4ccf69b04a46ad58dac2b1d2a427cc89054ddf30",
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
        obfuscatedVerifiableCredential.proof.privacy.obfuscated,
      );

      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toMatchInlineSnapshot(`
        [
          "3f487757b23bd261c871e6a6cbefba5ec254bdd659a948bd3eae62ae48c3f771",
          "546f37921a67e43d205eb34f7f10767d09bf7e130f356087cef1a101e4dcb0e6",
          "648e4d882608308224c57b88c456ef0192c2e857446f598233f4d75433bd01c3",
        ]
      `);
      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toHaveLength(3);
      expect(digest).toBe(credentialRoot);
    });
    test("digests a document with no visible content correctly", () => {
      const obfuscatedVerifiableCredential = obfuscateVerifiableCredential(
        verifiableCredential,
        Object.keys(verifiableCredential).filter((k) => k != "proof"),
      );
      const digest = digestCredential(
        obfuscatedVerifiableCredential,
        decodeSalt(obfuscatedVerifiableCredential.proof.salts),
        obfuscatedVerifiableCredential.proof.privacy.obfuscated,
      );

      expect(obfuscatedVerifiableCredential).toStrictEqual({ proof: obfuscatedVerifiableCredential.proof });
      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toMatchInlineSnapshot(`
        [
          "9b1e25934334c5b18f11911b2898ece11e9bc90df7594935665a771d9dc5f9ae",
          "b5ed10a33d2151144c2045609406c2cca3f00b2bb2ead11d2fba4dcd3090975f",
          "9c65afa0be7b44c4550ea1146ae9a8ac9e454319384a089a24e97104ab0b3fe6",
          "ad83fc3dfa529776cfaaefb7d4a51fcdf776b88388a70615619c07f7738b4be7",
          "c233681803d3bd4bff85b6ebc29eb0423824de30e8d9b49daaf8f0b959c6cde6",
          "e28d6a653a8d345a80d0820a4ccf69b04a46ad58dac2b1d2a427cc89054ddf30",
          "1c0e62da542680e2f61c9ee40cc344964c617b03d55d3203710b97048f7da0ae",
          "57170f23d68b1a3bd1089148ba3483d388163db0fa4ed6ec79343816018d1130",
          "11e4e4f8018bf6416e3193e683b9d99214347c8dd8d83f74608a45516e562546",
          "c011d30cbd7f4d53e6a8f61063ebbeb48442f2f1da85d5ab2ac5ac00471defcc",
          "e2f4189eeb105d767561eb69dafc2219cbad25daf0e4a9e03219d976c949e6fc",
          "6a7f598ee73f2005ae7357917c282a5e52d77802bbf700819a1a8d57ca663963",
          "52f9a824c932b515e6d14b55352a709142e5d37ac8674fb520e33b4f7cc99d79",
          "fa7e5cef0280d496737a98b99fd8b524757b9a2bdba73ae59cdda9af1023d6b9",
          "af2e4c3511518651b5677e243dcaaab349ac332a7e5e2c198b1aadf70ed26575",
          "db944f211abb4423243951915247d85f8d9b6fcbfd72ad2bece94caa21274524",
          "544e2405a60234b57811499922836399f09555f58e8a940cf7a23bd177ef37e1",
          "50091fab74643e2a431c9aa14d25b21730aa7187f0bb9e00fdc36a5919d21244",
          "5d18855213f096edaa47cf424858b1d4336e9430733931248cae84ed21cec630",
          "dff94e8d14b5c5cd6995b917633f1803961ae63ae2d9fe45e34d0d5df31bd077",
          "bb886c0f3e1a9e3494316c3c00cba10c4760c2320af8f5614ace284dcd36af69",
          "3fd2770e03526e435db1743f2d676a80a38fd96843c4c3a90d371391e762fb7b",
          "fafe461afb8a59c5f5cd181364e2bf016be5b0e7b30b24a071fe777e2e765d60",
          "a815bb56c170a940689290da9529fc7bea6a1bcabf3b23f203bb7ede1f116da5",
          "57476d136cd733c722740c071bfdce6b4f6c3902af92ae95aef3c095341484b4",
          "88c1af4d5afcce0d210d644662a4d1fde040172ffa34e74b43e1a8766f31b1f0",
          "13db2258a175594c4e831c980278b42adb1b71cae5c6dbc9c0ef42b7299f5268",
          "fc096fb38dd6ac529da1ff19c32d06fc8484c668690dc8d8bf34cbb842f32138",
          "84dddea234d674fa38d72f8ee5decb5a5162ef29c14675506c58e7c92b569cde",
          "8a2266ca446417fe745924a74a46ea75ee6a8d0128fbdd6b825c49281ba985ec",
          "1ff00e41675401872b152014d799dddb9460d17ef3c44fd549751a315e3ff863",
          "bb742fd5b949c51439b3a2f5b0ec95f6250ce19b35bb3daccb09ad9da0031bcc",
          "52b74cb7dbc259799e1b290a135f439cfcb481d373e46acc0fdff6fdd0a7b6c6",
          "01b15a8b3d6477469fdda3079beb07eec246954e6447c58b29a88460dfa25eb4",
          "1640cde1d756287b8f00dbdf47cb107efddc7af18775ec8e3758c878555e473b",
          "5bb28ba91f3c1173d71a033a15c95eceb253dd1fe526aff857c682adae3d7405",
          "ac1a986012f1e06fe996ce663e5ae1f0536c7a0e8e5e72ae459fed50a501cc7c",
          "511aaafb3b4abb57dfdc2ca48aef3cd062d1e9405c155b1f08a21ce11fafc0a9",
          "30cb50a9de885c742280874d498491a482f48e68e345105d7add0ad68ceb54f8",
          "77fb6906f7b63cec2d04992acfdd5a4b1a5de118f3df3ee6353d9e2e192ed0c6",
          "7127ea317aac28f50373ee539b8885033499f4c1d708b970c59eed3089499bd4",
          "546f37921a67e43d205eb34f7f10767d09bf7e130f356087cef1a101e4dcb0e6",
          "3f487757b23bd261c871e6a6cbefba5ec254bdd659a948bd3eae62ae48c3f771",
          "33ae08e1d13018fe19e3f44aedc8f585f73c62584b549713c840c18a76b06f52",
          "8638892485889dedc05fd3f9a9652003caf762fa6c2ef79a530e35c26739d5db",
          "fc508a99c1ae28bd5975f913edbb47951268b629751ebd268da4a31fa235967f",
          "648e4d882608308224c57b88c456ef0192c2e857446f598233f4d75433bd01c3",
          "af7f852fdc89afef2522aaa34afdf58aa2b9af2ae8d49c3ea9abd271f63bd5b0",
          "a738eb0cba7b9987fa97d0ebd69db81758a73ba8b23f0b923c1b87a919ca1ac5",
          "dc0139383d423ae7bb1fb30598ee81decef75a4d415e1e8e1cd4e3d4bf77a010",
          "6aa082763e71fd34cc2c1bf86b522b495d69877c346c043966e23b365e8d4a63",
          "8d2e674144e0bbc9ab042db9d11eee536468db0a1a15a680d830a3ac91761140",
          "5460c6f5f4f5b6f488690cb16a7c94dfcc056eabc3e55ed34e0b6bc15e82a8cf",
          "9d67aa99fd9289d98d7afbb4a4ca285d4b7a117c6f9ca6469ea6d02d61d420cf",
          "e610f43d27db5acd6867ad3809ed53d43f4e307e7cefe3ddcceb64fcd194b8de",
          "d88990d0f6a9fb1ee995e4aed68afae66ca34e6c889eef6f145a6f30773ad8fb",
          "24ea9a67e4d0343502057f37e0151117f9be8c292d2934de9591ea683a8df38b",
          "25db81d1bd3a76b9ef7881a898209934b791d0abce794e36f64c54e84f11c765",
          "0e7345c5997cf853a00cf9b759a3623df547bf052121a650537922322e88e1b8",
          "b4c299e3b907a356b8481c72358a06c1e8f4cc7a69bfce46daaa9dabc3a8c870",
          "bfbb858735ee10a3b22f188f2664d5f3f1989ff1a2ee0f64ac8e8e9717af3205",
          "d29b71d33c35f64e2d57d576e1824516c8575fad6a36eaa263790c6c9afbe0f3",
          "b2bfebbfa20614e1689e563174f5ae5d9e6f1383a4923f8d7b628702ac93d1cc",
          "28cc29b79f3ee3ff989b09c0c5d1ed71bfe1cbc1bac3e2ef6c29c88d8c8d68ce",
          "907d9f0e072040df50c8928f2a092de958bc6b3ffb2e1ebeeb6f5bc8a8228eef",
          "24ace840b200fa5d744fa34e8fcd0de529538b22c79d3c855d87d46fe0ce8ed9",
          "3a8842c6a0efc333026209d24a87aec00bbcb01d68acf2bd6c012e9d794d3dc8",
          "ade732c1dca4226be96a2be9d0bda0a0662300a7a2ae0d95afb00a3ea3898ac3",
          "dd179ed9afbfa7775937166cd1316c604a398b1d0ac2e5419ca87d5984ea229a",
          "6a296c530862459181815984d39682c8822f39073e30f934bcfc8f4fdf011d9a",
          "32238f4138a653c67b359be8909cdd2439f9ec68acf6303f6aa65cb66130b1de",
          "c13822bd9c939646f6742ec45ff8b3319f3ebab3e7200a42cd65a0500a370533",
          "899c33fdc8438a59afcdc56649c0362ccf9f4eb41ad359290c456f3bb0f43fae",
          "388f6ba7e109e477edf59d7965ce38342dc0593239094a9efcc6e76e8601bde1",
        ]
      `);
      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toHaveLength(74);
      expect(digest).toBe(credentialRoot);
    });
  });
});
