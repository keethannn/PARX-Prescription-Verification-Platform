import { MongoClient, Db } from "mongodb";
import { COLLECTIONS, SERVER } from "../../constants.js"
import { genericPatient, genericPrescriber, coordinator, assistant } from "./sampleData.js"
import bcrypt from "bcryptjs"

const client = new MongoClient(SERVER.MONGO_URL);

/**
 * @type {Db}
 */
let db;

/**
 * Clear documents for all collections.
 * 
 * Implicitly creates the necessary collections if they
 * do not already exist.
 */
export const clearDB = async () => {
    await db.collection(COLLECTIONS.ADMINS).deleteMany({});
    await db.collection(COLLECTIONS.PATIENT).deleteMany({});
    await db.collection(COLLECTIONS.PRESCRIBER).deleteMany({});
    await db.collection(COLLECTIONS.PATIENT_PRESCRIPTIONS).deleteMany({});
    await db.collection(COLLECTIONS.PRESCRIBER_PRESCRIPTIONS).deleteMany({});
}

/**
 * Connect to the db.
 */
export const connect = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        db = client.db(SERVER.DB_NAME);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

/**
 * Close connection.
 */
export const closeConn = async () => {
    await client.close();
}

/**
 * Inserts the default coordinator and assistant into the admin collection.
 */
export const insertAdmins = async () => {
    await db.collection(COLLECTIONS.ADMINS).insertOne(await cryptPassword(coordinator));
    await db.collection(COLLECTIONS.ADMINS).insertOne(await cryptPassword(assistant));
}

/**
 * Inserts a patient to the db. If modifier is empty then inserts genericPatient.
 * Else, overwrites the specified fields in genericPatient with the values in 
 * modifier then inserts the modified patient.
 * 
 * Returns the patient that was inserted.
 * @param {Object} modifier optional object to overwrite values in genericPatient .
 * @returns {Object} the patient that was inserted.
 */
export const insertPatient = async (modifier = {}) => {
    let patient = await cryptPassword(objWithModifier(genericPatient, modifier));
    await db.collection(COLLECTIONS.PATIENT).insertOne(patient);
    return patient;
}

/**
 * Inserts a prescriber to the db. If modifier is empty then inserts genericPrescriber.
 * Else, overwrites the specified fields in genericPrescriber with the values in 
 * modifier then inserts the modified prescriber.
 * 
 * Returns the prescriber that was inserted.
 * @param {Object} modifier optional object to overwrite values in genericPrescriber .
 * @returns {Object} the prescriber that was inserted.
 */
export const insertPrescriber = async (modifier = {}) => {
    let prescriber = await cryptPassword(objWithModifier(genericPrescriber, modifier));
    await db.collection(COLLECTIONS.PRESCRIBER).insertOne(prescriber);
    return prescriber;
}

/**
 * Returns a clone of obj with the KVP's specified in opts
 * copied to obj.
 * @param {Object} obj the original object
 * @param {Object} modifier the modifier KVP's
 * @returns {Object}
 */
const objWithModifier = (obj, modifier) => {
    let clone = { ...obj };
    Object.keys(modifier).forEach(key => {
        clone[key] = modifier[key];
    });
    return clone;
}

/**
 * Return a clone of the given object with password field encrypted
 * @param {Object} obj 
 * @returns {Object}
 */
const cryptPassword = async (obj) => {
    let clone = { ...obj };
    clone.password = await bcrypt.hash(obj.password, 10);
    return clone;
}