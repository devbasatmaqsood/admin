exports.DOCTOR_PAYMENT_TYPE = {
  BANK: 1,
  UPI: 2,
  CASH: 3,
};

exports.DOCTOR_TYPE = {
  online: 1,
  clinic: 2,
  both: 3,
};

exports.DOCTOR_REQUEST_STATUS = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
};

exports.BANNER_TYPE = {
  SERVICE: 1,
  URL: 2,
};

exports.NOTIFICATION_TYPE = {
  USER: 1,
  DOCTOR: 2,
};

exports.COMPLAIN_TYPE = {
  PENDING: 1,
  SOLVED: 2,
};
exports.COMPLAIN_PERSON = {
  DOCTOR: 1,
  USER: 2,
};

exports.TRANSACTION_STATUS = {
  PENDING: 1,
  PAID: 2,
};

exports.PAYMENT_STATUS = {
  PENDING: 1,
  PAID: 2,
};

exports.APPOINTMENT_STATUS = {
  PENDING: 1,
  CONFIRM: 2,
  COMPLETE: 3,
  CANCEL: 4,
};

exports.LOGIN_TYPE = {
  EMAIL_PASSWORD: 1,
  GOOGLE: 2,
  MOBILE: 3, // OTP LOGIN
  APPLE: 4,
};

exports.PAYMENT_GATEWAY = {
  razorPay: 1,
  stripe: 2,
  flutter: 3,
};

exports.CANCEL_BY = {
  admin: 1,
  patient: 2,
  doctor: 3,
};

exports.COUPON_TYPE = {
  wallet: 1, // use only at time of when user add money to wallet
  appointment: 2, // use only at time of when user checkout appointment
};

exports.DISCOUNT_TYPE = {
  flat: 1, // flag discount in amount
  percent: 2, // percent of discount on money
};

exports.DOCTOR_PAYMENT_REQUEST_TYPE = {
  pending: 1,
  accepted: 2,
  declined: 3,
};

exports.WALLET_HISTORY_TYPE = {
  deposit: 1,
  withdraw: 2,
  appointment_cancel: 3,
};

exports.MESSAGE_TYPE = {
  MESSAGE: "1",
  IMAGE: "2",
  VIDEO: "3",
  AUDIO: "4",
  VIDEOCALL: "5",
};

exports.CALL_TYPE = {
  RECEIVED: 1,
  DECLINED: 2,
  MISCALLED: 3,
};

exports.APPOINTMENT_TYPE = {
  ONLINE: 1,
  CLINIC: 2,
};
