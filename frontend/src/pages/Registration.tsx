'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Input, { ExInput } from '../extra/Input';
import Logo from '../assets/images/logo.png';
import Image from 'next/image';
import Button from '../extra/Button';
import { useAppDispatch } from '@/store/store';
import { useRouter } from 'next/router';
import { signUpAdmin } from '@/store/adminSlice';
import bgImage from '../../src/assets/images/login.jpg';

interface RootState {
  admin: {
    isAuth: boolean;
    admin: Object;
  };
}

export default function Registration() {
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [userPurchaseCode, setUserPurchaseCode] = useState('');
  const [error, setError] = useState({
    email: '',
    password: '',
    newPassword: '',
    code: '',
    userPurchaseCode: '',
  });

  const handleSubmit = async () => {
    if (
      !email ||
      !password ||
      !code ||
      !newPassword ||
      newPassword !== password ||
      !userPurchaseCode
    ) {
      let errorObj: any = {};
      if (!email) errorObj = { ...errorObj, email: 'Email Is Required !' };
      if (!password)
        errorObj = { ...errorObj, password: 'Password is required !' };
      if (!newPassword)
        errorObj = {
          ...errorObj,
          newPassword: 'Confirm Password is required !',
        };

      if (newPassword !== password)
        errorObj = {
          ...errorObj,
          newPassword: "Password and Confirm Password doesn't match !",
        };
      if (!code)
        errorObj = { ...errorObj, code: 'Doctor purchase code is required !' };

      if (!userPurchaseCode)
        errorObj = {
          ...errorObj,
          userPurchaseCode: 'User purchase code is required !',
        };

      return setError(errorObj);
    } else {
      let payload: any = {
        email,
        password,
        doctorLicenseKey: code,
        userLicenseKey: userPurchaseCode,
      };
      const res = await dispatch(signUpAdmin(payload)).unwrap();
      if(res?.status){
        window.location.reload();
      }
    }
  };

  return (
    <>
      <div
        className="mainLoginPage"
        style={{
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="loginDiv" style={{ width: '100%' }}>
          <div className="loginPage m-auto">
            <div className="loginTitle mb-3  d-flex " style={{ width: '60px' }}>
              <Image src={Logo} width={60} height={60} alt="logo" />
            </div>
            <div className="fw-bold text-theme  me-auto my-auto welComeTitle">
              Welcome Back
            </div>
            <h1>Sign Up !</h1>
            <h6 className="fw-bold text-theme  me-auto my-auto fs-15 py-2 title">
              Please,Enter Your Email id and Password
            </h6>
            <div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`email`}
                  name={`email`}
                  label={`Email`}
                  value={email}
                  placeholder={`Email`}
                  errorMessage={error.email && error.email}
                  onChange={(e: any) => {
                    setEmail(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        email: `email Id is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        email: '',
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`password`}
                  id={`password`}
                  name={`password`}
                  value={password}
                  label={`Password`}
                  placeholder={`Password`}
                  errorMessage={error.password && error.password}
                  onChange={(e: any) => {
                    setPassword(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        password: `password is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        password: '',
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`password`}
                  id={`newPassword`}
                  name={`newPassword`}
                  value={newPassword}
                  label={`Confirm Password`}
                  placeholder={`Confirm Password`}
                  errorMessage={error.newPassword && error.newPassword}
                  onChange={(e: any) => {
                    setNewPassword(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        newPassword: `Confirm Password is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        newPassword: '',
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`code`}
                  name={`code`}
                  value={code}
                  label={`Doctor Purchase code`}
                  placeholder={`Doctor Purchase code`}
                  errorMessage={error.code && error.code}
                  onChange={(e: any) => {
                    setCode(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        code: `Doctor purchase code is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        code: '',
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`userpurchasecode`}
                  name={`userpurchasecode`}
                  value={userPurchaseCode}
                  label={`User Purchase code`}
                  placeholder={`User Purchase code`}
                  errorMessage={
                    error.userPurchaseCode && error.userPurchaseCode
                  }
                  onChange={(e: any) => {
                    setUserPurchaseCode(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        userPurchaseCode: `User purchase code is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        userPurchaseCode: '',
                      });
                    }
                  }}
                />
              </div>

              <div className="loginButton d-flex gx-2 justify-content-center">
                <Button
                  type={`submit`}
                  className={`bg-theme text-light cursor m10-top col-6 mx-2`}
                  text={`Sign Up`}
                  onClick={handleSubmit}
                  style={{ borderRadius: '30px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
