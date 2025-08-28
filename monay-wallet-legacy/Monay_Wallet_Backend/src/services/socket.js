export default function (io) {
  io.sockets.on('connect', (socket) => {
    // join socket 
    socket.on("join", async (data) => {

    });
    // disconnect 
    socket.on('disconnect', () => {

    });
  });
}