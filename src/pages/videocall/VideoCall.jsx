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
   const [notificationOpen, setNotificationOpen] = useState(false);
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
         setNotificationOpen(true);
         navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setLocalStream(stream);
            localVideoRef.current.srcObject = stream;
            call.answer(stream);
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
      });

      return () => {
         if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
         }
         newPeer.destroy();
      };
   }, [uidf]);

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
      <div
         style={{
            backgroundColor: "white",
            color: "black",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
         }}
      >
         <Typography
            variant="h4"
            gutterBottom
            style={{
               textAlign: "center",
               marginBottom: "20px",
               fontWeight: "bold",
               color: "black",
            }}
         >
            Video Llamada
         </Typography>
         {/* Información adicional */}
         <Typography
            variant="body1"
            style={{
               marginBottom: "20px",
               textAlign: "center",
               fontWeight: "lighter",
               fontSize: "14px",
               color: "grey",
            }}
         >
            Ambos usuarios deben estar en la ventana de Video llamada para que pueda realizar la llamada. Selecciona un usuario y haz clic
            en "Reunirse".
         </Typography>

         <div style={{ display: "flex", flex: 1, gap: "20px", position: "relative" }}>
            {/* Contenedor de videos */}
            <div
               style={{
                  flex: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "20px",
                  position: "relative",
               }}
            >
               {/* Video local */}
               <div
                  style={{
                     position: "relative",
                     border: "2px solid black",
                     borderRadius: "10px",
                     overflow: "hidden",
                     boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  }}
               >
                  <video ref={localVideoRef} autoPlay muted style={{ width: "100%", height: "auto", display: "block" }} />
                  <div
                     style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        display: "flex",
                        gap: "10px",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        padding: "5px",
                        borderRadius: "5px",
                     }}
                  >
                     <IconButton onClick={toggleMute} style={{ color: isMuted ? "grey" : "black" }}>
                        {isMuted ? <MicOffIcon /> : <MicIcon />}
                     </IconButton>
                     <IconButton onClick={toggleCamera} style={{ color: isCameraOff ? "grey" : "black" }}>
                        {isCameraOff ? <VideocamOffIcon /> : <VideocamIcon />}
                     </IconButton>
                     <IconButton onClick={() => handleFullscreen(localVideoRef)} style={{ color: "black" }}>
                        <FullscreenIcon />
                     </IconButton>
                  </div>
                  {/* Video remoto en la esquina */}
                  <div
                     style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "10px",
                        width: "30%",
                        height: "auto",
                        border: "2px solid black",
                        borderRadius: "10px",
                        overflow: "hidden",
                        backgroundColor: "white",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                     }}
                  >
                     <video ref={remoteVideoRef} autoPlay style={{ width: "100%", height: "100%", display: "block" }} />
                     <div
                        style={{
                           position: "absolute",
                           bottom: "5px",
                           right: "5px",
                           display: "flex",
                           gap: "5px",
                           backgroundColor: "rgba(255,255,255,0.8)",
                           padding: "3px",
                           borderRadius: "5px",
                        }}
                     >
                        <IconButton onClick={() => handleFullscreen(remoteVideoRef)} style={{ color: "black" }}>
                           <FullscreenIcon />
                        </IconButton>
                     </div>
                  </div>
               </div>
            </div>

            {/* Controles generales */}
            <div
               style={{
                  borderLeft: "2px solid black",
                  padding: "10px",
               }}
            >
               <Autocomplete
                  options={users}
                  getOptionLabel={(option) => option.label}
                  onChange={(event, newValue) => {
                     setRemoteUserId(newValue ? newValue.value : "");
                  }}
                  renderInput={(params) => (
                     <TextField
                        {...params}
                        label="Usuario"
                        variant="outlined"
                        style={{
                           backgroundColor: "white",
                           borderRadius: "5px",
                           marginBottom: "20px",
                        }}
                     />
                  )}
                  style={{ width: "100%" }}
               />
               <div style={{ width: "100%", textAlign: "center" }}>
                  <Button
                     variant="contained"
                     onClick={startCall}
                     style={{
                        marginBottom: "10px",
                        backgroundColor: "black",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "5px",
                        width: "100%",
                     }}
                  >
                     Reunirse
                  </Button>
                  <StyledButton
                     variant="contained"
                     onClick={endCall}
                     startIcon={<CallEndIcon />}
                     style={{
                        width: "100%",
                        backgroundColor: "red",
                        color: "white",
                     }}
                  >
                     Colgar
                  </StyledButton>
               </div>
            </div>
         </div>

         {/* Notificaciones */}
         <Snackbar
            open={notificationOpen}
            autoHideDuration={3000}
            onClose={() => setNotificationOpen(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
         >
            <Alert
               onClose={() => setNotificationOpen(false)}
               severity="info"
               style={{
                  backgroundColor: "black",
                  color: "white",
                  fontWeight: "bold",
               }}
            >
               Tienes una llamada entrante.
            </Alert>
         </Snackbar>
      </div>
   );
};

export default VideoCall;
