import { Box, Paper, Typography } from '@mui/material';
import bgImg from '../../img/bg.png';
import { TextField, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import axios from 'axios';
import abi from '../../utils/Identeefi.json';
import QRCode from 'qrcode.react';
import dayjs from 'dayjs';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
    try {
        const ethereum = getEthereumObject();

        if (!ethereum) {
            console.error("Make sure you have Metamask!");
            alert("Make sure you have Metamask!");
            return null;
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            return accounts[0];
        } else {
            console.error("No authorized account found");
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};


const AddProduct = () => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState({
        file: [],
        filepreview: null
    });
    const [qrData, setQrData] = useState('');
    const [manuDate, setManuDate] = useState('');
    const [manuLatitude, setManuLatitude] = useState("");
    const [manuLongtitude, setManuLongtitude] = useState("");
    const [manuName, setManuName] = useState("");
    const [loading, setLoading] = useState("");
    const [manuLocation, setManuLocation] = useState("");
    const [isUnique, setIsUnique] = useState(true);
    const [warrantyPeriod, setWarrantyPeriod] = useState(0);

    const CONTRACT_ADDRESS = '0x3AB88eA244C3F4b5608E4709449719957Fd6Db60';
    const contractABI = abi.abi;

    const { auth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        findMetaMaskAccount().then((account) => {
            if (account !== null) setCurrentAccount(account);
        });
        getUsername();
    }, []);

    useEffect(() => {
        if (!manuLatitude || !manuLongtitude) return;

        const fetchAddress = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/reverse-geocode?lat=${manuLatitude}&lon=${manuLongtitude}`
                );
                const data = await res.json();

                if (data.display_name) {
                    setManuLocation(data.display_name.replace(/,/g, ';'));
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchAddress();
    }, [manuLatitude, manuLongtitude]);


    const generateQRCode = async (serialNumber) => {
        setQrData(serialNumber);
    };

    const downloadSVG = () => {
        const container = document.getElementById("qr-container");
        const svgElement = container.querySelector("svg");

        if (!svgElement) return;

        const inner = svgElement.innerHTML;

        const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="#ffffff"/>
            <g transform="translate(64,64)">
                ${inner}
            </g>
            </svg>
        `;

        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);

        const link = document.createElement("a");
        link.href = svgUrl;
        link.download = "qrcode.svg";
        link.click();

        setTimeout(() => URL.revokeObjectURL(svgUrl), 100);
    };


    const handleBack = () => navigate(-1);

    const handleImage = (e) => {
        setImage({
            ...image,
            file: e.target.files[0],
            filepreview: URL.createObjectURL(e.target.files[0])
        });
    };

    const getUsername = async () => {
    try {
        const res = await axios.get(`http://localhost:5000/profile/${auth.user}`);

        if (Array.isArray(res.data) && res.data.length > 0 && res.data[0].name) {
            setManuName(res.data[0].name);
        } else {
            console.warn("Username not found in response:", res.data);
            setManuName("");   // safe fallback
        }

    } catch (error) {
        console.error("Error fetching username:", error);
        setManuName("");  // fallback to avoid crash
    }
    };



    const uploadImage = async (image) => {
        const data = new FormData();
        data.append("image", image.file);

        axios.post("http://localhost:5000/upload/product", data, {
            headers: { "Content-Type": "multipart/form-data" }
        }).then(res => {
            if (res.data.success === 1) {
                console.log("image uploaded");
            }
        });
    };


    const registerProduct = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const productContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

                const registerTxn = await productContract.registerProduct(
                    name,
                    brand,
                    serialNumber,
                    description.replace(/,/g, ';'),
                    image.file.name,
                    auth.role,
                    manuLocation,
                    manuDate.toString(),
                    warrantyPeriod
                );

                setLoading("Mining (Register Product) ...");
                await registerTxn.wait();

                generateQRCode(serialNumber);
                setLoading("");

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getCurrentTimeLocation = () => {
    return new Promise((resolve, reject) => {
        const timestamp = dayjs().unix();
        setManuDate(timestamp);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setManuLatitude(position.coords.latitude);
                setManuLongtitude(position.coords.longitude);
                resolve({ 
                    timestamp, 
                    lat: position.coords.latitude, 
                    lon: position.coords.longitude 
                });
            },
            (err) => reject(err)
        );
    });
};

    const addProductDB = async () => {
    try {
        const payload = {
            serialNumber,
            name,
            brand,
            description: description.replace(/\n/g, ' ').trim(),
            manufactureDate: manuDate
        };

        console.log("📤 Sending to backend:", payload);

        await axios.post(
            'http://localhost:5000/addproduct',
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        console.error("❌ DB insert error:", err);
    }
    };



    const checkUnique = async () => {
        const res = await axios.get("http://localhost:5000/product/serialNumber");
        const products = Array.isArray(res.data) ? res.data : [];
        const existingSerialNumbers = products.map((p) => p.serialnumber);

        const isDuplicate = existingSerialNumbers.includes(serialNumber);
        setIsUnique(!isDuplicate);
        return !isDuplicate;
    };


   const handleSubmit = async (e) => {
    e.preventDefault();

    // Wait until location and date updates finish
    const { timestamp } = await getCurrentTimeLocation();

    const unique = await checkUnique();
    if (!unique) return;

    uploadImage(image);
    await addProductDB();

    setLoading("Please pay the transaction fee to update the product details...");
    await registerProduct();

};


    const formatDate = (value) => {
        if (!value) return "";

        if (typeof value === "number") {
            const date = new Date(value * 1000);
            return date.toISOString().split("T")[0];
        }

        if (typeof value === "string") return value;

        return "";
    };


    return (
        <Box sx={{
            backgroundImage: `url(${bgImg})`,
            minHeight: "80vh",
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundSize: 'cover',
            zIndex: -2,
            overflowY: "scroll"
        }}>
            <Paper elevation={3}
                sx={{ width: "400px", margin: "auto", marginTop: "10%", padding: "3%", backgroundColor: "#e3eefc" }}>

                <Typography variant="h2" sx={{
                    textAlign: "center",
                    marginBottom: "3%",
                    fontWeight: "bold",
                    fontSize: "2.5rem"
                }}>
                    Add Product
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        error={!isUnique}
                        helperText={!isUnique ? "Serial Number already exists" : ""}
                        margin="normal"
                        label="Serial Number"
                        onChange={(e) => setSerialNumber(e.target.value)}
                        value={serialNumber}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Name"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Brand"
                        onChange={(e) => setBrand(e.target.value)}
                        value={brand}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        minRows={2}
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Manufacturing Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={formatDate(manuDate)}
                        onChange={(e) => setManuDate(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Warranty Period (months)"
                        type="number"
                        value={warrantyPeriod}
                        onChange={(e) => setWarrantyPeriod(e.target.value)}
                    />

                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ marginTop: "3%", marginBottom: "3%" }}
                    >
                        Upload Image
                        <input type="file" hidden onChange={handleImage} />
                    </Button>

                    {image.filepreview &&
                        <img src={image.filepreview} alt="preview" style={{ width: "100%" }} />
                    }

                    {qrData !== "" &&
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3%' }}>
                            <div id="qr-container"
                                style={{ backgroundColor: "white", width: "600px", height: "800px",
                                display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <QRCode
                                    value={qrData}
                                    size={256}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    renderAs="svg"
                                />
                            </div>
                        </div>
                    }

                    {qrData !== "" &&
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ marginTop: "3%", marginBottom: "3%" }}
                            onClick={downloadSVG}
                        >
                            Download
                        </Button>
                    }

                    {loading !== "" &&
                        <Typography variant="body2" sx={{ textAlign: "center", marginTop: "3%" }}>
                            {loading}
                        </Typography>
                    }

                    <Button
                        variant="contained"
                        type="submit"
                        sx={{
                            width: "100%", marginTop: "3%",
                            backgroundColor: '#98b5d5',
                            '&:hover': { backgroundColor: '#618dbd' }
                        }}
                    >
                        Add Product
                    </Button>

                    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <Button onClick={handleBack} sx={{ marginTop: "5%" }}>
                            Back
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}

export default AddProduct;
