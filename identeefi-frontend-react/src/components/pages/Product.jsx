import { Box, Paper, Avatar, Typography, Button } from '@mui/material';
import bgImg from '../../img/bg.png';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, {
    timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import abi from '../../utils/Identeefi.json';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";

const Product = () => {
    const [serialNumber, setSerialNumber] = useState("");
    const [name, setName] = useState("P");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [history, setHistory] = useState([]);
    const [isSold, setIsSold] = useState(false);
    const [loading, setLoading] = useState("");
    const [isAuthentic, setIsAuthentic] = useState(false);

    const [image, setImage] = useState({ file: [], filepreview: null });

    // Added state (non-breaking to UI/logic)
    const [manufacturingDate, setManufacturingDate] = useState("");
    const [warrantyPeriod, setWarrantyPeriod] = useState(0);
    const [warrantyStatus, setWarrantyStatus] = useState("");

    const CONTRACT_ADDRESS = '0x3AB88eA244C3F4b5608E4709449719957Fd6Db60';
    const CONTRACT_ABI = abi.abi;

    const navigate = useNavigate();
    const location = useLocation();
    const qrData = location.state?.qrData;

    useEffect(() => {
        if (qrData) {
            handleScan(qrData);
        }
    }, [qrData]);

    const getImage = async (imageName) => {
        setImage(prevState => ({
            ...prevState,
            filepreview: `http://localhost:5000/file/product/${imageName}`
        }));
    };

    const handleScan = async (qrData) => {
        setSerialNumber(qrData);
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const productContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

                const product = await productContract.getProduct(qrData.toString());
                console.log("Retrieved product...", product);

                if (product && product[1]) {
                    setIsAuthentic(true);
                    setData(product);
                } else {
                    setIsAuthentic(false);
                }
            } else {
                console.log("Ethereum object doesn't exist!");
                alert("Ethereum object doesn't exist! Please connect your wallet first!");
            }
        } catch (error) {
            console.log(error);
            setIsAuthentic(false);
        }
    };

    const calculateWarrantyStatus = (manufacturingDateSeconds, warrantyMonths) => {
        if (!manufacturingDateSeconds || !warrantyMonths) return "Warranty info not available";

        const manuDate = new Date(Number(manufacturingDateSeconds) * 1000);
        const warrantyEnd = new Date(manuDate);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);

        const today = new Date();
        const monthsLeft = (warrantyEnd.getFullYear() - today.getFullYear()) * 12 +
                           (warrantyEnd.getMonth() - today.getMonth());

        return monthsLeft > 0
            ? `Under Warranty: ${monthsLeft} month(s) left`
            : "Warranty expired";
    };

    const setData = (product) => {
        // Keep existing mapping and UI behavior
        setSerialNumber(product[0]);
        setName(product[1]);
        setBrand(product[2]);
        setDescription(product[3].replace(/;/g, ","));
        getImage(product[4]);

        // Warranty months from product[5]
        const warrantyMonths = parseInt(product[5]?.toString?.() ?? "0");
        setWarrantyPeriod(warrantyMonths);

        const rawHistory = product[6] || [];
        const hist = rawHistory.map((h) => ({
            actor: h.actor,
            location: h.location.replace(/;/g, ","),
            timestamp: h.timestamp,
            isSold: h.isSold
        }));

        setHistory(hist);
        setIsSold(hist.some(h => h.isSold));

        // Manufacturing date from first history entry timestamp (seconds)
        const manuSeconds = rawHistory[0]?.timestamp;
        if (manuSeconds) {
            const formattedDate = dayjs(Number(manuSeconds) * 1000).format("DD/MM/YYYY");
            setManufacturingDate(formattedDate);
            setWarrantyStatus(calculateWarrantyStatus(manuSeconds, warrantyMonths));
        } else {
            setManufacturingDate("");
            setWarrantyStatus("Warranty info not available");
        }
    };

    const handleBack = () => {
        navigate(-2);
    };

    const getHistory = () => {
        return history.map((item, index) => {
            const tsStr = item.timestamp?.toString?.() ?? item.timestamp;
            const isNumeric = /^\d+$/.test(tsStr);
            const tsMs = isNumeric ? Number(tsStr) * 1000 : null;

            const date = tsMs ? dayjs(tsMs).format('MM/DD/YYYY') : tsStr;
            const time = tsMs ? dayjs(tsMs).format('HH:mm a') : "";

            return (
                <TimelineItem key={index}>
                    <TimelineOppositeContent color="textSecondary">
                        {time} {date}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography>Location: {item.location}</Typography>
                        <Typography>Actor: {item.actor}</Typography>
                    </TimelineContent>
                </TimelineItem>
            );
        });
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
            backgroundRepeat: 'no-repeat',
            zIndex: -2,
            overflowY: "scroll"
        }}>
            <Paper elevation={3} sx={{ width: "400px", margin: "auto", marginTop: "10%", marginBottom: "10%", padding: "3%", backgroundColor: "#e3eefc" }}>
                <Box sx={{ textAlign: "center", marginBottom: "5%" }}>
                    <Typography
                        variant="h2"
                        sx={{
                            textAlign: "center",
                            marginBottom: "3%",
                            fontFamily: 'Gambetta',
                            fontWeight: "bold",
                            fontSize: "2.5rem",
                            color: isAuthentic ? "#50C878" : "red"
                        }}
                    >
                        {isAuthentic ? "Product is Authentic!" : "Product Not Found"}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', flex: 1, width: '100%', marginTop: '5%', marginBottom: '5%' }}>
                        <Box sx={{ marginRight: '1.5%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', flex: '0 0 35%', width: '35%' }}>
                            <Avatar
                                alt={name}
                                src={image.filepreview}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: "auto",
                                    marginBottom: "3%",
                                    backgroundColor: "#3f51b5"
                                }}
                            >
                                {name}
                            </Avatar>
                        </Box>
                        <Box sx={{ marginLeft: '1.5%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'left', flex: '0 0 65%', width: '65%' }}>
                            <Typography variant="body1" sx={{ textAlign: "left", marginBottom: "5%" }}>
                                {name}
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "left", marginBottom: "3%" }}>
                                Serial Number: {serialNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "left", marginBottom: "3%" }}>
                                Brand: {brand}
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: "left", marginBottom: "3%" }}>
                                Description: {description}
                            </Typography>

                            {/* Added fields (UI style unchanged) */}
                            <Typography variant="body2" sx={{ textAlign: "left", marginBottom: "3%" }}>
                                Manufacturing Date: {manufacturingDate || "—"}
                            </Typography>
                            {/* <Typography variant="body2" sx={{ textAlign: "left", marginBottom: "3%" }}>
                                Warranty period: {warrantyPeriod} month(s)
                            </Typography> */}
                            <Typography variant="body2" sx={{ textAlign: "left", marginBottom: "3%" }}>
                                 {warrantyStatus}
                            </Typography>
                        </Box>
                    </Box>

                    <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2 } }}>
                        {getHistory()}
                        <TimelineItem>
                            <TimelineOppositeContent color="textSecondary">
                                {dayjs().format('HH:mm a')} {dayjs().format('MM/DD/YYYY')}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot />
                            </TimelineSeparator>
                            <TimelineContent sx={{ py: '12px', px: 2 }}>
                                <Typography>IsSold: {isSold.toString()}</Typography>
                            </TimelineContent>
                        </TimelineItem>
                    </Timeline>

                    {loading === "" ? null : (
                        <Typography variant="body2" sx={{ textAlign: "center", marginTop: "3%" }}>
                            {loading}
                        </Typography>
                    )}

                    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <Button onClick={handleBack} sx={{ marginTop: "5%" }}>
                            Back
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Product;
