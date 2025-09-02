import React, { useEffect, useState } from 'react';
import RootLayout from '@/component/layout/Layout';
import Title from '@/extra/Title';
import { RootStore, useAppDispatch } from '@/store/store';
import AdminSetting from '@/component/setting/AdminSetting';
import PaymetSetting from '@/component/setting/PaymentSetting';
import WithdrawDialog from '@/component/withdrawal/WithdrawDialog';
import WithdrawSetting from '@/component/setting/WithdrawSetting';
import { useSelector } from 'react-redux';
import { getSetting } from '@/store/settingSlice';

const Setting = () => {
  const [type, setType] = useState<string>('Setting');
  const dispatch = useAppDispatch();


  useEffect(() => {
    dispatch(getSetting())
  }, [dispatch])

  return (
    <>
      <div
        className="my-2"
      style={{
          width: '460px',
          border: '1px solid #1c2b20',
          padding: '4px',
          borderRadius: '40px',
        }}
      >
        <button
          type="button"
          className={`${type === 'Setting' ? 'activeBtn' : 'disabledBtn'}`}
          onClick={() => setType('Setting')}
        >
          Setting
        </button>
        <button
          type="button"
          className={`${type === 'PaymetSetting' ? 'activeBtn' : 'disabledBtn'
            } ms-1`}
          onClick={() => setType('PaymetSetting')}
        >
          Payment Setting
        </button>

        <button
          type="button"
          className={`${type === 'WithdrawSetting' ? 'activeBtn' : 'disabledBtn'
            } ms-1`}
          onClick={() => setType('WithdrawSetting')}
        >
          Withdraw Setting
        </button>
      </div>
      <div>
        {type === 'Setting' && <AdminSetting />}
        {type === 'PaymetSetting' && <PaymetSetting />}
        {type === 'WithdrawSetting' && <WithdrawSetting />}
      </div>
    </>
  );
};

Setting.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Setting;
