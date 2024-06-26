class ClientUserInfo {
    constructor(email, firstName, lastName, language, city, province, address) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.language = language;
        this.city = city;
        this.province = province;
        this.address = address;
    }
}

/**
 * Currently unused. Used to implement coordinator (shouldn't be used by assistant) patient stuff later.
 */
export class PatientInfo extends ClientUserInfo {
    constructor(email, firstName, lastName, language, city, province, address) {
        super(email, firstName, lastName, language, city, province, address);
    }
}

/**
 * All necessary information for a single prescriber.
 */
export class PrescriberInfo extends ClientUserInfo {
    constructor(id, email, firstName, lastName, language, city, province, address, profession, providerCode, licensingCollege, licenceNumber, registered) {
        super(email, firstName, lastName, language, city, province, address);
        this.id = id;
        this.profession = profession;
        this.providerCode = providerCode;
        this.licensingCollege = licensingCollege;
        this.licenceNumber = licenceNumber;
        this.registered = registered;
    }
}