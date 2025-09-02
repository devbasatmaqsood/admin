const { generateId } = require("./middleware/generateId");
const admin = require("./firebase");

const moment = require("moment");

const mongoose = require("mongoose");

const Doctor = require("./models/doctor.model");
const ChatTopic = require("./models/chatTopic.model");
const CallHistory = require("./models/callHistory.model");
const Chat = require("./models/chat.model");
const User = require("./models/user.model");

io.on("connection", async (socket) => {
  console.log("Socket Connection done Client ID: ", socket.id);
  console.log("socket.connected:           ", socket.connected);
  console.log("Current rooms:", socket.rooms);
  console.log("socket.handshake.query", socket.handshake.query);

  const { globalRoom } = socket.handshake.query;
  const id = globalRoom && globalRoom.split(":")[1];
  console.log("socket connected with userId:   ", id);

  socket.join(globalRoom);

  //chat
  socket.on("message", async (data) => {
    console.log("data in message =====================================  ", data);

    const chatTopic = await ChatTopic.findById(data?.chatTopicId).populate("doctor user");

    const doctorRoom = "globalRoom:" + chatTopic?.doctor?._id.toString();
    const userRoom = "globalRoom:" + chatTopic?.user?._id.toString();

    io.in(doctorRoom).emit("message", data);
    io.in(userRoom).emit("message", data);

    const socket1 = await io.in(doctorRoom).fetchSockets();
    console.log("socket1 in message:", socket1.length);

    const socket2 = await io.in(userRoom).fetchSockets();
    console.log("socket2 in message:", socket2.length);

    let chat;

    if (chatTopic && data?.messageType == 1) {
      chat = new Chat();
      chat.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      chat.doctor = chatTopic?.doctor;
      chat.user = chatTopic?.user;
      chat.messageType = 1;
      chat.message = data?.message;
      chat.image = "";
      chat.chatTopic = chatTopic._id;
      chat.role = data?.role;
      await chat.save();

      chatTopic.chat = chat._id;
      await chatTopic.save();

      let receiver = {};
      let sender = {};

      if (data.role === "doctor") {
        sender = chatTopic.doctor;
        receiver = chatTopic.user;
      } else if (data.role === "user") {
        sender = chatTopic.user;
        receiver = chatTopic.doctor;
      }

      console.log("data.role", data.role);

      if (!receiver?.isBlock) {
        const payload = {
          token: receiver?.fcmToken,
          notification: {
            title: sender?.name,
            body: `${sender?.name} sent a message: ${data?.message}`,
            image: sender.image,
          },
          data: {
            senderId: sender._id.toString(),
            receiverId: receiver._id.toString(),
            chatTopic: chatTopic._id.toString(),
            senderImage: sender.image,
            receiverImage: receiver.image,
            designation: receiver.designation ? receiver.designation : sender.designation,
            senderName: sender.name,
            receiverName: receiver.name,
          },
        };

        const adminPromise = await admin;
        if (receiver && receiver?.fcmToken !== null) {
          try {
            const response = await adminPromise.messaging().send(payload);
            console.log("Successfully sent message:", response);
          } catch (error) {
            console.log("Error sending message:", error);
          }
        }

        if (receiver.webFcmToken !== null) {
          const webPayload = {
            token: receiver.webFcmToken,
            notification: {
              title: sender?.name,
              body: `${sender?.name} sent a message: ${data?.message}`,
              image: sender.image,
            },
            data: {
              senderId: sender._id.toString(),
              chatTopicId: chatTopic._id.toString(),
            },
          };

          try {
            const webResponse = await adminPromise.messaging().send(webPayload);
            console.log("Successfully sent web message:", webResponse);
          } catch (error) {
            console.error("Error sending web message:", error);
          }
        }
      }
    }
  });

  socket.on("messageRead", async (data) => {
    console.log("Data in messageRead event:", data);

    try {
      const { messageIds } = data;

      await Chat.updateMany({ _id: { $in: messageIds } }, { $set: { isRead: true } });

      console.log(`Updated isRead to true for messages with IDs: ${messageIds}`);
    } catch (error) {
      console.error("Error updating messages:", error);
    }
  });

  //call
  socket.on("makeCall", async (data) => {
    console.log("makeCall API data ==============================", data);

    let caller, receiver;
    if (data?.role == "doctor") {
      console.log(" make call  role === doctor");

      [caller, receiver] = await Promise.all([Doctor.findById(data?.doctorId), User.findById(data?.userId)]);

      if (!caller) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "doctor does not found.");
      }

      if (caller.isBlock) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "doctor is blocked by the admin.", { isBlock: true });
      }

      if (caller.isBusy && caller.callId) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "Oops ! doctor busy with someone else.", { isBusy: true });
      }

      if (!receiver) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "patient does not found.");
      }

      if (receiver.isBlock) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "patient blocked by the admin.", { isBlock: true });
      }

      if (receiver.isBusy && receiver.callId !== "") {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "Oops ! patient is busy with someone else.", { isBusy: true });
      }

      console.log("receiver.isBusy", receiver.isBusy, "receiver.callId:", receiver.callId);
      console.log("caller.isBusy", caller.isBusy, "caller.callId: ", caller.callId);

      if (!receiver.isBusy && receiver.callId == "") {
        console.log("receiver callId null then emited");

        //history for make call
        const callHistory = new CallHistory();
        callHistory.doctor = caller._id;
        callHistory.user = receiver._id;
        callHistory.callStartTime = moment(new Date()).format("HH:mm:ss");
        callHistory.role = "doctor";
        callHistory.callId = generateId();
        caller.isBusy = true;
        caller.callId = callHistory._id;

        receiver.isBusy = true;
        receiver.callId = callHistory._id;

        await Promise.all([callHistory.save(), caller.save(), receiver.save()]);

        const dataOfVideoCall = {
          doctor: caller._id,
          user: receiver._id,
          callerImage: caller.image,
          callerName: caller.name,
          receiverName: receiver.name,
          receiverImage: receiver.image,
          callId: callHistory._id,
          role: "doctor",
        };

        const socket2 = await io.in("globalRoom:" + receiver._id).fetchSockets();
        console.log("socket2 in makeCall:", socket2.length, receiver._id);

        io.in("globalRoom:" + receiver._id).emit("callRequest", dataOfVideoCall);

        io.in("globalRoom:" + caller._id).emit("makeCall", dataOfVideoCall); //for data emit to caller
      } else {
        console.log("Condition not met");
      }
    } else if (data?.role == "user") {
      console.log(" make call  role === user");
      [caller, receiver] = await Promise.all([User.findById(data?.userId), Doctor.findById(data?.doctorId)]);

      if (!caller) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "user does not found.");
      }

      if (caller.isBlock) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "user blocked by the admin.", { isBlock: true });
      }

      if (caller.isBusy && caller.callId) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "Oops ! user busy with someone else.", { isBusy: true });
      }

      if (!receiver) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "doctor does not found.");
      }

      if (receiver.isBlock) {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "doctor blocked by the admin.", { isBlock: true });
      }

      if (receiver.isBusy && receiver.callId === "") {
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "Oops ! doctor busy with other patient.", { isBusy: true });
      }

      console.log("receiver.isBusy", receiver.isBusy, "receiver.callId:", receiver.callId);
      console.log("caller.isBusy", caller.isBusy, "caller.callId: ", caller.callId);

      console.log("receiver.isBusy", receiver.isBusy, "receiver.callId:", receiver.callId);
      console.log("caller.isBusy", caller.isBusy, "caller.callId: ", caller.callId);

      if (!receiver.isBusy && receiver.callId == "") {
        console.log("receiver callId null then emmited");

        //history for make call
        const callHistory = new CallHistory();
        callHistory.user = caller._id;
        callHistory.doctor = receiver._id;
        callHistory.callStartTime = moment(new Date()).format("HH:mm:ss");
        callHistory.role = "user";
        //caller.isBusy = true;
        caller.callId = callHistory._id;
        callHistory.callId = generateId();

        //receiver.isBusy = true;
        receiver.callId = callHistory._id;

        await Promise.all([callHistory.save(), caller.save(), receiver.save()]);

        const dataOfVideoCall = {
          doctor: receiver._id,
          user: caller._id,
          callerImage: caller.image,
          callerName: caller.name,
          receiverName: receiver.name,
          receiverImage: receiver.image,
          callId: callHistory._id,
          role: "user",
        };

        console.log("dataOfVideoCall-----------", dataOfVideoCall);
        io.in("globalRoom:" + receiver._id.toString()).emit("callRequest", dataOfVideoCall);
        io.in("globalRoom:" + caller._id.toString()).emit("makeCall", dataOfVideoCall); //for data emit to caller
      } else {
        console.log("Condition not met 361");
      }
    }
  });

  //callAnswer when accept and connect the call
  socket.on("callAnswer", async (data) => {
    console.log("callAnswer data ==============================", data);

    const userIdRoom = "globalRoom:" + data.userId;
    const doctorIdRoom = "globalRoom:" + data.doctorId;
    const role = data.role;

    let caller, receiver;

    const callHistory = await CallHistory.findById(data.callId);

    if (role == "user") {
      [caller, receiver] = await Promise.all([Doctor.findById(data.doctorId), User.findById(data.userId)]);

      const response = {
        ...data,
        callerImage: caller.image,
        callerName: caller.name,
        receiverName: receiver.name,
        receiverImage: receiver.image,
        designation: caller.designation,
      };

      if (!data.isAccept) {
        console.log("isAccept false ", data.isAccept);

        io.in(userIdRoom).emit("callAnswer", response);
        io.in(doctorIdRoom).emit("callAnswer", response);

        let chatTopic;
        chatTopic = await ChatTopic.findOne({
          doctor: data.doctorId,
          user: data.userId,
        });

        const chat = new Chat();

        if (!chatTopic) {
          console.log("come here------------424");
          chatTopic = new ChatTopic();

          chatTopic.chat = chat._id;
          chatTopic.doctor = caller._id;
          chatTopic.user = receiver._id;
        }

        chat.chatTopic = chatTopic._id;
        chat.doctor = data.doctorId;
        chat.user = data.userId;
        chat.messageType = 5;
        chat.message = "📽 Video Call";
        chat.callType = 2; // 2.declined
        chat.callId = data?.callId;
        chat.isRead = true;
        chat.date = data?.time;
        chat.role = "doctor";
        chatTopic.chat = chat._id;

        callHistory.callEndTime = moment().format("HH:mm:ss");

        var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
        var date2 = moment(callHistory.callEndTime, "HH:mm:ss");
        var timeDifference = date2.diff(date1);
        var duration = moment.duration(timeDifference);
        var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

        callHistory.callConnect = false;
        callHistory.duration = durationTime;

        const [receiverUpdate] = await Promise.all([
          User.findOneAndUpdate({ _id: data.userId }, { $set: { isBusy: false, callId: "" } }, { new: true }),
          chat.save(),
          chatTopic.save(),
          callHistory.save(),
        ]);

        console.log("receiverUpdate in callAnswer isAccept false: ", receiverUpdate.isBusy, receiverUpdate.callId);
      } else {
        console.log("isAccept true ", data.isAccept);

        if (receiver.callId === data.callId) {
          console.log("callAnswer emit to Caller ===============");

          io.in(userIdRoom).emit("callAnswer", response);
          io.in(doctorIdRoom).emit("callAnswer", response);

          let chatTopic;
          chatTopic = await ChatTopic.findOne({
            doctor: data.doctorId,
            user: data.userId,
          });

          const chat = new Chat();

          if (!chatTopic) {
            console.log("come here------------492");
            chatTopic = new ChatTopic();

            chatTopic.chat = chat._id;
            chatTopic.doctor = data.doctorId;
            chatTopic.user = data.userId;
          }

          chat.chatTopic = chatTopic._id;
          chat.doctor = data.doctorId;
          chat.user = data.userId;
          chat.messageType = 5;
          chat.message = "📽 Video Call";
          chat.callType = 1; //1.received
          chat.callId = data.callId;
          chat.date = data?.time;
          chat.role = "doctor";

          chatTopic.chat = chat._id;

          await Promise.all([
            chat.save(),
            chatTopic.save(),
            CallHistory.findOneAndUpdate(
              { _id: callHistory._id },
              {
                $set: {
                  callConnect: true,
                  callStartTime: moment().format("HH:mm:ss"),
                },
              },
              { new: true }
            ),
          ]);

          console.log("receiver available ........... receiver call accept......... ");

          const socket1 = await io.in(doctorIdRoom).fetchSockets();
          const socket2 = await io.in(userIdRoom).fetchSockets();

          socket1?.length ? socket1[0].join(data.doctorId) : console.log("socket1 not able to emit");
          socket2?.length ? socket2[0].join(data.userId) : console.log("socket2 not able to emit");

          const xyz = io.sockets.adapter.rooms.get(globalRoom);
          console.log("callId joined sockets in callAnswer ====================================: ", xyz);
        } else {
          console.log("callCancel emit to user if isAccept false ==================", data.userId);

          const response = {
            ...data,
            callerImage: caller.image,
            callerName: caller.name,
            receiverName: receiver.name,
            receiverImage: receiver.image,
            designation: caller.designation,
          };

          io.in(userIdRoom).emit("callCancel", response);
          io.in(doctorIdRoom).emit("callCancel", response);
        }
      }
    } else if (role === "doctor") {
      [caller, receiver] = await Promise.all([User.findById(data.userId), Doctor.findById(data.doctorId)]);
      const response = {
        ...data,
        callerImage: caller.image,
        callerName: caller.name,
        receiverName: receiver.name,
        receiverImage: receiver.image,
        designation: receiver.designation,
      };

      if (!data.isAccept) {
        console.log("isAccept false ", data.isAccept);

        io.in(doctorIdRoom).emit("callAnswer", response);
        io.in(userIdRoom).emit("callAnswer", response);
        let chatTopic;
        chatTopic = await ChatTopic.findOne({
          doctor: data.doctorId,
          user: data.userId,
        });

        const chat = new Chat();

        if (!chatTopic) {
          console.log("come here------------594");
          chatTopic = new ChatTopic();

          chatTopic.chat = chat._id;
          chatTopic.doctor = data.doctorId;
          chatTopic.user = data.userId;
        }

        chat.chatTopic = chatTopic._id;
        chat.doctor = data.doctorId;
        chat.user = data.userId;
        chat.messageType = 5;
        chat.message = "📽 Video Call";
        chat.callType = 2; // 2.declined
        chat.callId = data?.callId;
        chat.isRead = true;
        chat.role = "user";
        chat.date = data?.time;

        chatTopic.chat = chat._id;

        callHistory.callEndTime = moment().format("HH:mm:ss");

        var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
        var date2 = moment(callHistory.callEndTime, "HH:mm:ss");
        var timeDifference = date2.diff(date1);
        var duration = moment.duration(timeDifference);
        var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

        callHistory.callConnect = false;
        callHistory.duration = durationTime;

        const [receiverUpdate] = await Promise.all([
          Doctor.findOneAndUpdate({ _id: callHistory.doctor }, { $set: { isBusy: false, callId: "" } }, { new: true }),
          chat.save(),
          chatTopic.save(),
          callHistory.save(),
        ]);

        console.log("receiverUpdate in callAnswer isAccept false: ", receiverUpdate.isBusy, receiverUpdate.callId);
      } else {
        console.log("isAccept true ", data.isAccept);

        if (receiver.callId === data.callId) {
          console.log("callAnswer emit to Caller ===============");

          io.in(userIdRoom).emit("callAnswer", response);
          io.in(doctorIdRoom).emit("callAnswer", response);

          let chatTopic;
          chatTopic = await ChatTopic.findOne({
            doctor: data.doctorId,
            user: data.userId,
          });

          const chat = new Chat();

          if (!chatTopic) {
            console.log("come here------------662");
            chatTopic = new ChatTopic();

            chatTopic.chat = chat._id;
            chatTopic.doctor = caller._id;
            chatTopic.user = receiver._id;
          }

          chat.chatTopic = chatTopic._id;
          chat.doctor = data.doctorId;
          chat.user = data.userId;
          chat.messageType = 5;
          chat.message = "📽 Video Call";
          chat.callType = 1; //1.received
          chat.callId = data.callId;
          chat.role = "user";
          chat.date = data?.time;

          chatTopic.chat = chat._id;

          await Promise.all([
            chat.save(),
            chatTopic.save(),
            CallHistory.findOneAndUpdate(
              { _id: callHistory._id },
              {
                $set: {
                  callConnect: true,
                  callStartTime: moment().format("HH:mm:ss"),
                },
              },
              { new: true }
            ),
          ]);

          console.log("receiver available ........... receiver call accept......... ");

          const socket1 = await io.in(doctorIdRoom).fetchSockets();
          const socket2 = await io.in(userIdRoom).fetchSockets();

          socket1?.length ? socket1[0].join(data.callId) : console.log("socket1 not able to emit");
          socket2?.length ? socket2[0].join(data.callId) : console.log("socket2 not able to emit");

          const xyz = io.sockets.adapter.rooms.get(globalRoom);
          console.log("callId joined sockets in callAnswer ====================================: ", xyz);
        } else {
          console.log("callCancel emit to receiver if isAccept false ==================", receiver._id);

          io.in(userIdRoom).emit("callCancel", response);
          io.in(doctorIdRoom).emit("callCancel", response);
        }
      }
    }
  });

  //callCancel when caller cut the call
  socket.on("callCancel", async (data) => {
    console.log("data in callCancel ================", data);

    const callHistory = await CallHistory.findById(data?.callId);
    console.log("callHistory in callCancel:    ", callHistory);

    io.in("globalRoom:" + callHistory?.user).emit("callCancel", data);
    io.in("globalRoom:" + callHistory?.doctor).emit("callCancel", data);

    callHistory.callEndTime = moment().format("HH:mm:ss");

    var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
    var date2 = moment(callHistory.callEndTime, "HH:mm:ss");
    var timeDifference = date2.diff(date1);
    var duration = moment.duration(timeDifference);
    var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

    callHistory.callConnect = false;
    callHistory.duration = durationTime;

    let caller, receiver;
    let role = data?.role;

    if (callHistory) {
      let chatTopic;
      if (role == "doctor") {
        [caller, receiver] = await Promise.all([
          Doctor.findById(callHistory.doctor), //data.callerId
          User.findById(callHistory.user), //data.receiverId
        ]);

        const [callerUpdate, receiverUpdate] = await Promise.all([
          Doctor.findOneAndUpdate({ _id: caller._id }, { $set: { isBusy: false, callId: "" } }, { new: true }),
          User.findOneAndUpdate({ _id: receiver._id }, { $set: { isBusy: false, callId: "" } }, { new: true }),
          callHistory.save(),
        ]);

        console.log("callerUpdate modified: ", callerUpdate.isBusy, callerUpdate.callId);
        console.log("receiverUpdate modified: ", receiverUpdate.isBusy, receiverUpdate.callId);

        chatTopic = await ChatTopic.findOne({
          $or: [
            { doctor: caller._id, user: receiver._id },
            { user: caller._id, doctor: receiver._id },
          ],
        });

        const chat = new Chat();

        if (!chatTopic) {
          console.log("come here------------793");
          chatTopic = new ChatTopic();

          chatTopic.chat = chat._id;
          chatTopic.doctor = caller._id;
          chatTopic.user = receiver._id;
          await chatTopic.save();
        }

        chat.chatTopic = chatTopic._id;
        chat.callId = callHistory._id;
        chat.doctor = callHistory.doctor;
        chat.user = callHistory.user;
        chat.messageType = 5;
        chat.message = "📽 Video Call";
        chat.callType = 3; //3.missedCall
        chat.date = data?.time;
        chat.isRead = true;

        chatTopic.chat = chat._id;

        await Promise.all([chat.save(), chatTopic.save()]);
      } else if (role === "user") {
        [caller, receiver] = await Promise.all([
          User.findById(callHistory.user), //data.callerId
          Doctor.findById(callHistory.doctor), //data.receiverId
        ]);

        const [callerUpdate, receiverUpdate] = await Promise.all([
          User.findOneAndUpdate({ _id: caller._id }, { $set: { isBusy: false, callId: "" } }, { new: true }),
          Doctor.findOneAndUpdate({ _id: receiver._id }, { $set: { isBusy: false, callId: "" } }, { new: true }),
          callHistory.save(),
        ]);
        console.log("callerUpdate modified: ", callerUpdate.isBusy, callerUpdate.callId);
        console.log("receiverUpdate modified: ", receiverUpdate.isBusy, receiverUpdate.callId);

        chatTopic = await ChatTopic.findOne({
          $or: [
            { doctor: caller._id, user: receiver._id },
            { user: caller._id, doctor: receiver._id },
          ],
        });

        const chat = new Chat();
        if (!chatTopic) {
          chatTopic = new ChatTopic();

          chatTopic.chat = chat._id;
          chatTopic.user = caller._id;
          chatTopic.doctor = receiver._id;
          await chatTopic.save();
        }

        chat.chatTopic = chatTopic._id;
        chat.callId = callHistory._id;
        chat.doctor = callHistory.doctor;
        chat.user = callHistory.user;
        chat.messageType = 5;
        chat.message = "📽 Video Call";
        chat.callType = 3; //3.missedCall
        chat.date = data?.time;
        chat.isRead = true;

        chatTopic.chat = chat._id;

        await Promise.all([chat.save(), chatTopic.save()]);
      }
    }

    const payload = {
      token: receiver?.fcmToken,
      notification: {
        title: caller.name,
        body: `Incoming missed call from ${caller.name}.`,
      },
    };

    const adminPromise = await admin;
    if (receiver && receiver?.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
  });

  //callDisconnect when call connect between both users (receiver or caller cut the call)
  socket.on("callDisconnect", async (data) => {
    try {
      console.log("data in callDisconnect ====================", data);

      const callHistory = await CallHistory.findById(data?.callId);
      console.log("callHistory in callDisconnect:    ", callHistory);

      if (!callHistory) {
        console.log("Call history not found");
        return;
      }

      io.in("globalRoom:" + callHistory?.user).emit("callDisconnect", data);
      io.in("globalRoom:" + callHistory?.doctor).emit("callDisconnect", data);

      let role = data?.role;
      let caller, receiver;

      if (role === "doctor") {
        [caller, receiver] = await Promise.all([
          Doctor.findById(callHistory.doctor), //data.callerId
          User.findById(callHistory.user), //data.receiverId
        ]);

        if (!caller) {
          console.log("Caller (Doctor) not found");
        }
        if (!receiver) {
          console.log("Receiver (User) not found");
        }

        if (caller && receiver) {
          callHistory.callEndTime = moment().format("HH:mm:ss");

          const date1 = moment(callHistory.callStartTime, "HH:mm:ss");
          const date2 = moment(callHistory.callEndTime, "HH:mm:ss");
          const timeDifference = date2.diff(date1);
          const duration = moment.duration(timeDifference);
          const durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

          callHistory.callConnect = false;
          callHistory.duration = durationTime;

          const [callerUpdate, receiverUpdate] = await Promise.all([
            Doctor.findOneAndUpdate({ _id: caller._id }, { $set: { isBusy: false, callId: "" } }, { new: true }),
            User.findOneAndUpdate({ _id: receiver._id }, { $set: { isBusy: false, callId: "" } }, { new: true }),
            Chat.findOneAndUpdate(
              { callId: callHistory._id },
              {
                $set: {
                  date: data?.time,
                  callDuration: durationTime,
                  messageType: 5,
                  callType: 1, //1.received
                },
              },
              { new: true }
            ),
            callHistory.save(),
          ]);

          console.log("callerUpdate modified: ", callerUpdate.isBusy);
          console.log("receiverUpdate modified: ", receiverUpdate.isBusy);
        }
      } else if (role === "user") {
        [caller, receiver] = await Promise.all([
          User.findById(callHistory.user), //data.callerId
          Doctor.findById(callHistory.doctor), //data.receiverId
        ]);

        if (!caller) {
          console.log("Caller (User) not found");
        }
        if (!receiver) {
          console.log("Receiver (Doctor) not found");
        }

        if (caller && receiver) {
          callHistory.callEndTime = moment().format("HH:mm:ss");

          const date1 = moment(callHistory.callStartTime, "HH:mm:ss");
          const date2 = moment(callHistory.callEndTime, "HH:mm:ss");
          const timeDifference = date2.diff(date1);
          const duration = moment.duration(timeDifference);
          const durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

          callHistory.callConnect = false;
          callHistory.duration = durationTime;

          const [callerUpdate, receiverUpdate] = await Promise.all([
            User.findOneAndUpdate({ _id: caller._id }, { $set: { isBusy: false, callId: "" } }, { new: true }),
            Doctor.findOneAndUpdate({ _id: receiver._id }, { $set: { isBusy: false, callId: "" } }, { new: true }),
            Chat.findOneAndUpdate(
              { callId: callHistory._id },
              {
                $set: {
                  date: data?.time,
                  callDuration: durationTime,
                  messageType: 5,
                  callType: 1, //1.received
                },
              },
              { new: true }
            ),
            callHistory.save(),
          ]);

          console.log("callerUpdate modified: ", callerUpdate.isBusy);
          console.log("receiverUpdate modified: ", receiverUpdate.isBusy);
        }
      }
    } catch (error) {
      console.error("Error in callDisconnect handler: ", error);
    }
  });

  socket.on("disconnect", async (reason, data) => {
    console.log(`socket disconnect ===============`, id, socket?.id, reason, data);

    if (globalRoom) {
      const socket = await io.in(globalRoom).fetchSockets();
      console.log("socket?.length ", socket?.length);

      if (socket?.length == 0) {
        console.log("socket length is zero with UserId:   ", id);

        const Id = new mongoose.Types.ObjectId(id);

        const user = await User.findOne({ _id: Id });
        if (user) {
          console.log("User Disconnect ====================================================================");

          const sockets = await io.in(user?.callId).fetchSockets();
          console.log("sockets.length in socket disconnect: ", sockets.length);

          sockets?.length ? io.socketsLeave(user?.callId) : console.log("sockets not able to leave in disconnect");

          const userUpdate = await User.findOneAndUpdate({ _id: Id }, { $set: { isOnline: false, isBusy: false, callId: "" } }, { new: true });
          console.log("userUpdate in disconnect: ", userUpdate.isOnline, userUpdate.isBusy, userUpdate.callId);

          if (user.callId !== "") {
            const callId = new mongoose.Types.ObjectId(user.callId);
            console.log("callId in disconnect:   ", callId);

            const callHistory = await CallHistory.findById(callId);
            console.log("callHistory in disconnect:   ", callHistory?._id);

            if (callHistory) {
              callHistory.callEndTime = moment().format("HH:mm:ss");

              var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
              var date2 = moment(callHistory.callEndTime, "HH:mm:ss");
              var timeDifference = date2.diff(date1);
              var duration = moment.duration(timeDifference);
              var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

              callHistory.callConnect = false;
              callHistory.duration = durationTime;

              await Promise.all([
                callHistory.save(),

                Chat.findOneAndUpdate(
                  { callId: callHistory._id },
                  {
                    $set: {
                      date: data?.time,
                      callDuration: durationTime,
                      messageType: 5,
                      callType: 1, //1.received
                      isRead: true,
                    },
                  },
                  { new: true }
                ),
              ]);
            }

            const userUpdate = await User.findOneAndUpdate({ _id: Id }, { $set: { isOnline: false, isBusy: false, callId: "" } }, { new: true });
            console.log("userUpdate in disconnect: ", userUpdate.isOnline, userUpdate.isBusy, userUpdate.callId);
          }
        } else {
          console.log("Doctor Disconnect =========================================================");

          const doctor = await Doctor.findOne({ _id: Id });

          const sockets = await io.in(doctor?.callId).fetchSockets();
          console.log("sockets.length in socket disconnect: ", sockets.length);

          sockets?.length ? io.socketsLeave(doctor?.callId) : console.log("sockets not able to leave in disconnect");

          const doctorUpdate = await Doctor.findOneAndUpdate({ _id: Id }, { $set: { isOnline: false, isBusy: false, callId: "" } }, { new: true });
          console.log("doctorUpdate in disconnect: ", doctorUpdate?.isOnline, doctorUpdate?.isBusy, doctorUpdate?.callId);

          if (doctor.callId !== "") {
            const callId = new mongoose.Types.ObjectId(doctor.callId);
            console.log("callId in disconnect:   ", callId);

            const callHistory = await CallHistory.findById(callId);
            console.log("callHistory in disconnect:   ", callHistory?._id);

            if (callHistory) {
              callHistory.callEndTime = moment().format("HH:mm:ss");

              var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
              var date2 = moment(callHistory.callEndTime, "HH:mm:ss");
              var timeDifference = date2.diff(date1);
              var duration = moment.duration(timeDifference);
              var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

              callHistory.callConnect = false;
              callHistory.duration = durationTime;

              await Promise.all([
                callHistory.save(),

                Chat.findOneAndUpdate(
                  { callId: callHistory._id },
                  {
                    $set: {
                      date: data?.time,
                      callDuration: durationTime,
                      messageType: 5,
                      callType: 1, //1.received
                      isRead: true,
                    },
                  },
                  { new: true }
                ),
              ]);
            }

            const doctorUpdate = await Doctor.findOneAndUpdate({ _id: Id }, { $set: { isOnline: false, isBusy: false, callId: "" } }, { new: true });
            console.log("doctorUpdate in disconnect: ", doctorUpdate.isOnline, doctorUpdate.isBusy, doctorUpdate.callId);
          }
        }
      }
    }
  });
});
