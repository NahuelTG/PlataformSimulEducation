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
   backgroundColor: "red",
   "&:hover": {
      backgroundColor: "darkred",
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
   const [callerName, setCallerName] = useState("");
   const [notificationOpen, setNotificationOpen] = useState(false);
   const [rejectionNotification, setRejectionNotification] = useState(false);
   const localVideoRef = useRef(null);
   const remoteVideoRef = useRef(null);
   const { currentUser } = useContext(UserContext);
   const uidf = currentUser.uid;

   useEffect(() => {
      const fetchUsers = async () => {
         const querySnapshot = await getDocs(collection(firestore, "users"));
         const usersList = [];
         const usernameCount = {};

         querySnapshot.forEach((doc) => {
            const user = doc.data();
            if (user.uid !== currentUser.uid && user.role !== "admin") {
               if (!usernameCount[user.username]) {
                  usernameCount[user.username] = 0;
               }
               usernameCount[user.username]++;
            }
         });

         querySnapshot.forEach((doc) => {
            const user = doc.data();
            if (user.uid !== currentUser.uid && user.role !== "admin") {
               let label = `${user.username} (${user.role})`;
               if (usernameCount[user.username] > 1) {
                  const emailWithoutDomain = user.email.split("@")[0];
                  label += ` - ${emailWithoutDomain}`;
               }
               usersList.push({
                  label,
                  value: doc.id,
                  username: user.username,
                  role: user.role,
               });
            }
         });

         setUsers(usersList);
      };

      fetchUsers();
   }, [currentUser.uid]);

   useEffect(() => {
      const newPeer = new Peer(uidf);
      setPeer(newPeer);

      newPeer.on("call", (call) => {
         // Find the caller's name
         const caller = users.find((user) => user.value === call.peer);
         const name = caller ? caller.username : "Desconocido";

         setIncomingCall(call);
         setCallerName(name);
         setNotificationOpen(true);
      });

      return () => {
         if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
         }
         newPeer.destroy();
      };
   }, [uidf, users, localStream]);

   useEffect(() => {
      if (remoteStream) {
         const onStreamEnded = () => {
            window.location.reload();
         };

         remoteStream.getTracks().forEach((track) => {
            track.addEventListener("ended", onStreamEnded);
         });

         return () => {
            remoteStream.getTracks().forEach((track) => {
               track.removeEventListener("ended", onStreamEnded);
            });
         };
      }
   }, [remoteStream]);

   const startCall = () => {
      if (remoteUserId.trim() !== "") {
         navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setLocalStream(stream);
            localVideoRef.current.srcObject = stream;
            const call = peer.call(remoteUserId, stream);
            call.on("stream", (remoteStream) => {
               setRemoteStream(remoteStream);
               remoteVideoRef.current.srcObject = remoteStream;
            });

            call.on("close", () => {
               window.location.reload();
            });

            call.on("error", () => {
               window.location.reload();
            });
         });
      } else {
         alert("Please enter a valid user ID to call.");
      }
   };

   const endCall = () => {
      if (localStream) {
         localStream.getTracks().forEach((track) => track.stop());
         setLocalStream(null);
         setRemoteStream(null);
      }
      if (peer) {
         peer.destroy();
         setPeer(new Peer(uidf));
         window.location.reload();
      }
   };

   const acceptCall = () => {
      if (incomingCall) {
         navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setLocalStream(stream);
            localVideoRef.current.srcObject = stream;
            incomingCall.answer(stream);

            incomingCall.on("stream", (remoteStream) => {
               setRemoteStream(remoteStream);
               remoteVideoRef.current.srcObject = remoteStream;
            });

            setNotificationOpen(false);
            setIncomingCall(null);
         });
      }
   };

   const rejectCall = () => {
      if (incomingCall) {
         incomingCall.close();
         setNotificationOpen(false);
         setIncomingCall(null);
         setRejectionNotification(true); // Show rejection notification
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
                  <IconButton onClick={toggleMute}>{isMuted ? <MicOffIcon /> : <MicIcon />}</IconButton>
                  <IconButton onClick={toggleCamera}>{isCameraOff ? <VideocamOffIcon /> : <VideocamIcon />}</IconButton>
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
         <Button variant="contained" color="primary" onClick={startCall} style={{ marginRight: 10 }}>
            Iniciar llamada
         </Button>
         <StyledButton variant="contained" onClick={endCall} startIcon={<CallEndIcon />}>
            Colgar llamada
         </StyledButton>

         {/* Incoming call notification */}
         <Snackbar open={notificationOpen} onClose={() => setNotificationOpen(false)}>
            <Alert
               action={
                  <>
                     <Button color="inherit" size="small" onClick={acceptCall}>
                        Aceptar
                     </Button>
                     <Button color="inherit" size="small" onClick={rejectCall}>
                        Rechazar
                     </Button>
                  </>
               }
               severity="info"
            >
               {callerName} te está llamando.
            </Alert>
         </Snackbar>

         {/* Call rejection notification */}
         <Snackbar open={rejectionNotification} autoHideDuration={3000} onClose={() => setRejectionNotification(false)}>
            <Alert severity="error">Has rechazado la llamada.</Alert>
         </Snackbar>

         <Typography variant="body1" style={{ marginTop: 20 }}>
            Ambos usuarios deben estar en la ventana de VideoCall para que la funcionalidad funcione. Selecciona un usuario y haz clic en
            "Iniciar llamada".
         </Typography>
      </div>
   );
};

export default VideoCall;
