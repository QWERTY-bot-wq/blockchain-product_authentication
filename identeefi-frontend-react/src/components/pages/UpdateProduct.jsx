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
import useAuth from '../../hooks/useAuth';
import { ethers } from "ethers";
import axios from 'axios';


const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
    try {
        const ethereum = getEthereumObject();

        /*
        * First make sure we have access to the Ethereum object.
        */
        if (!ethereum) {
            console.error("Make sure you have Metamask!");
            return null;
        }

        console.log("We have the Ethereum object", ethereum);
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            return account;
        } else {
            console.error("No authorized account found");
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};



const UpdateProduct = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [suppDate, setSuppDate] = useState('');
    const [suppLatitude, setSuppLatitude] = useState("");
    const [suppLongtitude, setSuppLongtitude] = useState("");
    const [suppName, setSuppName] = useState("");
    const [suppLocation, setSuppLocation] = useState("");
    const [loading, setLoading] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [productData, setProductData] = useState("");

    const [name, setName] = useState("P");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [imageName, setImageName] = useState("");
    const [history, setHistory] = useState([]);
    const [isSold, setIsSold] = useState(false);

    const [image, setImage] = useState({
        file: [],
        filepreview: null
    });


    const CONTRACT_ADDRESS = '0x3AB88eA244C3F4b5608E4709449719957Fd6Db60';
    const CONTRACT_ABI = abi.abi;

    const { auth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const qrData = location.state?.qrData;

    console.log("qrData", qrData);

    useEffect(() => {
        console.log("useEffect 1")

        findMetaMaskAccount().then((account) => {
            if (account !== null) {
                setCurrentAccount(account);
            }
        });

        if (qrData) {
            handleScan(qrData)
        }

    }, [qrData]);

    const getImage = async (imageName) => {
        setImage(prevState => ({
            ...prevState,
            filepreview: `http://localhost:5000/file/product/${imageName}`
            })
        )
    }

    const handleScan = async (qrData) => {
  setSerialNumber(qrData);
  console.log("serial number", qrData);

  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const productContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const product = await productContract.getProduct(qrData.toString());
      console.log("Retrieved product...", product);

      setData(product); // ✅ pass full object, not .toString()
    } else {
      console.log("Ethereum object doesn't exist!");
      alert("Ethereum object doesn't exist! Please connect your wallet first!");
    }
  } catch (error) {
    console.log(error);
  }
};



    const setData = (product) => {
  console.log("product data:", product);

  setSerialNumber(product[0]);
  setName(product[1]);
  setBrand(product[2]);
  setDescription(product[3].replace(/;/g, ","));
  getImage(product[4]);

  const rawHistory = product[6] || [];

  const hist = rawHistory.map((h) => ({
    actor: h.actor,
    location: h.location.replace(/;/g, ","),
    timestamp: h.timestamp,
    isSold: h.isSold
  }));

  console.log("hist", hist);
  setHistory(hist);

  setIsSold(hist.some(h => h.isSold));
};


    

    const handleBack = () => {
        navigate(-1)
    }


    const getHistory = () => {
        return history.map((item, index) => {
            const tsStr = item.timestamp?.toString?.() ?? item.timestamp;
            const isNumeric = /^\d+$/.test(tsStr);
            const tsMs = isNumeric ? Number(tsStr) * 1000 : null;

            const date = tsMs ? dayjs(tsMs).format('MM/DD/YYYY') : tsStr;
            const time = tsMs ? dayjs(tsMs).format('HH:mm a') : "";


            // if (item.isSold) {
            //     setIsSold(true);
            // }

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
    }

    const handleSubmit = async (e) => {
        e.preventDefault();;

        console.log("Submitting with qrData:", qrData);
        navigate('/update-product-details', { state: { qrData }});
        

    }
    

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

                <Box
                    sx={{
                        textAlign: "center", marginBottom: "5%",
                    }}
                >

                    <Typography
                        variant="h2"
                        sx={{
                            textAlign: "center", marginBottom: "3%",
                            fontFamily: 'Gambetta', fontWeight: "bold", fontSize: "2.5rem"
                        }}
                    >
                        Product Details</Typography>

                    <Box
                        sx={{
                            display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', flex: 1, width: '100%',
                            marginTop: '5%', marginBottom: '5%'
                        }}
                    >
                        <Box
                            sx={{
                                marginRight: '1.5%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', flex: '0 0 35%', width: '35%'
                            }}
                        >
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
                        <Box
                            sx={{
                                marginLeft: '1.5%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'left', flex: '0 0 65%', width: '65%'
                            }}
                        >
                            <Typography
                                variant="body1"
                                sx={{
                                    textAlign: "left", marginBottom: "5%",
                                }}
                            >
                                {name}
                                {/* Product Name */}

                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "left", marginBottom: "3%",
                                }}
                            >
                                Serial Number: {serialNumber}
                            </Typography>


                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "left", marginBottom: "3%",
                                }}
                            >
                                Description: {description}
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "left", marginBottom: "3%",
                                }}
                            >
                                Brand: {brand}
                            </Typography>

                        </Box>

                    </Box>

                    <Timeline
                        sx={{
                            [`& .${timelineOppositeContentClasses.root}`]: {
                                flex: 0.2,
                            },
                        }}
                    >
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

                    {loading === "" ? null
                        : <Typography
                            variant="body2"
                            sx={{
                                textAlign: "center", marginTop: "3%"
                            }}
                        >
                            {loading}
                        </Typography>
                    }

                    <Button
                        variant="contained"
                        type="submit"
                        sx={{ width: "50%", marginTop: "3%", backgroundColor: '#98b5d5', '&:hover': { backgroundColor: '#618dbd' } }}
                        onClick={handleSubmit}
                    >
                        Update Product
                    </Button>

                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >


                        <Button
                            onClick={handleBack}
                            sx={{
                                marginTop: "5%",
                            }}
                        >
                            Back
                        </Button>

                    </Box>



                </Box>
            </Paper>
        </Box>
    )
}

export default UpdateProduct;