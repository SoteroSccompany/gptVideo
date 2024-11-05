const express = require("express");
const cors = require("cors");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const socketio = require("socket.io");
const { ExpressPeerServer } = require("peer");

const app = express();

app.use(cors()); // Adiciona o CORS para permitir requisições do frontend

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
    },
});

const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

// Redirecionar para gerar uma sala com ID único
app.get("/", (req, res) => {
    res.json({ roomId: 'd7ea511b-924e-408e-a45b-5e8a95a6be65' });
});

// WebSockets com Socket.IO para gerenciar a comunicação
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        console.log(`User ${userId} joined room ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);

        socket.on("disconnect", () => {
            console.log(`User ${userId} disconnected`);
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });
});

// Inicializar o servidor
server.listen(3030, () => {
    console.log("Servidor rodando na porta 3030");
});
