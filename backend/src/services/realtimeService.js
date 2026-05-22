let ioInstance = null;

function setSocketServer(io) {
  ioInstance = io;
}

function emitToAdmins(event, payload) {
  if (ioInstance) ioInstance.to("admins").emit(event, payload);
}

function emitToUser(userId, event, payload) {
  if (ioInstance) ioInstance.to(`user:${userId}`).emit(event, payload);
}

module.exports = { setSocketServer, emitToAdmins, emitToUser };
