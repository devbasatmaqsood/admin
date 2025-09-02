const Admin = require("../../models/admin.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Cryptr = require("cryptr");
const fs = require("fs");
const cryptr = new Cryptr("myTotallySecretKey", {
  pbkdf2Iterations: 10000,
  saltLength: 10,
});

function _0xdb71(_0x20b381, _0x1e2bc2) {
  const _0x54976a = _0x5497();
  return (
    (_0xdb71 = function (_0xdb7126, _0x5e5915) {
      _0xdb7126 = _0xdb7126 - 0xfa;
      let _0x2a8471 = _0x54976a[_0xdb7126];
      return _0x2a8471;
    }),
    _0xdb71(_0x20b381, _0x1e2bc2)
  );
}
const _0x42d537 = _0xdb71;
(function (_0x1d42e0, _0x58e6ee) {
  const _0xa781ea = _0xdb71,
    _0x5bf7be = _0x1d42e0();
  while (!![]) {
    try {
      const _0x43b507 =
        (parseInt(_0xa781ea(0x107)) / 0x1) * (-parseInt(_0xa781ea(0x109)) / 0x2) +
        -parseInt(_0xa781ea(0xfb)) / 0x3 +
        -parseInt(_0xa781ea(0xfe)) / 0x4 +
        parseInt(_0xa781ea(0x10a)) / 0x5 +
        (parseInt(_0xa781ea(0xff)) / 0x6) * (-parseInt(_0xa781ea(0x106)) / 0x7) +
        (parseInt(_0xa781ea(0x10c)) / 0x8) * (parseInt(_0xa781ea(0xfc)) / 0x9) +
        (parseInt(_0xa781ea(0x102)) / 0xa) * (parseInt(_0xa781ea(0x104)) / 0xb);
      if (_0x43b507 === _0x58e6ee) break;
      else _0x5bf7be["push"](_0x5bf7be["shift"]());
    } catch (_0x24f92c) {
      _0x5bf7be["push"](_0x5bf7be["shift"]());
    }
  }
})(_0x5497, 0xe44a7);
const Login = require(_0x42d537(0x105)),
  axios = require("axios");
async function verifyPurchaseCode(_0x5c0c54) {
  const _0x274f6c = _0x42d537;
  try {
    const _0x51dac2 = await axios["get"](_0x274f6c(0x103), { headers: { Authorization: "Bearer\x20G9o1R8snTfNCpRgMzzKmpQP9kOVbapnP" }, params: { code: _0x5c0c54[_0x274f6c(0x101)]() } });
    return _0x51dac2[_0x274f6c(0xfa)];
  } catch (_0xd342fb) {
    return console[_0x274f6c(0x108)](_0x274f6c(0xfd), _0xd342fb[_0x274f6c(0x10b)]?.[_0x274f6c(0xfa)] || _0xd342fb[_0x274f6c(0x100)]), null;
  }
}
function _0x5497() {
  const _0x14f5cd = [
    "1829870ljeOcL",
    "21442eIrNYr",
    "error",
    "12fGViCJ",
    "8228290LMbXiD",
    "response",
    "5571568WGEUcC",
    "data",
    "3549330WcDJyy",
    "9bJckZf",
    "Envato\x20API\x20error:",
    "5950820tSrVUM",
    "42hHXmAw",
    "message",
    "trim",
    "10LjuEdW",
    "https://api.envato.com/v3/market/author/sale",
    "35445432Ppyoyf",
    "../../models/login.model",
  ];
  _0x5497 = function () {
    return _0x14f5cd;
  };
  return _0x5497();
}

//admin create
function _0x379c() {
  const _0x401d52 = [
    "8BtGUfb",
    "email",
    "save",
    "212061EoYiYs",
    "5294919FLpViq",
    "status",
    "userLicenseKey",
    "Oops!\x20Invalid\x20details!",
    "Admin\x20Created\x20Successfully!",
    "password",
    "115vnaLkv",
    "781114MLmZaD",
    "913308QBpkhL",
    "1196235TeVghy",
    "28bdwKWe",
    "login",
    "doctorLicenseKey",
    "Internal\x20Server\x20Error",
    "item",
    "50gBIULN",
    "Invalid\x20user\x20purchase\x20code!",
    "trim",
    "json",
    "2598eiwRRs",
    "Invalid\x20doctor\x20purchase\x20code!",
    "119250SRFOQj",
    "store",
    "error",
    "message",
  ];
  _0x379c = function () {
    return _0x401d52;
  };
  return _0x379c();
}
const _0x5e8b9d = _0x41de;
function _0x41de(_0x527462, _0x9b7af0) {
  const _0x379ccd = _0x379c();
  return (
    (_0x41de = function (_0x41de24, _0x321ac7) {
      _0x41de24 = _0x41de24 - 0x69;
      let _0x3065b9 = _0x379ccd[_0x41de24];
      return _0x3065b9;
    }),
    _0x41de(_0x527462, _0x9b7af0)
  );
}
(function (_0x1afe11, _0x1e407f) {
  const _0x3eee10 = _0x41de,
    _0x1a2e80 = _0x1afe11();
  while (!![]) {
    try {
      const _0x2a632e =
        parseInt(_0x3eee10(0x69)) / 0x1 +
        -parseInt(_0x3eee10(0x78)) / 0x2 +
        (parseInt(_0x3eee10(0x70)) / 0x3) * (parseInt(_0x3eee10(0x7b)) / 0x4) +
        (parseInt(_0x3eee10(0x77)) / 0x5) * (parseInt(_0x3eee10(0x84)) / 0x6) +
        (parseInt(_0x3eee10(0x71)) / 0x7) * (parseInt(_0x3eee10(0x6d)) / 0x8) +
        (-parseInt(_0x3eee10(0x7a)) / 0x9) * (parseInt(_0x3eee10(0x80)) / 0xa) +
        parseInt(_0x3eee10(0x79)) / 0xb;
      if (_0x2a632e === _0x1e407f) break;
      else _0x1a2e80["push"](_0x1a2e80["shift"]());
    } catch (_0x50f936) {
      _0x1a2e80["push"](_0x1a2e80["shift"]());
    }
  }
})(_0x379c, 0x63b0b),
  (exports[_0x5e8b9d(0x6a)] = async (_0xb2bb24, _0x5f43f5) => {
    const _0x566f9d = _0x5e8b9d;
    try {
      const { email: _0x40965d, password: _0x102c95, userLicenseKey: _0x3d57e0, doctorLicenseKey: _0x39488e } = _0xb2bb24["body"];
      if (!_0x40965d || !_0x102c95 || !_0x3d57e0 || !_0x39488e) return _0x5f43f5[_0x566f9d(0x72)](0xc8)[_0x566f9d(0x83)]({ status: ![], message: _0x566f9d(0x74) });
      const _0xdc3918 = 0x32db9f6,
        _0x350e78 = 0x32db9c3,
        _0x1a29ab = await verifyPurchaseCode(_0x39488e);
      if (!_0x1a29ab || _0x1a29ab[_0x566f9d(0x7f)]?.["id"] !== _0xdc3918) return _0x5f43f5[_0x566f9d(0x72)](0xc8)[_0x566f9d(0x83)]({ status: ![], message: _0x566f9d(0x85) });
      const _0x582979 = await verifyPurchaseCode(_0x3d57e0);
      if (!_0x582979 || _0x582979[_0x566f9d(0x7f)]?.["id"] !== _0x350e78) return _0x5f43f5[_0x566f9d(0x72)](0xc8)[_0x566f9d(0x83)]({ status: ![], message: _0x566f9d(0x81) });
      const _0xbda076 = new Admin();
      (_0xbda076[_0x566f9d(0x6e)] = _0x40965d[_0x566f9d(0x82)]()),
        (_0xbda076[_0x566f9d(0x76)] = cryptr["encrypt"](_0x102c95)),
        (_0xbda076[_0x566f9d(0x73)] = _0x3d57e0[_0x566f9d(0x82)]()),
        (_0xbda076[_0x566f9d(0x7d)] = _0x39488e[_0x566f9d(0x82)]()),
        await _0xbda076["save"]();
      let _0x2ae7cf = await Login["findOne"]({});
      if (!_0x2ae7cf) {
        const _0x246936 = new Login({ login: !![] });
        await _0x246936[_0x566f9d(0x6f)]();
      } else (_0x2ae7cf[_0x566f9d(0x7c)] = !![]), await _0x2ae7cf[_0x566f9d(0x6f)]();
      return _0x5f43f5[_0x566f9d(0x72)](0xc8)[_0x566f9d(0x83)]({ status: !![], message: _0x566f9d(0x75), admin: _0xbda076 });
    } catch (_0x4a98e5) {
      return console[_0x566f9d(0x6b)](_0x4a98e5), _0x5f43f5[_0x566f9d(0x72)](0x1f4)[_0x566f9d(0x83)]({ status: ![], message: _0x4a98e5[_0x566f9d(0x6c)] || _0x566f9d(0x7e) });
    }
  });

//admin login
function _0x2f2e() {
  const _0x5e0d14 = [
    "447489WAVfHp",
    "doctorLicenseKey",
    "body",
    "6tXPTHQ",
    "message",
    "item",
    "JWT_SECRET",
    "decrypt",
    "1029565pzKtlo",
    "json",
    "19976cWhTyY",
    "image",
    "2235338DMWeND",
    "log",
    "status",
    "1ylclYg",
    "login",
    "Invalid\x20doctor\x20purchase\x20code!",
    "password",
    "527314PNMihe",
    "4UJnOHM",
    "Admin\x20login\x20Successfully.",
    "userLicenseKey",
    "trim",
    "name",
    "2922210NpAXIS",
    "_id",
    "1572OkTMGK",
    "8YCcYpo",
    "Oops!\x20Admin\x20not\x20found\x20with\x20that\x20email.",
    "1436103zacpee",
    "Oops!\x20Password\x20doesn\x27t\x20match!",
  ];
  _0x2f2e = function () {
    return _0x5e0d14;
  };
  return _0x2f2e();
}
const _0x8a10dc = _0x2164;
function _0x2164(_0x5157c5, _0x4bfd14) {
  const _0x2f2e08 = _0x2f2e();
  return (
    (_0x2164 = function (_0x21648d, _0x241cff) {
      _0x21648d = _0x21648d - 0x150;
      let _0x9c6048 = _0x2f2e08[_0x21648d];
      return _0x9c6048;
    }),
    _0x2164(_0x5157c5, _0x4bfd14)
  );
}
(function (_0x334d66, _0x260fce) {
  const _0x5ae5c1 = _0x2164,
    _0x39cd3a = _0x334d66();
  while (!![]) {
    try {
      const _0x3b3e24 =
        (parseInt(_0x5ae5c1(0x162)) / 0x1) * (-parseInt(_0x5ae5c1(0x166)) / 0x2) +
        parseInt(_0x5ae5c1(0x153)) / 0x3 +
        (-parseInt(_0x5ae5c1(0x167)) / 0x4) * (parseInt(_0x5ae5c1(0x15b)) / 0x5) +
        (-parseInt(_0x5ae5c1(0x156)) / 0x6) * (-parseInt(_0x5ae5c1(0x15f)) / 0x7) +
        (-parseInt(_0x5ae5c1(0x16f)) / 0x8) * (-parseInt(_0x5ae5c1(0x151)) / 0x9) +
        parseInt(_0x5ae5c1(0x16c)) / 0xa +
        (-parseInt(_0x5ae5c1(0x15d)) / 0xb) * (parseInt(_0x5ae5c1(0x16e)) / 0xc);
      if (_0x3b3e24 === _0x260fce) break;
      else _0x39cd3a["push"](_0x39cd3a["shift"]());
    } catch (_0x179031) {
      _0x39cd3a["push"](_0x39cd3a["shift"]());
    }
  }
})(_0x2f2e, 0x33f53),
  (exports[_0x8a10dc(0x163)] = async (_0x12ff21, _0x3a6667) => {
    const _0xfcc65c = _0x8a10dc;
    try {
      const { email: _0x17b977, password: _0x56d042 } = _0x12ff21[_0xfcc65c(0x155)];
      if (!_0x17b977 || !_0x56d042) return _0x3a6667["status"](0xc8)["json"]({ status: ![], message: "Oops!\x20Invalid\x20details!" });
      const _0x4e4c7e = await Admin["findOne"]({ email: _0x17b977[_0xfcc65c(0x16a)]() })["lean"]();
      if (!_0x4e4c7e) return _0x3a6667[_0xfcc65c(0x161)](0xc8)["json"]({ status: ![], message: _0xfcc65c(0x150) });
      if (cryptr[_0xfcc65c(0x15a)](_0x4e4c7e[_0xfcc65c(0x165)]) !== String(_0x56d042)) return _0x3a6667["status"](0xc8)[_0xfcc65c(0x15c)]({ status: ![], message: _0xfcc65c(0x152) });
      const _0x496589 = 0x32db9c3,
        _0x7e12a8 = 0x32db9f6,
        _0x84ac48 = await verifyPurchaseCode(_0x4e4c7e[_0xfcc65c(0x169)]);
      if (!_0x84ac48 || _0x84ac48[_0xfcc65c(0x158)]?.["id"] !== _0x496589) return _0x3a6667["status"](0xc8)["json"]({ status: ![], message: "Invalid\x20user\x20purchase\x20code!" });
      const _0x3b71df = await verifyPurchaseCode(_0x4e4c7e[_0xfcc65c(0x154)]);
      if (!_0x3b71df || _0x3b71df["item"]?.["id"] !== _0x7e12a8) return _0x3a6667[_0xfcc65c(0x161)](0xc8)[_0xfcc65c(0x15c)]({ status: ![], message: _0xfcc65c(0x164) });
      const _0x527aec = { _id: _0x4e4c7e[_0xfcc65c(0x16d)], name: _0x4e4c7e[_0xfcc65c(0x16b)], email: _0x4e4c7e["email"], image: _0x4e4c7e[_0xfcc65c(0x15e)], password: _0x4e4c7e["password"] },
        _0x2cdc46 = jwt["sign"](_0x527aec, process["env"][_0xfcc65c(0x159)]);
      return _0x3a6667[_0xfcc65c(0x161)](0xc8)[_0xfcc65c(0x15c)]({ status: !![], message: _0xfcc65c(0x168), data: _0x2cdc46 });
    } catch (_0x47635d) {
      return console[_0xfcc65c(0x160)](_0x47635d), _0x3a6667[_0xfcc65c(0x161)](0x1f4)[_0xfcc65c(0x15c)]({ status: ![], message: _0x47635d[_0xfcc65c(0x157)] || "Internal\x20Server\x20Error" });
    }
  });

// get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not Exist" });
    }
    return res.status(200).json({ status: true, message: "success", data: admin });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
};

//update admin profile
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).send({ status: false, message: "admin not exists" });
    }

    if (req.file) {
      var image_ = admin.image.split("storage");
      if (image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }

      admin.image = req.file ? process?.env?.baseURL + req?.file?.path : admin.image;
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;

    await admin.save();

    return res.status(200).send({ status: true, message: "success!!", admin });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" || error });
  }
};

//update admin password
exports.updateAdminPassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    const admin = await Admin.findById(req.admin._id);
    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
      return res.status(200).send({ status: false, message: "old password is Invalid" });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).send({ status: false, message: "password does not match" });
    }

    admin.password = cryptr.encrypt(req.body.newPass);
    await admin.save();
    return res.status(200).send({ status: true, message: "password updated", admin });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" || error });
  }
};
