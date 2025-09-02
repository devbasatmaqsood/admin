import Button from '@/extra/Button';
import { ExInput } from '@/extra/Input';
import ToggleSwitch from '@/extra/TogggleSwitch';
import { getSetting, handleSetting, updateSetting } from '@/store/settingSlice';
import { RootStore, useAppDispatch } from '@/store/store';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface ErrorState {
  razorPaySecretKeyText: string;
  razorPayIdText: string;
  stripeSecretKeyText: string;
  stripePublishableKeyText: string;
  flutterWaveKeyText: string;
}

const PaymetSetting = () => {
  const { setting }: any = useSelector((state: RootStore) => state?.setting);


  const [razorPaySecretKeyText, setrazorPaySecretKeyText] = useState<any>();
  const [razorPayIdText, setRazorPayIdText] = useState<any>();
  const [stripeSecretKeyText, setStripeSecretKeyText] = useState<any>();
  const [stripePublishableKeyText, setstripePublishableKeyText] =
    useState<any>();
  const [flutterWaveKeyText, setFlutterWaveKeyText] = useState<any>();
  const [data, setData] = useState<any>();

  const [error, setError] = useState<any>({
    razorPaySecretKeyText: '',
    razorPayIdText: '',
    stripeSecretKeyText: '',
    stripePublishableKeyText: '',
    flutterWaveKeyText: '',
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    setData(setting);
  }, [setting]);

  useEffect(() => {
    setrazorPaySecretKeyText(setting?.razorSecretKey);
    setRazorPayIdText(setting?.razorPayId);
    setStripeSecretKeyText(setting?.stripeSecretKey);
    setstripePublishableKeyText(setting?.stripePublishableKey);
    setFlutterWaveKeyText(setting?.flutterWaveKey);
  }, [setting]);

  const handleSubmit = (e) => {


    if (
      !razorPaySecretKeyText ||
      !razorPayIdText ||
      !stripeSecretKeyText ||
      !stripePublishableKeyText ||
      !flutterWaveKeyText
    ) {
      {
        let error = {} as ErrorState;
        if (!razorPaySecretKeyText)
          error.razorPaySecretKeyText = 'RazorPay SecretKey Is Required !';
        if (!razorPayIdText) error.razorPayIdText = 'RazorPayId Is Required !';

        if (!stripeSecretKeyText)
          error.stripeSecretKeyText = 'stripePay SecretKey is Required!';
        if (!stripePublishableKeyText)
          error.stripePublishableKeyText =
            'stripePay PublishableKey Is Required !';
        if (!flutterWaveKeyText)
          error.flutterWaveKeyText = 'FlutterWaveKey Is Required !';

        return setError({ ...error });
      }
    } else {
      let settingDataSubmit = {
        settingId: data?._id,
        razorSecretKey: razorPaySecretKeyText,
        razorPayId: razorPayIdText,
        stripeSecretKey: stripeSecretKeyText,
        stripePublishableKey: stripePublishableKeyText,
        flutterWaveKey: flutterWaveKeyText,
      };
      dispatch(updateSetting(settingDataSubmit));
    }
  };

  const handleSettingSwitch: any = (id: any, type: any) => {
    const payload = {
      id,
      type,
    };
    dispatch(handleSetting(payload));
  };

  return (
    <div className="mainSetting">
      <form onSubmit={handleSubmit} id="expertForm">
        <div className=" d-flex justify-content-end">
          <div className="  formFooter">
            <Button
              type={`submit`}
              className={`text-light m10-left fw-bold`}
              text={`Submit`}
              style={{ backgroundColor: '#1ebc1e' }}
            />
          </div>
        </div>
        <div className="settingBox row">
          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Razor Pay Setting</h4>
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`razorSecretKey`}
                  name={`razorSecretKey`}
                  label={`Razorpay Secret Key`}
                  placeholder={`Razorpay Secret Key`}
                  errorMessage={
                    error.razorPaySecretKeyText && error.razorPaySecretKeyText
                  }
                  value={razorPaySecretKeyText}
                  onChange={(e: any) => {
                    setrazorPaySecretKeyText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        razorPaySecretKeyText: `RazorPay Secret Key Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        razorPaySecretKeyText: '',
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12">
                <ExInput
                  type={`text`}
                  id={`razorPayId`}
                  name={`razorPayId`}
                  label={` Razorpay Id`}
                  placeholder={` RazorPay Id`}
                  errorMessage={error.razorPayIdText && error.razorPayIdText}
                  value={razorPayIdText}
                  onChange={(e: any) => {
                    setRazorPayIdText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        razorPayIdText: `RazorPay is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        razorPayIdText: '',
                      });
                    }
                  }}
                />
              </div>
              <div className="inputData">
                <div>
                  <label className="my-3">Razorpay Active</label>
                </div>
                <ToggleSwitch
                  onClick={() => handleSettingSwitch(setting?._id, 1)}
                  value={setting?.isRazorPay}
                />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Stripe Pay Setting</h4>
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`stripeSecretKey`}
                  name={`stripeSecretKey`}
                  label={`Stripe Secret Key`}
                  placeholder={`Stripe Secret Key`}
                  errorMessage={
                    error.stripeSecretKeyText && error.stripeSecretKeyText
                  }
                  value={stripeSecretKeyText}
                  onChange={(e: any) => {
                    setStripeSecretKeyText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        stripeSecretKeyText: `StripePay SecretKey is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        stripeSecretKeyText: '',
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12">
                <ExInput
                  type={`text`}
                  id={`stripePublishableKey`}
                  name={`stripePublishableKey`}
                  label={` Stripe Publishable Key`}
                  placeholder={` Stripe Publishable Key`}
                  errorMessage={
                    error.stripePublishableKeyText &&
                    error.stripePublishableKeyText
                  }
                  value={stripePublishableKeyText}
                  onChange={(e: any) => {
                    setstripePublishableKeyText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        stripePublishableKeyText: `Stripe Pay Publishable Key is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        stripePublishableKeyText: '',
                      });
                    }
                  }}
                />
              </div>
              <div className="inputData">
                <div>
                  <label className="my-3">Stripepay Active</label>
                </div>
                <ToggleSwitch
                  onClick={() => handleSettingSwitch(setting?._id, 2)}
                  value={setting?.isStripePay}
                />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Flutter Wave Setting</h4>
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`flutterWaveKey`}
                  name={`flutterWaveKey`}
                  label={`Flutterwave Key`}
                  placeholder={`FlutterWave Key`}
                  errorMessage={
                    error.flutterWaveKeyText && error.flutterWaveKeyText
                  }
                  value={flutterWaveKeyText}
                  onChange={(e: any) => {
                    setFlutterWaveKeyText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        flutterWaveKeyText: `FlutterWave Key is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        flutterWaveKeyText: '',
                      });
                    }
                  }}
                />
              </div>

              <div className="inputData">
                <div>
                  <label className="my-3">Flutterwave Active</label>
                </div>
                <ToggleSwitch
                  onClick={() => handleSettingSwitch(setting?._id, 4)}
                  value={setting?.isFlutterWave}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymetSetting;
