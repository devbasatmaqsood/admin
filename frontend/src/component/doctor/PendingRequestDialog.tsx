import React, { useEffect, useState } from "react";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";

import { ExInput } from "@/extra/Input";
import Button from "@/extra/Button";
import { useSelector } from "react-redux";
import { doctorActionAccepted } from "@/store/doctorSlice";

const PendingRequestDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);




  const dispatch = useAppDispatch();
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [designation, setDesignation] = useState("");
  const [serviceName, setSerivceName] = useState("");
  const [degree, setDegree] = useState("");
  const [type, setType] = useState();
  const [yourSelf, setYourSelf] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [language, setLanguage] = useState("");
  const [charge, setCharge] = useState("");
  const [awards, setAwards] = useState("");
  const [expertise, setExpertise] = useState("");
  const [education, setEducation] = useState("");
  const [experienceDetails, setExperienceDetails] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [mongoId, setMongoId] = useState<any>();

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData);
      setAddress(dialogueData?.address);
      setAge(dialogueData?.age);
      setDob(dialogueData?.dob);
      setEmail(dialogueData?.email);
      setExperience(dialogueData?.experience);
      setGender(dialogueData?.gender);
      setMobile(dialogueData?.mobile);
      setDesignation(dialogueData?.designation);
      setDegree(dialogueData?.degree);
      setSerivceName(dialogueData?.Services?.map((value: any) => value.name));
      setYourSelf(dialogueData?.yourSelf);
      setType(dialogueData?.type);
      setName(dialogueData?.name);
      setCountry(dialogueData?.country);
      setCountryCode(dialogueData?.countryCode);
      setLanguage(dialogueData?.language?.map((language: any) => language));
      setCharge(dialogueData?.charge);
      setAwards(dialogueData?.awards?.map((awards: any) => awards));
      setExpertise(dialogueData?.expertise?.map((expertise: any) => expertise));
      setEducation(dialogueData?.education);
      setExperienceDetails(
        dialogueData?.experienceDetails?.map((item: any) => item)
      );
      setClinicName(dialogueData?.clinicName);
    }
  }, [dialogueData]);

  const handleSubmit = async () => {


    dispatch(doctorActionAccepted(dialogueData?._id));
    dispatch(closeDialog());
  };

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-md-4 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h4 className="text-theme m0">Doctor Details</h4>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => {
                      dispatch(closeDialog());
                    }}
                  >
                    <i className="ri-close-line"></i>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} id="expertForm">
                <div className="row align-items-start formBody">
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`name`}
                      name={`name`}
                      label={`Name`}
                      placeholder={`name`}
                      value={name}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`email`}
                      name={`email`}
                      label={`Email`}
                      placeholder={`email`}
                      value={email}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`mobile`}
                      name={`mobile`}
                      label={`Mobile Number`}
                      placeholder={`mobile`}
                      value={mobile}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`age`}
                      name={`age`}
                      label={`Age`}
                      placeholder={`age`}
                      value={age}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`dob`}
                      name={`dob`}
                      label={`Date of Birth`}
                      placeholder={`dob`}
                      value={dob}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`gender`}
                      name={`gender`}
                      label={`Gender`}
                      placeholder={`gender`}
                      value={gender}
                      disabled
                    />
                  </div>

                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`country`}
                      name={`country`}
                      label={`Country`}
                      placeholder={`country`}
                      value={country}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`countrycode`}
                      name={`countrycode`}
                      label={`Country Code`}
                      placeholder={`countrycode`}
                      value={countryCode}
                      disabled
                    />
                  </div>{" "}
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`designation`}
                      name={`designation`}
                      label={`Designation`}
                      placeholder={`designation`}
                      value={designation}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`experience`}
                      name={`experience`}
                      label={`Experience`}
                      placeholder={`experience`}
                      value={experience}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`degree`}
                      name={`degree`}
                      label={`Degree`}
                      placeholder={`degree`}
                      value={degree}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`language`}
                      name={`language`}
                      label={`Languages`}
                      placeholder={`languages`}
                      value={language}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`awards`}
                      name={`awards`}
                      label={`Awards`}
                      placeholder={`awards`}
                      value={awards}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`charge`}
                      name={`charge`}
                      label={`Charge (Fees)`}
                      placeholder={`charge`}
                      value={charge}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`servicename`}
                      name={`servicename`}
                      label={`Service`}
                      placeholder={`servicename`}
                      value={serviceName}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`yourself`}
                      name={`yourself`}
                      label={`About Yourself`}
                      placeholder={`yourself`}
                      value={yourSelf}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`expertise`}
                      name={`expertise`}
                      label={`Expertise`}
                      placeholder={`expertise`}
                      value={expertise}
                      disabled
                    />
                  </div>
                  {/* <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`education`}
                      name={`education`}
                      label={`Education`}
                      placeholder={`education`}
                      value={education}
                      disabled
                    />
                  </div> */}
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`experiencedetails`}
                      name={`experiencedetails`}
                      label={`Experience Details`}
                      placeholder={`experiencedetails`}
                      value={experienceDetails}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`clinicname`}
                      name={`clinicname`}
                      label={`Clinic Name`}
                      placeholder={`clinicname`}
                      value={clinicName}
                      disabled
                    />
                  </div>
                  {type == 1 ? (
                    <div className="col-6">
                      <ExInput
                        type={`text`}
                        id={`Type`}
                        name={`Type`}
                        label={`Type`}
                        placeholder={`Type`}
                        value={"Online"}
                        disabled
                      />
                    </div>
                  ) : type == 2 ? (
                    <div className="col-6">
                      <ExInput
                        type={`text`}
                        id={`Type`}
                        name={`Type`}
                        label={`Type`}
                        placeholder={`Type`}
                        value={"At Clinic"}
                        disabled
                      />
                    </div>
                  ) : (
                    <div className="col-6">
                      <ExInput
                        type={`text`}
                        id={`Type`}
                        name={`Type`}
                        label={`Type`}
                        placeholder={`BOTH`}
                        value={"Both"}
                        disabled
                      />
                    </div>
                  )}
                  <div className="col-6">
                    <ExInput
                      type={`text`}
                      id={`address`}
                      name={`address`}
                      label={`Address`}
                      placeholder={`address`}
                      value={address}
                      disabled
                    />
                  </div>
                </div>
                <div className="row  formFooter">
                  <div className="col-12 text-end m0">
                    <Button
                      type={`submit`}
                      className={` text-white m10-left`}
                      style={{ backgroundColor: "#1ebc1e" }}
                      text={`Submit`}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PendingRequestDialog;
