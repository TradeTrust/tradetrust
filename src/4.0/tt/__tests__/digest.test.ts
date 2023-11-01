import { cloneDeep } from "lodash";
import { digestCredential } from "../digest";
import { WrappedDocument } from "../../../4.0/tt/types";
import { obfuscateVerifiableCredential } from "../obfuscate";
import { decodeSalt } from "../salt";
import sample from "../../../../test/fixtures/v4/tt/did-idvc-wrapped.json";

const verifiableCredential = sample as WrappedDocument;
// Digest will change whenever sample document is regenerated
const credentialRoot = "841c8d1fb121bf7baab0b1677c91dc47cca6aa1e8ac772f38e96f8b4315d1150";

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
          "3ab265cb563c7eff24dfed07cff40ed3644d6591424f3f7d29803f66d33178a2",
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
          "b7c00bc647ad41c9d446b2ee40426c6a268694046dc790af4707cd91af2798a4",
          "c6f6daace5b15efe7049830cadb993566633ba6bb23d3980e644f69cce93e4a4",
          "5f9d1c1351d01055844dbfcf100f058a5c37ae051719f04837c328244d3ce95c",
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
          "008784adf2e69bb3ed0a9e89f65eb49c4c6aa1d68268f00a90af1097ffdc7a33",
          "54e9f5aebe7bd1da2abd287b7d312b9294279a2be6748cb6ceefd8ee9673d336",
          "6690718e61ebdadc3ee577551621ba13a3e5ac2d6df60e28534112d24ba5232e",
          "b45d353bb2ea820455f32d549e6860ee75837c393e70904a5cb9e195fe8f9514",
          "9f51119813540c17aec50c92552ab41ad869f1a1db6a4f4bf81686378566ab57",
          "3ab265cb563c7eff24dfed07cff40ed3644d6591424f3f7d29803f66d33178a2",
          "d62f42213ca3c04d725d2ecdddfc5c5a0455469baa2c2994f4347f9175f0412c",
          "782797f2d774e04e3d63f6c52cefa38ebbeb54469a67e4d400e98fc0801556e0",
          "85e42eec9de6d3dcb6beca7382e7078bac2919f569a8dcf1fd7a0430167d4575",
          "17d96ec9c1fe914fa0df4b81c11fad894247259c595a4c9083958a44a0291610",
          "de644fce7068a28c3f3904bc94d6a4a775c2cba92de94fd5cb1c7cc676dd8da2",
          "27a6724717fa9ae7f47c2b9aec500ed7b20f0afa090d99feed14a9049b30203e",
          "d8de3d7fe4c6091fb040dd9391c31d41b5f46b9a7074c613f64f2c50fd3b6b2b",
          "e9921b4150346670e6020b006a0345459d0cda9ef5bbedd3770771c41d63499b",
          "2cf5ceb32e849dcdbe95660513514fe32d0d2cf07f2ac1a876b42c16214de4a2",
          "8863970f284f79acfe04d6c1cbd43bb88ff5aba61112234385cd3f3d3be51753",
          "cbd4737e911620688d0d284f3b26b89fb4f63fccba915da727f19e0c28cdc7a7",
          "bd3258c6562a25d3b5a8954bf588095b908799e212610548b74bcd19fd93fb63",
          "45a3f1a678afb60a7d33629c9e8898070df8a05b20102290df2006588f31df0b",
          "89113ae2e91b8efadbccb48ca8933b074562ef96866f9d0029d0a5a1635836b9",
          "b486948597c9951497126a3ad65d52f1e6844fb7a373f6ad582d4930035f80c0",
          "13c24585d9ce52c383fea0d9733649b7d3ee828333646d9fb3acff834235b028",
          "ba851d11bc4457fa262d55254ba95e5d4e5a9da20b4926b6916fb8b3ef0ce65d",
          "c63efeacdb69d68e52f76d90f824eb77e305b2f8d9253226dea0176df7f9f089",
          "9d2f14e851c96609a6489ea257885bd8818d588621b35b323c8c570ce117617c",
          "69659291007ae3193926f1e3e618d131f9b1dbab1f3f940b318b1b83bce1d396",
          "37149b14aeebc0538951c4f88bb9a0e49b97622a929b0f37758825a912c3e3da",
          "60627af7fd93634f6f013db9c7837662e2839ab28c7ba41aec0df0e651bb4283",
          "7698e84c82091c9c7fdf5290d9b7983f70024684d5023d08d2a5d540e79adf81",
          "7115349d5983fd3d651e6a456daa3c9a98aa42582336f7f8820f770a445cbe81",
          "96ef912a326f4c14e7b12dace418ca82d46e0015a715a64de7633ab9927ba6de",
          "de46d656c6df85bb29a0460cf4628c2a98c7d486cb248f37e6b11556040c13ba",
          "b1ad8d4ab5ce02ceb12568bba516509942387856b3d2c07af6501c061cc87451",
          "927b70286fcfb95138391a57a25342ce5a53ae020bfea69bcecd78fc63152f71",
          "b2e175668027a6592ceeaef85f7e35d4f9162d068d7929bcac7426cbb9d37d29",
          "b3b5218e37927d0ac58bae71021a5ff0f654f433bd67eb6e595c046376b752c6",
          "cd943c3cb74ebeec414bd42d2a3770530c86f4ce7d0dbfe1fd2d1dc593aa280e",
          "b8116589d800ca209fd8a7ab40223d886730e071705bb8f1ab1d50ff0e42dca2",
          "426f50db4d81bd27b2887b520af69ea3eb591725e9ed1f01fb024d9ac3252366",
          "c6f6daace5b15efe7049830cadb993566633ba6bb23d3980e644f69cce93e4a4",
          "b7c00bc647ad41c9d446b2ee40426c6a268694046dc790af4707cd91af2798a4",
          "330adf8228b05b575ea01997eb2a73d7d4bb31dd3ce3a150650b641f3765227b",
          "9f0f6892058861ba3c4f1e4dfba5ac1db9cf4f9d25e7cbdd23567aa1e27f9410",
          "ac51bf94f175586db73bb08ae389fc700103d4d0977e5d258c211bb7733fb928",
          "5f9d1c1351d01055844dbfcf100f058a5c37ae051719f04837c328244d3ce95c",
          "9ead189203ae69b4af749d37ba179a3ae84f612c0fead6acd4946d035cd3c9d5",
          "2446000c3e110c3866ddf1cf7ec165a39b0cd102a225bdf4f717ea388b9de238",
          "0ea8a88b839f69e2ac31356255245ae4485eaa85a581a336c9546dae9eacd084",
          "89d3a60b0e89c3cf1c4e8c4810f32c6902a15f4444b3d94486bb53c8fed7001e",
          "627194fdf7e4a0a6712b3ada915651b4027e688ba8b120ce5ce9854a577948f4",
          "44cba34631f99ef080ebb494e1d09c7cc64ef838a270b5ae1fadf0812b05b376",
          "4a334c0e46e40c31821cb3a169c8fe0b1d09cefb5dad187073ce1d95930aac4f",
          "4ca0d4bf685bd4eb72bd45f1ca8ee86e1930fe44e3c2817816fa8f2e193236de",
          "73fac6dbc7814f2fca84405e6c33ff63e3df9dfb85b51e7a071cd908284070d8",
          "1a8be31aca5d7c5bf406d5cbb40ecdb704e8999187487ffd761b2d3da5609003",
          "1991589e4e8b8a6e8f97b0980448d019d25d0132a29d7178b42ce09b5a0f381e",
          "fd5ba936506111d45b006ce2d18ad09b9baebeacb844eeb6f97eb02f4a7ee582",
          "0dc9a50e30993dbb1c766cda68666ed143e12eeea2f102948e4efc9836465abe",
          "c057915151b17cb8434337e8154de954bf4dd12cb89bea4e3c420b52b1930531",
          "cdf7179659079d04fa0dfa5cbc00b22d3112daa3870b2a3e34b3814c51bb28f7",
          "1a1782cfcf768adca8c28bee50e726cf4b83854b66d6be264855dc17bbb4da32",
          "dfc7c4737b7020712bcdabde73941a2037cd2b64e7ddc0d62005f94107e6a7e2",
          "12fd3239cdfb73def93daccc9ed7d911b569e90f215c36d95f26f1ba9d28fafd",
          "0b8547d4a369fec0f16b6a7a06ff67c6ea084f256d7754b8b690d0f317ffbcd8",
          "2b03cac576abbc6d985c085085fe754eea8c69d2c789d25d1d55f5e1f706beb3",
          "cc09ef332daa6877fc8c41e4c302f8ffe9cd9612b6c281cfd0f19f035cf1fb24",
          "b231a30abd0f9996229aa8c327c472b9af3ad7ec2956d15fd076f6642ce63d12",
          "a9cb0bc40b1ffadfd46a59046c3f7f0622757faa4aff121b76e5c34339f7a534",
          "81fe2151515c6ae32232a17229e265bea62e814cc43d88182ac82472e031ab3a",
          "1ef3e0aa4e1d0c9e5261905ce7530b7de41dfb39f971af7093a606f1c042af8e",
          "cb59872d81a5d7078be868c1128ef0b8d0cb33ebe8312175661cc2c4f48225e0",
          "96b9df0fd0ba01d29ae88b7fb99459f8d2773fc5640286ce40d0fc8033a31125",
        ]
      `);
      expect(obfuscatedVerifiableCredential.proof.privacy.obfuscated).toHaveLength(72);
      expect(digest).toBe(credentialRoot);
    });
  });
});
