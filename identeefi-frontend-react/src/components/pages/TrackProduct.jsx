import { Box, Paper, Typography, TextField, Button, Divider, Avatar } from '@mui/material';
import bgImg from '../../img/bg.png';
import { QrReader } from 'react-qr-reader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../utils/constants';


const TrackProduct = () => {
  const [serialNumber, setSerialNumber] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTrack = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      setError("Ethereum object not found");
      return;
    }

    // Ensure account is connected
    await ethereum.request({ method: "eth_requestAccounts" });

    // ethers v5 style (matches your code)
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const productContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Normalize the serial number from QR/manual
    const sn = (serialNumber || "").trim();
    console.log("Serial Number (normalized):", sn);

    const product = await productContract.getProduct(sn);
    console.log("Product raw:", product);

    // Map fields based on your actual output
    const serial = product[0];
    const name = product[1];
    const brand = product[2];
    const description = product[3];
    const image = product[4];
    const warrantyBn = product[5];  // BigNumber
    const historyArr = product[6] || [];

    const imageFile = product[4]; // filename stored on-chain
    const imageUrl = `http://localhost:5000/file/product/${imageFile}`;

    console.log("Product serial:", serial);
    console.log("Product name:", name);
    console.log("Product brand:", brand);
    console.log("Product description:", description);
    console.log("Product image:", image);
    console.log("Warranty (BN):", warrantyBn);
    console.log("History raw:", historyArr);

    // Basic validation: if serial from chain doesn't match the query, treat as not found
    if (!serial || serial.toString().trim() !== sn) {
      throw new Error("Serial not found in contract");
    }

    // Warranty to string/number
    const warranty = warrantyBn?.toString?.() ?? String(warrantyBn);

    // Parse history: location semicolons, timestamp to date if numeric
    const parsedHistory = historyArr.map((h, idx) => {
      // h.timestamp may be a string; convert only if numeric
      const tsStr = h.timestamp?.toString?.() ?? h.timestamp;
      const isNumeric = /^\d+$/.test(tsStr);
      const tsMs = isNumeric ? Number(tsStr) * 1000 : null;

      return {
        id: h.id?.toString?.() ?? h.id,
        actor: h.actor,
        location: (h.location || "").replace(/;/g, ","),
        timestamp: tsStr,        // keep original for display
        timestampMs: tsMs,       // use for Date conversion in UI if numeric
        isSold: !!h.isSold
      };
    });

    setProductDetails({
      name,
      brand,
      serial,
      description,
      image: imageUrl,
      warranty
    });

    setHistory(parsedHistory);
    setError('');

  } catch (err) {
    console.error("Tracking error:", err);
    setError("Product not found or tracking failed");
    setProductDetails(null);
    setHistory([]);
  }
};


  useEffect(() => {
    if (serialNumber) {
      handleTrack();
    }
  }, [serialNumber]);

  return (
    <Box
      sx={{
        backgroundImage: `url(${bgImg})`,
        minHeight: "100vh",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: "2%",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "450px",
          padding: "4%",
          backgroundColor: "#e7f1fa",
          borderRadius: "12px",
        }}
      >
        {/* Title */}
        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center", mb: "20px" }}>
          Product Details
        </Typography>

        {/* QR CODE SCANNER */}
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={(result, error) => {
            if (result?.text) {
              setSerialNumber(result.text.trim());
            }
            if (error) {
              console.error("QR scan error:", error);
            }
          }}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <Typography variant="body2" sx={{ marginTop: "10px" }}>
          Or enter manually:
        </Typography>

        <TextField
          label="Serial Number"
          variant="outlined"
          fullWidth
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          sx={{ marginBottom: "2%", marginTop: "1%" }}
        />

        <Button variant="contained" fullWidth onClick={handleTrack}>
          TRACK
        </Button>

        {/* BACK now navigates to manufacturer page as requested */}
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate('/manufacturer')}
          sx={{ marginTop: "2%" }}
        >
          BACK
        </Button>

        {error && (
          <Typography color="error" sx={{ marginTop: "2%", textAlign: "center" }}>
            {error}
          </Typography>
        )}

        {/* PRODUCT INFO UI */}
        {productDetails && (
          <Box sx={{ marginTop: "5%" }}>
            {/* Product image placeholder */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Avatar
                src={productDetails.image}
                sx={{ width: 120, height: 120, borderRadius: "50%", border: "3px solid white" }}
              />
            </Box>

            {/* PRODUCT TEXT */}
            <Typography sx={{ fontSize: "20px", fontWeight: "bold", textAlign: "center" }}>
              {productDetails.name}
            </Typography>

            <Typography sx={{ textAlign: "center", mt: 1 }}>
              <strong>Serial Number:</strong> {productDetails.serial}
            </Typography>
            <Typography sx={{ textAlign: "center", mt: 1 }}>
              <strong>Brand:</strong> {productDetails.brand}
            </Typography>
            <Typography sx={{ textAlign: "center", mt: 1 }}>
              <strong>Description:</strong> {productDetails.description}
            </Typography>

            {/* horizontal divider like screenshot */}
            <Divider sx={{ mt: 2, mb: 2 }} />
          </Box>
        )}

        {/* HISTORY UI with vertical connector line */}
        {history.length > 0 && (
          <Box sx={{ position: 'relative', mt: 1, pb: 2 }}>
            {/* vertical connecting line positioned between left (time) and right (details) columns */}
            <Box
              sx={{
                position: 'absolute',
                left: '40%',         // aligns roughly between left time and right details (35% + half of dot)
                top: 40,
                bottom: 16,
                width: '2px',
                bgcolor: '#d0d7de',
                opacity: 0.6,
                borderRadius: '2px',
                transform: 'translateX(-50%)'
              }}
            />

            {history.map((h, index) => (
              <Box key={index} sx={{ display: "flex", flexDirection: "row", mb: 3 }}>
                
                {/* LEFT: Time + Date */}
                <Box sx={{ width: "35%", textAlign: "right", pr: 2 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {new Date(h.timestampMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography sx={{ fontSize: "13px" }}>
                    {new Date(h.timestampMs).toLocaleDateString()}
                    </Typography>
                </Box>

                {/* MIDDLE DOT */}
                <Box sx={{ width: "10%", display: "flex", justifyContent: "center" }}>
                  <Box
                    sx={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#6d6d6d",
                      borderRadius: "50%",
                      marginTop: "8px",
                      zIndex: 2   // keep dot above connecting line
                    }}
                  />
                </Box>

                {/* RIGHT SIDE DETAILS */}
                <Box sx={{ width: "55%", pl: 1 }}>
                  <Typography><strong>Location:</strong> {h.location || "Not specified"}</Typography>
                  <Typography><strong>Actor:</strong> {h.actor || "Unknown"}</Typography>

                  {/* Show isSold only on last entry like screenshot */}
                  {index === history.length - 1 && (
                    <Typography sx={{ fontWeight: "bold", mt: 1 }}>
                      IsSold: {h.isSold ? "true" : "false"}
                    </Typography>
                  )}
                </Box>

              </Box>
            ))}
          </Box>
        )}


        {/* UPDATE PRODUCT navigates to manufacturer page as requested */}
        {productDetails && (
          <Button
                onClick={() => navigate('/manufacturer')}
                sx={{
                marginTop: "5%",
                }}
                >
                    Back
                </Button>
        )}

      </Paper>
    </Box>
  );
};

export default TrackProduct;
