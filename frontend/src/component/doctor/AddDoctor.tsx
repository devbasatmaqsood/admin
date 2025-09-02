import Button from "@/extra/Button";
import { ExInput, Textarea } from "@/extra/Input";
import Title from "@/extra/Title";
import { RootStore, useAppDispatch } from "@/store/store";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { closeDialog } from "@/store/dialogSlice";
import { updateDoctor } from "@/store/doctorSlice";
import { getSetting } from '@/store/settingSlice';

interface ErrorState {
  name: string;
  email: string;
  address: string;
  country: string;
  password: string;
  mobile: string;
  dob: string;
  commission: string;

  images: string;
  gender: string;
  age: string;
  clinicName: string;
  charge: string;
  education: string;
  experienceDetails: string;
  experience: string;
  yourSelf: string;
  designation: string;
  language: string;
  awards: string;
  degree: string;
  image: string;
  upiId: string;
  bankName: string;
  accountNumber: string;
  IFSCCode: string;
  branchName: string;
}

const AddDoctor = () => {


  const { dialogueData } = useSelector((state: any) => state.dialogue);
  const { setting }: any = useSelector((state: RootStore) => state?.setting);

  const dispatch = useAppDispatch();

  const [name, setName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [mobile, setMobile] = useState<any>();
  const [gender, setGender] = useState<any>();
  const [age, setAge] = useState<any>();
  const [address, setAddress] = useState<string>();
  const [country, setCountry] = useState<string>();
  const [commission, setCommission] = useState<any>();
  const [charge, setCharge] = useState<any>();

  const [clinicName, setClinicName] = useState<string>();
  const [education, setEducation] = useState<string>();
  const [experienceDetails, setExperienceDetails] = useState<string>();
  const [experience, setExperience] = useState<any>();
  const [yourSelf, setYourSelf] = useState<string>();
  const [designation, setDesignation] = useState<string>();
  const [dob, setDob] = useState<string>();
  const [language, setLanguage] = useState<string>();
  const [awards, setAwards] = useState<string>();
  const [degree, setDegree] = useState<string>();
  const [image, setImage] = useState<any>();
  const [imagePath, setImagePath] = useState<any>();

  const [error, setError] = useState({
    name: "",
    email: "",
    address: "",
    country: "",
    mobile: "",
    commission: "",
    password: "",
    gender: "",
    age: "",
    clinicName: "",
    charge: "",
    education: "",
    experience: "",
    experienceDetails: "",
    yourSelf: "",
    designation: "",
    dob: "",
    language: "",
    awards: "",
    degree: "",
    image: "",
  });

  useEffect(() => {
    setName(dialogueData?.name);
    setEmail(dialogueData?.email);
    setPassword(dialogueData?.password);
    setMobile(dialogueData?.mobile);
    setGender(dialogueData?.gender);
    setAge(dialogueData?.age);
    setAddress(dialogueData?.address);
    setCountry(dialogueData?.country);
    setCommission(dialogueData?.commission);
    setCharge(dialogueData?.charge);
    setClinicName(dialogueData?.clinicName);
    setEducation(dialogueData?.education);
    setExperienceDetails(dialogueData?.experienceDetails);
    setExperience(dialogueData?.experience);
    setYourSelf(dialogueData?.yourSelf);
    setDesignation(dialogueData?.designation);
    setDob(dialogueData?.dob);
    setLanguage(dialogueData?.language);
    setAwards(dialogueData?.awards);
    setDegree(dialogueData?.degree);
    setImage(dialogueData?.image);
    setImagePath(dialogueData?.image);
  }, [dialogueData]);


  useEffect(() => {
      dispatch(getSetting())
  }, [])

  const handleInputImage = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      setImage(e?.target?.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setError({ ...error, image: "" });
    }
  };
  const handleSubmit = (e: any) => {
    if (
      !name ||
      !email ||
      !password ||
      !mobile ||
      !address ||
      !country ||
      !commission ||
      !gender ||
      !age ||
      !clinicName ||
      !charge ||
      !education ||
      !experience ||
      !experienceDetails ||
      !yourSelf ||
      !designation ||
      !dob ||
      !language ||
      !awards ||
      !degree ||
      !image
    ) {
      let error = {} as ErrorState;
      if (!name) error.name = "Name is required";
      if (!email) error.email = "Email is required";
      if (!password) error.password = "Password is required";
      if (!mobile) error.mobile = "Mobile number is required";
      if (!gender) error.gender = "Gender is required";
      if (!address) error.address = "Address is required";
      if (!(commission || commission < 0))
        error.commission = "Commision is required";

      if (!charge) error.charge = "Charge is required";
      if (!country) error.country = "Country is required";

      if (!age) error.age = "Age is required";
      if (!clinicName || !dialogueData)
        error.clinicName = "Clinic name is required";
      if (!education) error.education = "Eduction is required";
      if (!experience) error.experience = "Experience is required";
      if (!experienceDetails)
        error.experienceDetails = "Experience details is required";
      if (!yourSelf) error.yourSelf = "Yourself is required";
      if (!designation) error.designation = "Designation is required";
      if (!dob) error.dob = "Date of birth is required";
      if (!language) error.language = "Language is required";
      if (!awards) error.awards = "Awards is required";
      if (!degree) error.degree = "Degree is required";
      if (!image) error.image = "Image is required";

      return setError({ ...error });
    } else {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("address", address);
      formData.append("commission", commission);
      formData.append("charge", charge);
      formData.append("country", country);
      formData.append("gender", gender);
      formData.append("age", age);
      formData.append("mobile", mobile);
      formData.append("clinicName", clinicName);
      formData.append("education", education);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("experienceDetails", experienceDetails);
      formData.append("yourSelf", yourSelf);
      formData.append("designation", designation);
      formData.append("dob", dob);
      formData.append("language", language);
      formData.append("awards", awards);
      formData.append("degree", degree);
      formData.append("image", image);



      let payload: any = { doctorId: dialogueData?._id, data: formData };

      dispatch(updateDoctor(payload));

      dispatch(closeDialog());
    }
  };

  return (
    <div className="p-3">
      <Title name={`Update doctor`} />
      <div className="card">
        <div className="card-body">
          <div className="">
            <div className="row align-items-start formBody">
              <div className="col-12">
                <h2 className="fw-bolder mb-0" style={{ fontSize: "22px" }}>
                  Doctor information
                </h2>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`name`}
                  name={`name`}
                  value={name}
                  label={`Name`}
                  defaultValue={dialogueData && dialogueData?.name}
                  placeholder={`Name`}
                  errorMessage={error.name && error.name}
                  onChange={(e: any) => {
                    setName(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        name: ` Name is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        name: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`email`}
                  name={`email`}
                  value={email}
                  label={`Email`}
                  defaultValue={dialogueData && dialogueData?.email}
                  placeholder={`email`}
                  errorMessage={error.email && error.email}
                  onChange={(e: any) => {
                    setEmail(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        email: `Email is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        email: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`password`}
                  id={`password`}
                  name={`password`}
                  value={password}
                  label={`Password`}
                  defaultValue={dialogueData && dialogueData?.password}
                  placeholder={`Password`}
                  errorMessage={error.password && error.password}
                  onChange={(e: any) => {
                    setPassword(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        password: `Password is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        password: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  value={mobile}
                  id={`mono`}
                  name={`mobile`}
                  label={`Mobile number`}
                  defaultValue={dialogueData && dialogueData?.mobile}
                  minLength={6}
                  maxLength={13}
                  placeholder={`Mobile number`}
                  errorMessage={error.mobile && error.mobile}
                  onChange={(e: any) => {
                    setMobile(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        mobile: `Mobile number is required`,
                      });
                    } else if (
                      e.target.value.length < 6 ||
                      e.target.value.length > 13
                    ) {
                      return setError({
                        ...error,
                        mobile: "Mobile number must be 6 to 13 digits",
                      });
                    } else {
                      return setError({
                        ...error,
                        mobile: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  name={`genders`}
                  value={gender}
                  id={`male`}
                  label={`Gender`}
                  defaultValue={dialogueData && dialogueData?.gender}
                  errorMessage={error.gender && error.gender}
                  onChange={(e: any) => {
                    setGender(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        gender: `Gender is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        gender: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <div
                  className={`inputData flex-row justify-content-start text-start`}
                >
                  <label htmlFor="gender">Date of Birth</label>
                  <input
                    type={`date`}
                    id={`dob`}
                    name={`dob`}
                    value={dob}
                    defaultValue={dialogueData && dialogueData?.dob}
                    placeholder={`Date of birth`}
                    onChange={(e: any) => {
                      setDob(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          dob: `Date of birth is required`,
                        });
                      } else {
                        return setError({
                          ...error,
                          dob: "",
                        });
                      }
                    }}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`age`}
                  name={`age`}
                  value={age}
                  label={`Age`}
                  defaultValue={dialogueData && dialogueData?.age}
                  placeholder={`age`}
                  errorMessage={error.age && error.age}
                  onChange={(e: any) => {
                    setAge(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        age: `Age is required`,
                      });
                    } else if (e.target.value.length > 2) {
                      return setError({
                        ...error,
                        age: "Age must be 2 digits",
                      });
                    } else if (e.target.value < 0) {
                      return setError({
                        ...error,
                        age: "Age must be negative value",
                      });
                    } else {
                      return setError({
                        ...error,
                        age: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`charge`}
                  name={`charge`}
                  value={charge}
                  label={`Charge (${setting?.currencySymbol})`}
                  placeholder={`Charge`}
                  defaultValue={dialogueData && dialogueData?.charge}
                  errorMessage={error.charge && error.charge}
                  onChange={(e: any) => {
                    setCharge(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        charge: `Charge is required`,
                      });
                    } else if (e.target.value < 0) {
                      return setError({
                        ...error,
                        charge: "Charge must be negative value",
                      });
                    } else {
                      return setError({
                        ...error,
                        charge: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`commission`}
                  name={`commission`}
                  value={commission}
                  label={`Admin commission (%)`}
                  defaultValue={dialogueData && dialogueData?.commission}
                  placeholder={`Commission`}
                  errorMessage={error.commission && error.commission}
                  onChange={(e: any) => {
                    setCommission(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        commission: `Commission is required`,
                      });
                    } else if (e.target.value.length > 2) {
                      return setError({
                        ...error,
                        commission: "Commission must be 2 digits",
                      });
                    } else if (e.target.value < 0) {
                      return setError({
                        ...error,
                        commission: "Commission must be negative value",
                      });
                    } else {
                      return setError({
                        ...error,
                        commission: "",
                      });
                    }
                  }}
                />
              </div>


              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={"file"}
                  label={"Image"}
                  accept={"image/png, image/jpeg"}
                  errorMessage={error.image && error.image}
                  onChange={handleInputImage}
                />

                {imagePath && (
                  <>
                    <img
                      src={imagePath ? imagePath : dialogueData?.image}
                      className="mt-3 rounded float-left mb-2"
                      alt="image"
                      style={{ width: "100px", height: "100px" }}
                    />
                  </>
                )}
              </div>


              <div className="col-12">
                <h2 className="fw-bolder mb-0 mt-3" style={{ fontSize: "22px" }}>
                  Address Information
                </h2>
              </div>

              {dialogueData.type !== 1 && (
                <div className="col-12 col-md-6 col-lg-4">
                  <ExInput
                    type={`text`}
                    id={`clinicName`}
                    name={`clinicName`}
                    value={clinicName}
                    label={`Clinic name`}
                    defaultValue={dialogueData && dialogueData?.clinicName}
                    placeholder={`Clinic name`}
                    errorMessage={error.clinicName && error.clinicName}
                    onChange={(e: any) => {
                      setClinicName(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          clinicName: `ClinicName is required`,
                        });
                      } else {
                        return setError({
                          ...error,
                          clinicName: "",
                        });
                      }
                    }}
                  />
                </div>
              )}
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`address`}
                  name={`Address`}
                  value={address}
                  label={`Address`}
                  placeholder={`Address`}
                  defaultValue={dialogueData && dialogueData?.address}
                  errorMessage={error.address && error.address}
                  onChange={(e: any) => {
                    setAddress(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        address: `Address is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        address: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`country`}
                  name={`country`}
                  value={country}
                  label={`Country`}
                  defaultValue={dialogueData && dialogueData?.country}
                  placeholder={`Country`}
                  errorMessage={error.country && error.country}
                  onChange={(e: any) => {
                    setCountry(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        country: `Country is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        country: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12">
                <h2 className="fw-bolder mb-0 mt-3" style={{ fontSize: "22px" }}>
                  Other Information
                </h2>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <ExInput
                  type={`text`}
                  id={`language`}
                  name={`language`}
                  value={language}
                  defaultValue={dialogueData && dialogueData?.language}
                  label={`Language`}
                  placeholder={`Language`}
                  errorMessage={error.language && error.language}
                  onChange={(e: any) => {
                    setLanguage(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        language: `Language is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        language: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <ExInput
                  // type={`text`}
                  id={`degree`}
                  name={`degree`}
                  value={degree}
                  label={`Degree`}
                  defaultValue={dialogueData && dialogueData?.degree}
                  placeholder={`Degree`}
                  errorMessage={error.degree && error.degree}
                  onChange={(e: any) => {
                    setDegree(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        degree: `Degree is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        degree: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <ExInput
                  type={`text`}
                  id={`designation`}
                  name={`designation`}
                  value={designation}
                  label={`Designation`}
                  defaultValue={dialogueData && dialogueData?.designation}
                  placeholder={`Designation`}
                  errorMessage={error.designation && error.designation}
                  onChange={(e: any) => {
                    setDesignation(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        designation: `Designation is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        designation: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <ExInput
                  type={`number`}
                  id={`experience`}
                  name={`experience`}
                  value={experience}
                  defaultValue={dialogueData && dialogueData?.experience}
                  label={`Experience (Year)`}
                  placeholder={`Experience`}
                  errorMessage={error.experience && error.experience}
                  onChange={(e: any) => {
                    setExperience(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        experience: `Experience is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        experience: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <Textarea
                  row={5}
                  type={`text`}
                  id={`education`}
                  name={`education`}
                  value={education}
                  label={`Education`}
                  placeholder={`Education`}
                  defaultValue={dialogueData && dialogueData?.education}
                  errorMessage={error.education && error.education}
                  onChange={(e: any) => {
                    setEducation(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        education: `Education is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        education: "",
                      });
                    }
                  }}
                />

                <p className="text-danger">
                  {error?.education && error?.education ? error.education : ""}
                </p>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <Textarea
                  row={5}
                  type={`text`}
                  id={`experienceDetails`}
                  name={`experienceDetails`}
                  value={experienceDetails}
                  defaultValue={dialogueData && dialogueData?.experienceDetails}
                  label={`Experience details`}
                  placeholder={`Experience Details`}
                  errorMessage={
                    error.experienceDetails && error.experienceDetails
                  }
                  onChange={(e: any) => {
                    setExperienceDetails(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        experienceDetails: `Experience details is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        experienceDetails: "",
                      });
                    }
                  }}
                />
                <p className="text-danger">{error?.experienceDetails && error?.experienceDetails ? error.experienceDetails : ""}</p>

              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <Textarea
                  type={`text`}
                  row={5}
                  id={`awards`}
                  name={`awards`}
                  value={awards}
                  defaultValue={dialogueData && dialogueData?.awards}
                  label={`Awards`}
                  placeholder={`Awards`}
                  errorMessage={error.awards && error.awards}
                  onChange={(e: any) => {
                    setAwards(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        awards: `Awards is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        awards: "",
                      });
                    }
                  }}
                />
                <p className="text-danger">
                  {error?.awards && error?.awards ? error.awards : ""}
                </p>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <Textarea
                  row={5}
                  type={`text`}
                  id={`yourSelf`}
                  name={`yourSelf`}
                  value={yourSelf}
                  label={`Your self history`}
                  defaultValue={dialogueData && dialogueData?.yourSelf}
                  placeholder={`Your Self`}
                  errorMessage={error.yourSelf && error.yourSelf}
                  onChange={(e: any) => {
                    setYourSelf(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        yourSelf: `Your Self is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        yourSelf: "",
                      });
                    }
                  }}
                />
                <p className="text-danger">
                  {error?.yourSelf && error?.yourSelf ? error.yourSelf : ""}
                </p>
              </div>





            </div>

            <div className="row  formFooter">
              <div className="col-12 text-end m0">
                <Button
                  className={`bg-gray text-light`}
                  text={`Cancel`}
                  type={`button`}
                  onClick={() => dispatch(closeDialog())}
                />
                <Button
                  type={`submit`}
                  className={` text-white m10-left`}
                  style={{ backgroundColor: "#1ebc1e" }}
                  text={`Submit`}
                  onClick={(e: any) => handleSubmit(e)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;
