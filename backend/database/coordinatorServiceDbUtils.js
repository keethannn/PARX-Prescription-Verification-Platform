import { COLLECTIONS } from "../constants.js";
import { patientPatchSchema, patientSearchSchema } from "../schemas.js";
import { PatientInfo } from "../types/adminServiceTypes.js";
import { getDb } from "./dbConnection.js";
import paginate from "./pagination.js";
import { objWithFields } from "./utils/dbUtils.js";

/**
 * Get a page from all patients
 * @param {Number} page the page number
 * @param {Number} pageSize size of the page
 * @param {Object} search search parameters
 * @returns {PatientInfo[]} an array of the patients
 */
export async function getPaginatedPatient(page, pageSize, search) {
    const searchObj = await objWithFields(search, patientSearchSchema);
    const collection = getDb().collection(COLLECTIONS.PATIENT);
    const data = await paginate(collection.find(searchObj), page, pageSize).toArray();
    return data.map(x => fillPatient(x));
}

function fillPatient(x) {
    return new PatientInfo(x.email, x.firstName, x.lastName, x.language, x.city, x.province, x.address);
}

/**
 * Patch a single patient with patches
 * @param {string} email email of the patient
 * @param {Object} patches fields to patch
 * @returns {boolean} true if successful, else false
 */
export async function patchSinglePatient(email, patches) {
    const patchObj = await objWithFields(patches, patientPatchSchema);
    const collection = getDb().collection(COLLECTIONS.PATIENT);
    const data = await collection.updateOne({ email: email }, { $set: patchObj });

    return data.matchedCount === 1;
}