import { COLLECTIONS } from "../constants.js"
import { PrescriberInfo } from "../types/adminServiceTypes.js";
import { getDb } from "./dbConnection.js";
import paginate from "./pagination.js";
import { objWithFields } from "./utils/dbUtils.js";
import { prescriberSearchSchema, prescriberPatchSchema } from "../schemas.js";

/**
 * Get a page from all prescribers 
 * @param {Number} page the page number
 * @param {Number} pageSize size of the page
 * @param {Object} search search parameters
 * @returns {PrescriberInfo[]} an array of the prescribers
 */
export async function getPaginatedPrescriber(page, pageSize, search) {
    const searchObj = await objWithFields(search, prescriberSearchSchema);
    const collection = getDb().collection(COLLECTIONS.PRESCRIBER);
    const data = await paginate(collection.find(searchObj), page, pageSize).toArray();
    return data.map(x => fillPrescriber(x));
}

function fillPrescriber(x) {
    return new PrescriberInfo(x.email, x.firstName, x.lastName,
        x.language, x.city, x.province,
        x.address, x.profession, x.providerCode,
        x.licensingCollege, x.licenceNumber, x.registered);
}

/**
 * Patch a single prescriber with patches
 * @param {string} providerCode provider code of the prescriber
 * @param {Object} patches fields to patch
 * @returns {boolean} true if successful, else false
 */
export async function patchSinglePrescriber(providerCode, patches) {
    const patchObj = await objWithFields(patches, prescriberPatchSchema);
    const collection = getDb().collection(COLLECTIONS.PRESCRIBER);
    const data = await collection.updateOne({ providerCode: providerCode }, { $set: patchObj });

    return data.matchedCount === 1;
}