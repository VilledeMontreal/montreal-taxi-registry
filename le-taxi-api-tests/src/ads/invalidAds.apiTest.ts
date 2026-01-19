// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { shouldThrow } from "@villedemontreal/concurrent-api-tests";
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../shared/commonTests/UserRole";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import { postAds } from "./ads.apiClient";
import { copyAdsOwnerTemplate, copyAdsPermitTemplate } from "./adsDto.template";

export async function invalidAdsTests(): Promise<void> {
  testCreateAdsUserAccessInvalid(UserRole.Motor);
  testCreateAdsUserAccessInvalid(UserRole.Inspector);
  testCreateAdsUserAccessInvalid(UserRole.Manager);
  testCreateAdsUserAccessInvalid(UserRole.Stats);
  testCreateAdsUserAccessInvalid(UserRole.Prefecture);

  it("Should be an error 400 Empty Array", async () => {
    const dtoCreate: any = [];
    await shouldThrow(
      () => postAds(dtoCreate),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          "The array should not be empty",
        );
      },
    );
  });

  it("Should return error when data length is more than one", async () => {
    const dtoCreate = copyAdsOwnerTemplate();
    const dto2 = copyAdsOwnerTemplate((x) => {
      x.data[0].owner_name = "Second Array";
    });
    dtoCreate.data.push(dto2.data[0]);
    await shouldThrow(
      () => postAds(dtoCreate),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          "The array reached its limit of 1 items",
        );
      },
    );
  });

  it("Should be error with wrong type_", async () => {
    const dtoCreate = copyAdsOwnerTemplate((x) => {
      x.data[0].owner_type = "cooperative";
    });
    await shouldThrow(
      () => postAds(dtoCreate),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          "owner_type must be a valid enum value",
        );
      },
    );
  });

  it('Should be error with missing vignette in a "permit semantic"', async () => {
    const dtoCreate = copyAdsPermitTemplate((x) => {
      delete x.data[0].vdm_vignette;
    });
    await shouldThrow(
      () => postAds(dtoCreate),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, "vdm_vignette");
      },
    );
  });

  it("Should be error with missing properties", async () => {
    const dtoCreate = copyAdsPermitTemplate((x) => {
      delete x.data[0].insee;
      delete x.data[0].numero;
    });
    await shouldThrow(
      () => postAds(dtoCreate),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          "The object failed the validation",
        );
        assert.strictEqual(err.response.body.error.details.length, 2);
        assert.include(
          err.response.body.error.details[0].message,
          "insee should not be null or undefined",
        );
        assert.include(
          err.response.body.error.details[1].message,
          "numero should not be null or undefined",
        );
      },
    );
  });

  it("Should be error with ZUPC parent not found", async () => {
    const dtoCreate = copyAdsOwnerTemplate((x) => {
      x.data[0].insee = "__INVALID_ZUPCPARENT__";
    });
    await shouldThrow(
      () => postAds(dtoCreate),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          "Unable to find a ZUPC parent for insee: __INVALID_ZUPCPARENT__",
        );
      },
    );
  });
}

function testCreateAdsUserAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to create an ADS `, async () => {
    const dtoCreate = copyAdsOwnerTemplate();
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () => postAds(dtoCreate, apiKey),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.strictEqual(
          err.response.body.error.message,
          "The user has a role which has insufficient permissions to access this resource.",
        );
      },
    );
  });
}
