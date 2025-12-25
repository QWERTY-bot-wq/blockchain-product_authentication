import { styled, Typography, Link } from "@mui/material";
import { Box, Container } from "@mui/system";
import React from "react";

import fbIcon from "../../img/fbicon.png";
import twitterIcon from "../../img/twittericon.png";
import linkedinIcon from "../../img/linkedinicon.png";

const Footer = () => {
  const CustomContainer = styled(Container)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-around",
    gap: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      textAlign: "center",
    },
  }));

  const IconBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  }));

  const FooterLink = styled(Link)(({ theme }) => ({
    fontSize: "16px",
    color: "#7A7A7E",
    fontWeight: "300",
    cursor: "pointer",
    textDecoration: "none",
    "&:hover": {
      color: "#000",
    },
  }));

  return (
    <Box sx={{ py: 10 }}>
      <CustomContainer>
        <CustomContainer>
          {/* Products Section */}
          <Box>
            <Typography sx={{ fontSize: "20px", color: "#1C1C1D", fontWeight: "700", mb: 2 }}>
              Products
            </Typography>

            <FooterLink href="https://share.google/BQKD3ArVDtuA14Hqo">Product Verification</FooterLink>
            <br />
            <FooterLink href="https://youtu.be/Xbn8tvzObZE?si=stW9th2UO_TdKK-r">Supply Chain Tracking</FooterLink> 
            <br />
            <FooterLink href="https://youtu.be/FhXw9NC3PWw?si=uxR9VWYy8ovPVo4D">Anti-Counterfeiting</FooterLink>
            <br />
            <FooterLink href="https://youtu.be/-2RJz-_8lbo?si=zSABVKyx99aDuBMY">Smart Contracts</FooterLink> 
          </Box>

          {/* Resources Section */}
          <Box>
            <Typography sx={{ fontSize: "20px", color: "#1C1C1D", fontWeight: "700", mb: 2 }}>
              Resources
            </Typography>

            <FooterLink href="#">How It Works</FooterLink> 
            <br />
            <FooterLink href="#">Case Studies</FooterLink> 
            <br />
            <FooterLink href="#">Blog</FooterLink> 
            <br />
            <FooterLink href="#">Whitepaper</FooterLink> 
          </Box>

          {/* Company Section */}
          <Box>
            <Typography sx={{ fontSize: "20px", color: "#1C1C1D", fontWeight: "700", mb: 2 }}>
              Company
            </Typography>

            <FooterLink href="#">About Us</FooterLink> 
            <br />
            <FooterLink href="#">Partnerships</FooterLink> 
            <br />
            <FooterLink href="#">Terms of Use</FooterLink> 
            <br />
            <FooterLink href="#">Privacy Policy</FooterLink> 
          </Box>

          {/* Get in touch Section */}
          <Box>
            <Typography sx={{ fontSize: "20px", color: "#1C1C1D", fontWeight: "700", mb: 2 }}>
              Get in touch
            </Typography>

            <Typography sx={{ fontSize: "16px", color: "#7A7A7E", fontWeight: "500", mb: 2 }}>
              Let us help you find the perfect solution for your needs.
            </Typography>

            <IconBox>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"> 
                <img src={fbIcon} alt="fbIcon" style={{ cursor: "pointer" }} />
              </a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer"> 
                <img src={twitterIcon} alt="twitterIcon" style={{ cursor: "pointer" }} />
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer"> 
                <img src={linkedinIcon} alt="linkedinIcon" style={{ cursor: "pointer" }} />
              </a>
            </IconBox>
          </Box>
        </CustomContainer>
      </CustomContainer>
    </Box>
  );
};

export default Footer;
