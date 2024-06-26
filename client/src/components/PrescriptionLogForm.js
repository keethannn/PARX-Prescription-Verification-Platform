import { useState } from "react";
import { useSelector } from "react-redux";
import {
    Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Checkbox,
} from "@material-tailwind/react";
import { prescriptionFields, prescriptionField2PrescriptionInfo } from "../apiServices/types/prescriptionTypes";
import { postPrescriberPrescription} from "../apiServices/prescriberService";
import { postPatientPrescription } from "../apiServices/patientService";
import { ClosableAlert } from "./ClosableAlert";
import { DatePicker } from "./DatePicker";
import { set } from "lodash";

/**
 * Opens a dialog to log a new prescription.
 * 
 * To be used for both pateints and prescribers.
 * 
 * 
 */
export const PrescriptionLogForm = () => {


    // Set up a mapping of relevant fields
    const fieldMapping = {};
    const [prscn_date, setPrscn_date] = useState(new Date());
    const [patientInit, setPatientInit] = useState("");
    const [checked, setChecked] = useState(false);
    const providerCode = useSelector(state => state.currentUser.auxInfo.providerCode);
    const userEmail = useSelector(state => state.currentUser.email);
    const userType = useSelector(state => state.currentUser.accountType);


    prescriptionFields.forEach(field => {
        if (prescriptionField2PrescriptionInfo[field] === "providerCode" && userType === "prescriber") {
            fieldMapping[field] = useState(providerCode);
        } else if (prescriptionField2PrescriptionInfo[field] === "prescribed") {
            fieldMapping[field] = useState(false);
        } 
         else {
            fieldMapping[field] = useState("");
        }
    })
    

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(!open);
    const [showAlertFailure, setShowFailure] = useState(false);
    const [showAlertSuccess, setShowSuccess] = useState(false);

    const buildPostObj = () => {
        let obj = {};
        prescriptionFields.forEach(field => {
            const [state] = fieldMapping[field];

            obj[prescriptionField2PrescriptionInfo[field]] = state;
            if (userType === "patient") {
                obj["email"] = userEmail;
            }
        })
        return obj;
        
    }

    const resetStates = () => {
        //need this otherwise it messes with the checkbox plus its nice to clear out fields anyway 
        prescriptionFields.forEach(field => {
            const [state, setState] = fieldMapping[field];
            if (prescriptionField2PrescriptionInfo[field] === "providerCode") {
                setState(providerCode);
            } else if (prescriptionField2PrescriptionInfo[field] === "prescribed") {
                setState(false);
            } else {
                setState("");
            }
        })
        setPrscn_date(new Date());
        setPatientInit("");
        setChecked(false);
    }

    const formatDate = (value) => {
        return value
        .replace(/[^0-9]/g, "")
        .replace(/^(\d{4})(\d{1})$/, "$1-$2")
        .replace(/^(\d{4})(\d{2})$/, "$1-$2")
        .replace(/^(\d{4})(\d{2})(\d{1})$/, "$1-$2-$3")
        .replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
    }


    const handleConfirmChanges = async () => {

        try {
            const [providerCodePa] = fieldMapping["Provider Code"];
            const res = await (userType === "patient" ? 
                postPatientPrescription(
                    providerCodePa, prscn_date, patientInit, checked,  
                    buildPostObj()
                ) : 
                postPrescriberPrescription(
                    providerCode, prscn_date, patientInit, checked, 
                    buildPostObj()
                )
            );
            res ? setShowSuccess(true) : setShowFailure(true);
        } catch (err) {
            setShowFailure(true);
        }
        resetStates();
        handleOpen();
    }


    return (
        <>
            <Button className="mt-6 bg-moss-green border-2 border-moss-green" onClick={handleOpen}>
                Create New Prescription
            </Button> 
            <Dialog open={open} handler={handleOpen}>
                <DialogHeader>Log New Prescription</DialogHeader>
                <DialogBody className="h-[24rem] overflow-scroll">


                    <div className="flex flex-col justify-between gap-8">
                        
                         {/* <DatePicker field={"Date"}/> */}
                        
                        {
                            prescriptionFields.map(field => {
                                let [state, setState] = fieldMapping[field];

                                if (prescriptionField2PrescriptionInfo[field] === "status") {
                                    return("");
                                } 
                     
                                if (prescriptionField2PrescriptionInfo[field] === "date") {
                                    const handleDate = (date) => {
                                        setState(date);
                                        setPrscn_date(date);
                                    }
                                    return (<Input label={field}
                                    maxLength={10}
                                    key={`field_edit_${field}`}
                                    size="md"
                                    value={formatDate(state)}
                                    placeholder="YYYY-MM-DD"
                                    onChange={el => handleDate(el.target.value)}/>);
                                }

                                if (prescriptionField2PrescriptionInfo[field] === "prescribed") {
                                    const handleCheckbox = () => {
                                        setChecked(!checked);
                                        setState(!state);
                                    }
                                    return (<Checkbox label={field}
                                        key={`field_edit_${field}`}
                                        size="md"
                                        value={state}
                                        onChange={handleCheckbox} />);
                                }

                                const handleInput = (value) => {
                                    if (field === "Patient Initials") {
                                        setPatientInit(value);
                                    } 
                                    setState(value);
                                }
                                
                                return (<Input label={field}
                                    key={`field_edit_${field}`}
                                    size="md"
                                    value={state}
                                    onChange={el => handleInput(el.target.value)} 
                                    disabled={prescriptionField2PrescriptionInfo[field] === "providerCode" && userType === "prescriber"}
                                    />);
                            })
                        }
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-1"
                    >
                        <span>Cancel</span>
                    </Button>
                    <Button variant="gradient" color="green" onClick={handleConfirmChanges}>
                        <span>Confirm Changes</span>
                    </Button>
                </DialogFooter>
            </Dialog>
            <div className="fixed flex flex-col items-center left-0 bottom-10 w-screen z-50">
                <ClosableAlert text="Failed to make changes. Please try again later." color="red" open={showAlertFailure} onDismiss={() => setShowFailure(false)} />
                <ClosableAlert text="Success! Refresh the list to see your changes." color="green" open={showAlertSuccess} onDismiss={() => setShowSuccess(false)} />
            </div>
        </>
    );

}