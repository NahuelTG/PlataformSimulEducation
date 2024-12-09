import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../connection/firebaseConfig";
import { Box, Container, Typography, IconButton, CircularProgress, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import styles from "./SharedStyles.module.css";

const TaskDetails = () => {
   const { groupId, taskId } = useParams();
   const [submissions, setSubmissions] = useState([]);
   const [filteredSubmissions, setFilteredSubmissions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [openGradeModal, setOpenGradeModal] = useState(false);
   const [currentSubmission, setCurrentSubmission] = useState(null);
   const [grade, setGrade] = useState("");
   const [filter, setFilter] = useState("all");

   useEffect(() => {
      const fetchData = async () => {
         try {
            const submissionsData = await getSubmissionsData();
            setSubmissions(submissionsData);
            setFilteredSubmissions(submissionsData);
            setLoading(false);
         } catch (error) {
            console.error("Error fetching submissions:", error);
            setLoading(false);
         }
      };

      fetchData();
   }, [groupId, taskId]);

   const getSubmissionsData = async () => {
      try {
         const submissions = [];
         const submissionsCollectionRef = collection(firestore, "groups", groupId, "tasks", taskId, "submissions");
         const submissionsSnapshot = await getDocs(submissionsCollectionRef);

         for (const submissionDoc of submissionsSnapshot.docs) {
            const submissionData = submissionDoc.data();
            submissions.push({
               userId: submissionDoc.id,
               fileUrl: submissionData.fileUrl,
               submittedAt: submissionData.timestamp.toDate().toLocaleString(),
               grade: submissionData.grade,
            });
         }

         return submissions;
      } catch (error) {
         console.error("Error fetching submissions:", error);
         return [];
      }
   };

   const handleOpenGradeModal = (submission) => {
      setCurrentSubmission(submission);
      setGrade(submission.grade === "none" ? "" : submission.grade);
      setOpenGradeModal(true);
   };

   const handleCloseGradeModal = () => {
      setOpenGradeModal(false);
      setCurrentSubmission(null);
      setGrade("");
   };

   const handleUpdateGrade = async () => {
      if (currentSubmission) {
         const submissionDocRef = doc(firestore, "groups", groupId, "tasks", taskId, "submissions", currentSubmission.userId);
         await updateDoc(submissionDocRef, { grade: grade });
         setSubmissions(submissions.map((sub) => (sub.userId === currentSubmission.userId ? { ...sub, grade: grade } : sub)));
         setFilteredSubmissions(submissions.map((sub) => (sub.userId === currentSubmission.userId ? { ...sub, grade: grade } : sub)));
         handleCloseGradeModal();
      }
   };

   const handleSetNotGraded = async () => {
      if (currentSubmission) {
         const submissionDocRef = doc(firestore, "groups", groupId, "tasks", taskId, "submissions", currentSubmission.userId);
         await updateDoc(submissionDocRef, { grade: "none" });
         setSubmissions(submissions.map((sub) => (sub.userId === currentSubmission.userId ? { ...sub, grade: "none" } : sub)));
         setFilteredSubmissions(submissions.map((sub) => (sub.userId === currentSubmission.userId ? { ...sub, grade: "none" } : sub)));
         handleCloseGradeModal();
      }
   };

   const handleFilterChange = (event) => {
      const value = event.target.value;
      setFilter(value);
      if (value === "graded") {
         setFilteredSubmissions(submissions.filter((submission) => submission.grade !== "none"));
      } else if (value === "not_graded") {
         setFilteredSubmissions(submissions.filter((submission) => submission.grade === "none"));
      } else {
         setFilteredSubmissions(submissions);
      }
   };

   if (loading) {
      return (
         <div className={styles.listContainer}>
            <Container>
               <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                  <CircularProgress />
               </Box>
            </Container>
         </div>
      );
   }

   return (
      <div className={styles.listContainer}>
         <Container>
            <Box className={styles.card}>
               <Typography variant="h4" className={styles.taskTitle}>
                  Entregas
               </Typography>
               <h3>Filtros</h3>
               <FormControl sx={{ marginBottom: 2, minWidth: 120 }}>
                  <Select value={filter} onChange={handleFilterChange}>
                     <MenuItem value="all">Todas</MenuItem>
                     <MenuItem value="graded">Calificadas</MenuItem>
                     <MenuItem value="not_graded">No Calificadas</MenuItem>
                  </Select>
               </FormControl>
               <Box sx={{ marginTop: 3 }}>
                  {filteredSubmissions.length === 0 ? (
                     <Box className={styles.card}>
                        <Typography className={styles.cardContent} align="center">
                           No hay entregas disponibles
                        </Typography>
                     </Box>
                  ) : (
                     filteredSubmissions.map((submission, index) => (
                        <Box
                           key={index}
                           className={styles.card}
                           sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 2,
                           }}
                        >
                           <Box>
                              <Typography className={styles.cardTitle}>{submission.userId}</Typography>
                              <Typography className={styles.cardContent}>Entregado: {submission.submittedAt}</Typography>
                              <Typography
                                 className={styles.cardContent}
                                 sx={{
                                    color: submission.grade === "none" ? "#555" : "green",
                                 }}
                              >
                                 Estado: {submission.grade === "none" ? "No Calificado" : "✔"}
                              </Typography>
                              <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.cardButton}>
                                 Ver Entrega
                              </a>
                           </Box>
                           <IconButton
                              sx={{
                                 color: "black",
                                 "&:hover": {
                                    color: "#333",
                                 },
                              }}
                              onClick={() => handleOpenGradeModal(submission)}
                           >
                              <AssignmentTurnedInIcon />
                           </IconButton>
                        </Box>
                     ))
                  )}
               </Box>
            </Box>
         </Container>
      </div>
   );
};

export default TaskDetails;
