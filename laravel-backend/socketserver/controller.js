module.exports = function(io) {
  function handleConnection() {
    // Emit a custom event to the connected client
	console.log("INSIDE CONTROLLER")
    io.sockets.emit('chatMessage', 'Hello from the server!');
  }

  function handleDisconnection(socket) {
    // Perform necessary actions on socket disconnection
  }

  return {
    handleConnection,
    handleDisconnection
  };
};
