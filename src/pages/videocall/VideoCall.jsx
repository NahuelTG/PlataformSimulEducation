import React, { useState, useRef, useEffect, useContext } from "react";
import Peer from "peerjs";
import { UserContext } from "../../context/UserContext";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../connection/firebaseConfig";
import { Autocomplete, TextField, Button, Grid, Typography, IconButton, Snackbar, Alert } from "@mui/material";
import { styled } from "@mui/system";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

const StyledButton = styled(Button)(({ theme }) => ({
   backgroundColor: "black",
   color: "white",
   "&:hover": {
      backgroundColor: "grey",
   },
}));

const VideoCall = () => {
   const [peer, setPeer] = useState(null);
   const [localStream, setLocalStream] = useState(null);
   const [remoteStream, setRemoteStream] = useState(null);
   const [remoteUserId, setRemoteUserId] = useState("");
   const [users, setUsers] = useState([]);
   const [isMuted, setIsMuted] = useState(false);
   const [isCameraOff, setIsCameraOff] = useState(false);
   const [incomingCall, setIncomingCall] = useState(null);
   const [notificationOpen, setNotificationOpen] = useState(false);
   const localVideoRef = useRef(null);
   const remoteVideoRef = useRef(null);
   const { currentUser } = useContext(UserContext);
   const uidf = currentUser.uid;

   useEffect(() => {
      const fetchUsers = async () => {
         try {
            const querySnapshot = await getDocs(collection(firestore, "users"));
            const usersList = [];
            querySnapshot.forEach((doc) => {
               const user = doc.data();
               if (user.uid !== currentUser.uid && user.role !== "admin") {
                  usersList.push({
                     label: `${user.username} (${user.role})`,
                     value: doc.id,
                  });
               }
            });
            setUsers(usersList);
         } catch (error) {
            console.error("Error fetching users:", error);
         }
      };
      fetchUsers();
   }, [currentUser.uid]);

   useEffect(() => {
      const newPeer = new Peer(uidf);
      setPeer(newPeer);

      newPeer.on("call", (call) => {
         setIncomingCall(call);
         setNotificationOpen(true);
      });

      newPeer.on("disconnected", () => {
         console.warn("Peer disconnected. Attempting to reconnect...");
         newPeer.reconnect();
      });

      newPeer.on("error", (err) => {
         console.error("Peer error:", err);
      });

      return () => {
         if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
         }
         newPeer.destroy();
      };
   }, [uidf, localStream]);

   const handleAcceptCall = () => {
      if (incomingCall) {
         navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
               setLocalStream(stream);
               localVideoRef.current.srcObject = stream;
               incomingCall.answer(stream);

               incomingCall.on("stream", (remoteStream) => {
                  setRemoteStream(remoteStream);
                  remoteVideoRef.current.srcObject = remoteStream;
               });

               setNotificationOpen(false);
               setIncomingCall(null);
            })
            .catch((error) => {
               console.error("Error accepting call:", error);
               alert("No se pudo acceder a la cámara/micrófono.");
            });
      }
   };

   const handleRejectCall = () => {
      if (incomingCall) {
         incomingCall.close();
         setNotificationOpen(false);
         setIncomingCall(null);
      }
   };

   const toggleMute = () => {
      if (localStream) {
         localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
         setIsMuted((prev) => !prev);
      }
   };

   const toggleCamera = () => {
      if (localStream) {
         localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
         setIsCameraOff((prev) => !prev);
      }
   };

   const handleFullscreen = (videoRef) => {
      if (videoRef.current) {
         videoRef.current.requestFullscreen?.();
      }
   };

   const startCall = () => {
      if (remoteUserId.trim() !== "") {
         navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
               setLocalStream(stream);
               localVideoRef.current.srcObject = stream;
               const call = peer.call(remoteUserId, stream);

               call.on("stream", (remoteStream) => {
                  setRemoteStream(remoteStream);
                  remoteVideoRef.current.srcObject = remoteStream;
               });
            })
            .catch((error) => {
               console.error("Error starting call:", error);
               alert("No se pudo acceder a la cámara/micrófono.");
            });
      } else {
         alert("Por favor selecciona un usuario válido para llamar.");
      }
   };

   const endCall = () => {
      if (localStream) {
         localStream.getTracks().forEach((track) => track.stop());
         localVideoRef.current.srcObject = null; // Limpia el video local
         setLocalStream(null);
      }
      if (remoteStream) {
         remoteStream.getTracks().forEach((track) => track.stop());
         remoteVideoRef.current.srcObject = null; // Limpia el video remoto
         setRemoteStream(null);
      }
      if (peer) {
         peer.destroy();
         setPeer(new Peer(uidf));
      }
   };

   return (
      <div>
         <Typography variant="h4" gutterBottom>
            Video Llamada
         </Typography>
         <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
               <video ref={localVideoRef} autoPlay muted style={{ width: "100%", border: "1px solid black" }} />
               <div>
                  <IconButton onClick={() => handleFullscreen(localVideoRef)}>
                     <FullscreenIcon />
                  </IconButton>
               </div>
            </Grid>
            <Grid item xs={12} sm={6}>
               <video ref={remoteVideoRef} autoPlay style={{ width: "100%", border: "1px solid black" }} />
               <div>
                  <IconButton onClick={() => handleFullscreen(remoteVideoRef)}>
                     <FullscreenIcon />
                  </IconButton>
               </div>
            </Grid>
         </Grid>
         <Autocomplete
            options={users}
            getOptionLabel={(option) => option.label}
            onChange={(event, newValue) => {
               setRemoteUserId(newValue ? newValue.value : "");
            }}
            renderInput={(params) => <TextField {...params} label="Select User" variant="outlined" />}
            style={{ marginTop: 20, marginBottom: 20 }}
         />
         <div>
            <IconButton onClick={toggleMute}>{isMuted ? <MicOffIcon /> : <MicIcon />}</IconButton>
            <IconButton onClick={toggleCamera}>{isCameraOff ? <VideocamOffIcon /> : <VideocamIcon />}</IconButton>
         </div>
         <Button variant="contained" onClick={startCall} style={{ marginRight: 10 }}>
            Iniciar llamada
         </Button>
         <StyledButton variant="contained" onClick={endCall} startIcon={<CallEndIcon />}>
            Colgar llamada
         </StyledButton>

         <Snackbar open={notificationOpen} onClose={() => setNotificationOpen(false)}>
            <Alert
               onClose={() => setNotificationOpen(false)}
               severity="info"
               action={
                  <>
                     <Button color="inherit" size="small" onClick={handleAcceptCall}>
                        Aceptar
                     </Button>
                     <Button color="inherit" size="small" onClick={handleRejectCall}>
                        Rechazar
                     </Button>
                  </>
               }
            >
               Tienes una llamada entrante.
            </Alert>
         </Snackbar>
      </div>
   );
};

export default VideoCall;
