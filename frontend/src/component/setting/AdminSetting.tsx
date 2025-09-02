import Button from '@/extra/Button';
import { ExInput, Textarea } from '@/extra/Input';
import ToggleSwitch from '@/extra/TogggleSwitch';
import { getSetting, handleSetting, updateSetting } from '@/store/settingSlice';
import { RootStore, useAppDispatch } from '@/store/store';

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

interface ErrorState {
  privacyPolicyLinkText: string;
  currencyNameText: string;
  currencySymbolText: string;
  tncText: any;
  taxText: any;
  commissionPercentText: any;
  firebaseKeyText: string;
  minWithdrawText: string;
  durationOfvideo: any;

  zegoAppId: string;
  zegoAppSignIn: string;
  openAIkey: string;
  resendKey: string;
}

const AdminSetting = () => {
  const { setting }: any = useSelector((state: RootStore) => state?.setting);


  const [privacyPolicyLinkText, setPrivacyPolicyLinkText] = useState<any>();
  const [currencyNameText, setCurrencyNameText] = useState<any>();
  const [currencySymbolText, setcurrencySymbolText] = useState<any>();
  const [tncText, setTncText] = useState<any>();
  const [taxText, setTaxText] = useState<any>();
  const [commissionPercentText, setCommissionPercentText] = useState<any>();
  const [firebaseKeyText, setFirebaseKeyText] = useState<any>();
  const [minWithdrawText, setmMinWithdrawText] = useState<any>();
  const [durationOfvideo, setDurationOfVideo] = useState<any>();

  const [openAIkey, setOpenAIkey] = useState<any>();
  const [zegoAppId, setZegoAppId] = useState<any>();
  const [resendKey, setResendKey] = useState<any>();
  const [zegoAppSignIn, setZegoAppSignIn] = useState<any>();

  const [data, setData] = useState<any>();

  const [error, setError] = useState<any>({
    privacyPolicyLinkText: '',
    currencyNameText: '',
    currencySymbolText: '',
    tncText: '',
    taxText: '',
    commissionPercentText: '',
    firebaseKey: '',
    minWithdrawText: '',
    durationOfvideo: '',
    openAIkey: '',
    zegoAppId: '',
    zegoAppSignIn: '',
    resendKey: '',
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    setData(setting);
  }, [setting]);

  useEffect(() => {
    setPrivacyPolicyLinkText(setting?.privacyPolicyLink);
    setCurrencyNameText(setting?.currencyName);
    setcurrencySymbolText(setting?.currencySymbol);
    setTncText(setting?.tnc);
    setTaxText(setting?.tax);
    setCommissionPercentText(setting?.commissionPercent);
    setFirebaseKeyText(JSON.stringify(setting?.firebaseKey));
    setmMinWithdrawText(setting?.minWithdraw);
    setDurationOfVideo(setting?.durationOfvideo);

    setOpenAIkey(setting?.openAIkey);
    setResendKey(setting?.resendApiKey);
    setZegoAppId(setting?.zegoAppId);
    setZegoAppSignIn(setting?.zegoAppSignIn);
  }, [setting]);

  const handleSettingSwitch: any = (id: any, type: any) => {

    const payload = {
      id,
      type,
    };
    dispatch(handleSetting(payload));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();


    if (
      !privacyPolicyLinkText ||
      !currencyNameText ||
      !currencySymbolText ||
      !tncText ||
      !taxText ||
      !commissionPercentText ||
      !firebaseKeyText ||
      !minWithdrawText ||
      !durationOfvideo ||
      !openAIkey ||
      !zegoAppId ||
      !resendKey ||
      !zegoAppSignIn
    ) {
      {
        let error = {} as ErrorState;
        if (!privacyPolicyLinkText)
          error.privacyPolicyLinkText = 'privacyPolicyLink Is Required !';
        if (!currencyNameText)
          error.currencyNameText = 'currencyName Is Required !';

        if (!currencySymbolText)
          error.currencySymbolText = 'Currency Symbol Text is Required!';
        if (!tncText) error.tncText = 'Terms and Condition Is Required !';
        if (!taxText) error.taxText = 'Tax Is Required !';
        if (!commissionPercentText)
          error.commissionPercentText = 'CommisionPenrcent Is Required !';
        if (!firebaseKeyText)
          error.firebaseKeyText = 'FirbaseKey Is Required !';
        if (!minWithdrawText)
          error.minWithdrawText = 'Minimum Withdraw Is Required !';
        if (!durationOfvideo)
          error.durationOfvideo = 'Maximum Duration Of Video Is Required !';
        if (!zegoAppId) error.zegoAppId = 'Zegoappid is Required';
        if (!zegoAppSignIn) error.zegoAppSignIn = 'Zegoappsignin is Required';
        if (!openAIkey) error.openAIkey = 'Open Ai Key is Required';
        if (!resendKey) error.openAIkey = 'Resend API Key is Required';

        return setError({ ...error });
      }
    } else {
      let settingDataSubmit = {
        settingId: data?._id,
        privacyPolicyLink: privacyPolicyLinkText,
        tnc: tncText,
        currencySymbol: currencySymbolText,
        currencyName: currencyNameText,
        tax: parseInt(taxText),
        commissionPercent: parseInt(commissionPercentText),
        firebaseKey: firebaseKeyText,
        minWithdraw: parseInt(minWithdrawText),
        durationOfvideo: parseInt(durationOfvideo),
        openAIkey: openAIkey,
        resendApiKey: resendKey,
        zegoAppId: zegoAppId,
        zegoAppSignIn: zegoAppSignIn,
      };
      dispatch(updateSetting(settingDataSubmit));
    }
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
                <h4>App Setting</h4>
              </div>
              <div>
                <div className="row d-flex justify-content-center d-flex align-items-baseline">
                  <div className="col-8">
                    <ExInput
                      type={`text`}
                      id={`tax`}
                      name={`tax`}
                      label={`Tax (%)`}
                      placeholder={`Enter Tax`}
                      errorMessage={error.taxText && error.taxText}
                      value={taxText}
                      onChange={(e: any) => {
                        setTaxText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            taxText: `Tax Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            taxText: '',
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-4 inputData">
                    <div>
                      <label className="my-2">Maintenance Mode</label>
                    </div>
                    <ToggleSwitch
                      onClick={() => handleSettingSwitch(setting?._id, 3)}
                      value={setting?.maintenanceMode}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`privacyPolicyLink`}
                      name={`privacyPolicyLink`}
                      label={`Privacy policy link`}
                      value={privacyPolicyLinkText}
                      errorMessage={
                        error.privacyPolicyLinkText &&
                        error.privacyPolicyLinkText
                      }
                      placeholder={`Enter Privacy policy link`}
                      onChange={(e: any) => {
                        setPrivacyPolicyLinkText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            privacyPolicyLinkText: `PrivacyPolicyLink Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            privacyPolicyLinkText: '',
                          });
                        }
                      }}
                    />
                  </div>


                </div>
              </div>
              <div className="col-12">
                <ExInput
                  type={`text`}
                  id={`tnc`}
                  name={`tnc`}
                  label={`Terms and condition`}
                  placeholder={`Enter Terms and condition link`}
                  errorMessage={error.tncText && error.tncText}
                  value={tncText}
                  onChange={(e: any) => {
                    setTncText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        tncText: `Terms and Condition is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        tncText: '',
                      });
                    }
                  }}
                />
              </div>

            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Currency Setting</h4>
              </div>
              <div className='row'>
                <div className="col-12">
                  <ExInput
                    type={`text`}
                    id={`currencyName`}
                    name={`currencyName`}
                    label={`Currency Name`}
                    placeholder={`Currency Name`}
                    errorMessage={
                      error.currencyNameText && error.currencyNameText
                    }
                    value={currencyNameText}
                    onChange={(e: any) => {
                      setCurrencyNameText(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          currencyNameText: `Currency Name Is Required`,
                        });
                      } else {
                        return setError({
                          ...error,
                          currencyNameText: '',
                        });
                      }
                    }}
                  />
                </div>
                <div className="col-12">
                  <ExInput
                    type={`text`}
                    id={`currencySymbol`}
                    name={`currencySymbol`}
                    label={`Currency Symbol`}
                    placeholder={`Currency Symbol`}
                    errorMessage={
                      error.currencySymbolText && error.currencySymbolText
                    }
                    value={currencySymbolText}
                    onChange={(e: any) => {
                      setcurrencySymbolText(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          currencySymbolText: `Currency Symbol Is Required`,
                        });
                      } else {
                        return setError({
                          ...error,
                          currencySymbolText: '',
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Financial Setting </h4>
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`number`}
                  id={`commissionPercent`}
                  name={`commissionPercent`}
                  label={`Commission Percent (%)`}
                  placeholder={`Commission Percent`}
                  errorMessage={
                    error.commissionPercentText && error.commissionPercentText
                  }
                  value={commissionPercentText}
                  onChange={(e: any) => {
                    setCommissionPercentText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        commissionPercentText: `Commision Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        commissionPercentText: '',
                      });
                    }
                  }}
                />

                <ExInput
                  type={`text`}
                  id={`minWithdraw`}
                  name={`minWithdraw`}
                  label={`Minimum Withdraw Amount (Doctor)`}
                  placeholder={`Minimum Withdraw Amount`}
                  errorMessage={error.minWithdrawText && error.minWithdrawText}
                  value={minWithdrawText}
                  onChange={(e: any) => {
                    setmMinWithdrawText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        minWithdrawText: `Withdraw Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        minWithdrawText: '',
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className="settingBoxOuter" style={{ marginTop: '15px' }}>
              <div className="settingBoxHeader">
                <h4>Maximum Duration of Med Clips Setting</h4>
              </div>

              <div className="col-12">
                <ExInput
                  type={`text`}
                  id={`commissionPercent`}
                  name={`commissionPercent`}
                  label={`Maximum Duration of Med Clips (in seconds)`}
                  placeholder={`Duration of Medical Clips`}
                  errorMessage={error.durationOfvideo && error.durationOfvideo}
                  value={durationOfvideo}
                  onChange={(e: any) => {
                    setDurationOfVideo(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        durationOfvideo: `Maximum Duration Of Video Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        durationOfvideo: '',
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Firebase Notification Setting</h4>
              </div>
              <div className="col-12 ">
                <Textarea
                  row={10}
                  type={`text`}
                  id={`firebaseKey`}
                  name={`firebaseKey`}
                  label={`Private Key JSON`}
                  placeholder={`Enter firebaseKey`}
                  errorMessage={error.firebaseKeyText && error.firebaseKeyText}
                  value={firebaseKeyText}
                  onChange={(e: any) => {
                    setFirebaseKeyText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        firebaseKeyText: `Private Key Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        firebaseKeyText: '',
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Open AI Setting</h4>
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`openAIkey`}
                  name={`openAIkey`}
                  label={`Open AI Key`}
                  placeholder={`OpenAI Key`}
                  errorMessage={error.openAIkey && error.openAIkey}
                  value={openAIkey}
                  onChange={(e: any) => {
                    setOpenAIkey(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        openAIkey: `OpenAI Key Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        openAIkey: '',
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Email Setting</h4>
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`resendKey`}
                  name={`resendKey`}
                  label={`Resend API Key`}
                  placeholder={`Enter Resend API key`}
                  errorMessage={error.resendKey && error.resendKey}
                  value={resendKey}
                  onChange={(e: any) => {
                    setResendKey(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        resendKey: `Resend Api Key Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        resendKey: '',
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Zego Setting</h4>
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`zegoAppId`}
                  name={`zegoAppId`}
                  label={`Zego App Id`}
                  placeholder={`Zego AppId`}
                  errorMessage={error.zegoAppId && error.zegoAppId}
                  value={zegoAppId}
                  onChange={(e: any) => {
                    setZegoAppId(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        zegoAppId: `Gemini Key Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        zegoAppId: '',
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`zegoAppSignIn`}
                  name={`zegoAppSignIn`}
                  label={`Zego Key`}
                  placeholder={`App Sign In`}
                  errorMessage={error.zegoAppSignIn && error.zegoAppSignIn}
                  value={zegoAppSignIn}
                  onChange={(e: any) => {
                    setZegoAppSignIn(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        zegoAppSignIn: `App Sign In Key Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        zegoAppSignIn: '',
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSetting;
