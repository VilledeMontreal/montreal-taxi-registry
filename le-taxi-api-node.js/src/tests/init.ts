// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { waitForAppToStart } from "../index";

export let app = null;

before(async () => (app = await waitForAppToStart));
