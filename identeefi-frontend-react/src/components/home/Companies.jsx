import { Box, Container, styled, Typography } from "@mui/material";
import React from "react";
import logoImg from "../../img/logo.png";
import starsImg from "../../img/Star.png";
import logosImg from "../../img/logos.png";

const Companies = () => {
  const CustomContainer = styled(Container)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      textAlign: "center",
      marginBottom: theme.spacing(4),
    },
  }));

  const CustomBox = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // keep logo + text aligned left
    [theme.breakpoints.down("md")]: {
      alignItems: "center",
      marginBottom: theme.spacing(4),
    },
  }));

  return (
    <Box sx={{ mt: 3 }}>
      <CustomContainer>
        <CustomBox>
          {/* logo wrapped in Box to shift position */}
          <Box sx={{ mt: 2, ml: -3 }}>
            <img
              src={logoImg}
              alt="logo"
              style={{ maxWidth: "70%", display: "block" }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "#7D8589",
              fontSize: "16px",
              fontWeight: "bold",
              mt: 2,
            }}
          >
            More than 45,000 trust elites !!
          </Typography>
        </CustomBox>

        <Box sx={{ textAlign: "center" }}>
          <img src={starsImg} alt="stars" style={{ maxWidth: "100%" }} />
          <Typography
            variant="body2"
            sx={{
              color: "#7D8589",
              fontSize: "16px",
              fontWeight: "bold",
              mt: 2,
            }}
          >
            5-Star Rating (10k+ Reviews)
          </Typography>
        </Box>
      </CustomContainer>

      <Container sx={{ display: "flex", flexDirection: "column", mt: 3 }}>
        <img src={logosImg} alt="logos" />
      </Container>
    </Box>
  );
};

export default Companies;
