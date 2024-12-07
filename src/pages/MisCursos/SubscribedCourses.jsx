import React, { useEffect, useState, useContext } from "react";
import { firestore } from "../../connection/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Card, CardMedia, CardContent, Typography, Grid, Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { SearchContext } from "../../context/SearchContext";
import { UserContext } from "../../context/UserContext";
import styles from "./SubscribedCourses.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const theme = createTheme({
   palette: {
      primary: {
         main: "#1976d2",
      },
   },
});

const StyledCard = styled(Card)({
   maxWidth: 345,
   margin: "1rem",
   position: "relative",
   cursor: "pointer",
   transition: "transform 0.3s ease",
   "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
   },
});

const StyledCardMedia = styled(CardMedia)({
   height: 140,
});

const GroupBadge = styled("div")(({ theme }) => ({
   position: "absolute",
   top: "10px",
   right: "10px",
   backgroundColor: theme.palette.primary.main,
   color: "white",
   padding: "0.5rem",
   borderRadius: "5px",
}));

const SubscribedCourses = () => {
   const [userGroups, setUserGroups] = useState([]);
   const [loading, setLoading] = useState(true);
   const { currentUser } = useContext(UserContext);
   const { searchTerm, setSearchTerm } = useContext(SearchContext);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchUserGroups = async () => {
         setLoading(true);

         if (currentUser && currentUser !== "invitado") {
            const userRef = doc(firestore, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
               const userData = userDoc.data();
               if (userData.courses) {
                  const groupsDetails = await Promise.all(
                     userData.courses.map(async (course) => {
                        const groupDoc = await getDoc(doc(firestore, "groups", course.courseId));
                        return groupDoc.exists() ? { id: course.courseId, ...groupDoc.data() } : null;
                     })
                  );
                  const filteredGroups = groupsDetails.filter((group) => group !== null);
                  setUserGroups(filteredGroups);
               }
            }
         }

         setLoading(false);
      };

      fetchUserGroups();
   }, [currentUser]);

   const handleCardClick = (groupId) => {
      navigate(`/User/viewcourse/${groupId}`);
   };

   const handleSearchInputChange = (event) => {
      setSearchTerm(event.target.value);
   };

   const filteredGroups =
      searchTerm.trim() !== ""
         ? userGroups.filter((group) => group.groupName.toLowerCase().includes(searchTerm.toLowerCase()))
         : userGroups;

   return (
      <ThemeProvider theme={theme}>
   <Box mt={3} mx="auto" maxWidth={1200} px={3}>
      {/* Barra de búsqueda */}
      <Box mb={3} className={styles.searchContainer}>
         <div style={{ position: "relative", maxWidth: "600px", width: "100%" }}>
            {/* Ícono de lupa */}
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            {/* Campo de búsqueda */}
            <input
               className={styles.search__input}
               type="text"
               placeholder=""
               value={searchTerm}
               onChange={handleSearchInputChange}
            />
         </div>
      </Box>

      {/* Indicador de carga o resultados */}
      {loading ? (
         <Box py={2} mb={3} textAlign="center">
            <CircularProgress />
         </Box>
      ) : filteredGroups.length > 0 ? (
         <Grid container spacing={3} className={styles.resultsContainer}>
            {filteredGroups.map((group) => (
               <Grid item xs={12} sm={6} md={4} key={group.id}>
                  <StyledCard onClick={() => handleCardClick(group.id)}>
                     <StyledCardMedia
                        image={group.imageUrl || "default-image-url"}
                        title={group.groupName}
                     />
                     <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                           {group.groupName}
                        </Typography>
                     </CardContent>
                     <GroupBadge>{group.groupCode}</GroupBadge>
                  </StyledCard>
               </Grid>
            ))}
         </Grid>
      ) : (
         <Box py={2} textAlign="center" className={styles.noResults}>
            <Typography variant="h5">
               No hay resultados para "{searchTerm}"
            </Typography>
         </Box>
      )}
   </Box>
</ThemeProvider>

   );
};

export default SubscribedCourses;
