import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';
import VideoGrid from './VideoGrid';
import OptionsBar from './OptionsBar';
import { useParams } from 'react-router-dom';

const socket = io("http://localhost:3030"); // Conectar ao backend

const VideoChat = () => {
    const { roomId } = useParams();
    const [myVideoStream, setMyVideoStream] = useState(null);
    const [peers, setPeers] = useState({});
    const videoGridRef = useRef();  // Referência ao grid de vídeos
    const myVideoRef = useRef();    // Referência ao próprio vídeo
    const myPeer = useRef(null);    // Referência ao objeto PeerJS

    // Função para conectar um novo usuário, usando useCallback para memoização
    const connectToNewUser = useCallback((userId, stream) => {
        console.log('Chamando novo usuário:', userId);

        const call = myPeer.current.call(userId, stream);  // Chamar o novo usuário

        // Criar o elemento de vídeo fora do evento 'stream' para manter a referência
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            console.log('Recebendo fluxo de vídeo de', userId, 'Stream:', userVideoStream);

            // Garantir que o stream contém vídeo
            const videoTrack = userVideoStream.getVideoTracks()[0];
            if (!videoTrack) {
                console.error('Track de vídeo não habilitada ou ausente:', videoTrack);
                return;
            }

            // Adicionar o vídeo ao DOM
            addVideoStream(video, userVideoStream);  // Adicionar vídeo de outro usuário
        });

        call.on('close', () => {
            console.log('Chamada fechada com', userId);
            if (video && video.parentNode) {
                video.parentNode.removeChild(video);  // Remover vídeo do DOM
            }
        });

        call.on('error', (err) => {
            console.error('Erro na chamada peer:', err);
        });

        setPeers(prevPeers => ({ ...prevPeers, [userId]: call }));
    }, [peers]);

    const addVideoStream = (video, stream) => {
        console.log("Adicionando vídeo ao DOM");

        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) {
            console.error("A track de vídeo não está presente.");
            return;  // Não prossiga se não houver track de vídeo
        }

        video.srcObject = stream;
        video.classList.add('remote-video');

        video.addEventListener('loadedmetadata', () => {
            video.play().then(() => {
                console.log('Vídeo reproduzido com sucesso');
            }).catch(error => {
                console.error('Erro ao reproduzir o vídeo:', error);
            });

            // Verifique se videoGridRef.current existe antes de tentar adicionar o vídeo ao DOM
            if (videoGridRef.current) {
                videoGridRef.current.append(video);
                console.log('Vídeo adicionado ao DOM:', video);
            } else {
                console.error('videoGridRef.current está null. Não foi possível adicionar o vídeo ao DOM.');
            }
        });

        console.log('Função addVideoStream finalizada');
    };


    useEffect(() => {
        const user = prompt("Enter your name");

        // Inicializar PeerJS
        myPeer.current = new Peer(undefined, {
            host: 'localhost',
            port: 3030,
            path: '/peerjs',
            config: {
                iceServers: [
                    { url: 'stun:stun.l.google.com:19302' }, // Servidor STUN para conectividade
                ],
            },
        });

        // Capturar stream de vídeo e áudio
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setMyVideoStream(stream);
                myVideoRef.current.srcObject = stream;
                myVideoRef.current.muted = true;  // Silenciar o próprio áudio
                addVideoStream(myVideoRef.current, stream);  // Adicionar o próprio vídeo ao DOM

                // Atender chamadas recebidas
                myPeer.current.on('call', call => {
                    call.answer(stream);  // Responder com o próprio stream
                    const video = document.createElement('video');
                    call.on('stream', userVideoStream => {
                        addVideoStream(video, userVideoStream);  // Adicionar vídeo recebido ao DOM
                    });
                });

                // Quando um novo usuário entra
                socket.on('user-connected', userId => {
                    connectToNewUser(userId, stream);
                });
            })
            .catch(err => {
                console.error("Erro ao acessar a câmera/microfone:", err);
            });

        // Quando a conexão PeerJS for aberta
        myPeer.current.on('open', id => {
            socket.emit('join-room', roomId, id, user);
        });

        // Quando um usuário desconecta
        socket.on('user-disconnected', userId => {
            if (peers[userId]) peers[userId].close();
        });

        // Limpeza quando o componente for desmontado
        return () => {
            if (myPeer.current) {
                myPeer.current.destroy();  // Destruir o peer atual para garantir que não há conexões persistentes
            }
            Object.values(peers).forEach(call => call.close()); // Fechar todas as chamadas ativas
            socket.disconnect();  // Desconectar o socket
        };

    }, [roomId, connectToNewUser, peers]);

    return (
        <div>
            <div className="header">
                <div className="logo">
                    <h3>Video Chat</h3>
                </div>
            </div>
            <div className="main">
                <div className="main_left">
                    <VideoGrid videoGridRef={videoGridRef} myVideoRef={myVideoRef} />
                    <OptionsBar myVideoStream={myVideoStream} />
                </div>
            </div>
        </div>
    );
};

export default VideoChat;
