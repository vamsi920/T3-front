// import Box from "@mui/material/Box";
// import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import React, { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
// import { useSelector, useDispatch } from "react-redux";
// import { addEntry, removeEntry, editEntry } from "../reducers/dataSlice";
// import { addFullEntry } from "../reducers/fullDataSlice";
// import Slide from "@mui/material/Slide";
// import icon from "./miniComponents/alertbox";
// import CircularProgress from "@mui/joy/CircularProgress";
// import Select from "@mui/material/Select";
// import InputLabel from "@mui/material/InputLabel";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import { green } from "@mui/material/colors";
// import CheckIcon from "@mui/icons-material/Check";
// import ModalComponent from "./miniComponents/modal";
// import getActiveBox from "../functions/getActiveBox";
// import getMedicines from "../functions/getMedicines";
// import getAccounts from "../functions/getAccounts";
// import getWholesalers from "../functions/getWholesalers";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
// import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate } from "react-router-dom";

const ExportToExcelAPI = async (boxID) => {
   
    var fileName = "invoice.xlsx";
    var boxData = await fetch(process.env.REACT_APP_QR_BACKEND_URL + "/getBox/" + boxID);
    var data = await boxData.json();
    var acc = data[0]["assignedAccount"];
    var whole = data[0]["assignedWholesaler"];
    // getting account details 
    var accData = await fetch(process.env.REACT_APP_QR_BACKEND_URL + "/getAccountInfo/" + acc);
    var accInfo = await accData.json();
    // getting wholesaler details
    var wholeData = await fetch(process.env.REACT_APP_QR_BACKEND_URL + "/getWholesalerInfo/" + whole);
    var wholeInfo = await wholeData.json();
    console.log(accInfo);
    console.log(wholeInfo);
    // console.log(data)
    // getting accountNumber if present else an empty string
    try{
        var accNumber = await fetch(process.env.REACT_APP_QR_BACKEND_URL + "/getAccountNumber",
        
        {
            method: "POST",
            body: JSON.stringify({
                wholesalerDEA: whole,
                accountDEA: acc
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
            
        }).then((response) => response.json())
        .then((json) => console.log(json));
    }
    catch(err){
        accNumber = "";
        console.log(err);
    }
    if(accNumber == null || accNumber === undefined){
        accNumber = "";
    }
    console.log(accNumber);

    try {

      await fetch(
        process.env.REACT_APP_QR_BACKEND_URL + "/extodm/" + fileName,
        {
          method: "POST",
          body: JSON.stringify({
            data: data[0]["medicines"],
            account: accInfo,
            wholesaler: wholeInfo,
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      )
        .then((response) => response.json())
        .then((json) => console.log(json));
    } catch (err) {
      console.log(err);
    }
    // setting the checked state to false after two seconds

    // var anchor = document.createElement("a");
    // anchor.setAttribute(
    //   "href",
    //   "/Users/vamsi/Desktop/QuickInventoryManagement-main/docs/" + fileName
    // );
    // anchor.setAttribute("download", "");
    // document.body.appendChild(anchor);
    // anchor.click();
    // anchor.parentNode.removeChild(anchor);
  };
const Boxes = () => {
    const [boxesData, setBoxesData] = useState([]);

    useEffect(() => {
        console.log('here')

        const fetchData = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_QR_BACKEND_URL +"/getBoxes");
                const data = await response.json();
                setBoxesData(data);
                console.log(boxesData);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
        console.log(boxesData);
    }, []);
    const navigate = useNavigate();
    return (
        <div style={{ marginTop: "60px" }}>
            {(boxesData.length === 0 || boxesData === undefined || boxesData === null || !Array.isArray(boxesData)) ? (
                <p>No Boxes created</p>
            ) : (
                boxesData.map((box) => (
                    <Accordion key={box.boxId}
                    sx={{
                        backgroundColor: box.status === "active" ? "lightgreen" : "lightgrey",
                        marginBottom: "10px"
                    }}
                    >
                        <AccordionSummary
                            expandIcon={<ArrowDropDownIcon />}
                            aria-controls={`panel${box.boxId}-content`}
                            id={`panel${box.boxId}-header`}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "lightblue",
                                padding: "10px",
                                marginBottom: "10px"
                            }}
                        >
                                <Typography style={{ fontWeight: "bold" }}>{box.boxName}</Typography>

                                <Stack direction="row" spacing={2} style={{marginLeft:'15px'}}>
                                    <Typography>Closed On: {box.boxClosedOn}</Typography>
                                    <Typography>Assigned Account: {box.assignedAccount}</Typography>
                                    <Typography>Assigned Wholesaler: {box.assignedWholesaler}</Typography>
                                </Stack>
                            </AccordionSummary>
                        <AccordionDetails>
                            {box.medicines.length === 0 ? (
                                <div>
                                    {(box.status!=="closed")?(
                                    <Button
                                        label="Go to Box"
                                        variant="contained"
                                        color="primary"
                                        style={{ marginBottom: "5px" }}
                                        onClick={() => {
                                            // Add code to navigate to the active box page
                                            navigate("/activeBox");

                                        }}
                                    >
                                        Go to Box
                                    </Button>):("")}
                                <Typography>No medicine in the box</Typography>
                                </div>
                            ) : (
                                <div>
                                    <Button
                                        label="Export Debit Memo"
                                        variant="contained"
                                        color="primary"
                                        style={{ marginBottom: "5px" }}
                                        onClick={()=>ExportToExcelAPI(box.boxId)}
                                    >
                                        Export Debit Memo
                                    </Button>
                                    {(box.status!=="closed")?(
                                    <Button
                                        label="Go to Box"
                                        variant="contained"
                                        color="primary"
                                        style={{ marginBottom: "5px" , marginLeft: "5px"}}
                                        onClick={() => {
                                            // Add code to navigate to the active box page
                                            navigate("/activeBox");
                                        }}
                                    >
                                        Go to Box
                                    </Button>):("")}
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Medicine</TableCell>
                                                <TableCell>Expiry</TableCell>
                                                <TableCell>Lot</TableCell>
                                                <TableCell>Manufacturer</TableCell>
                                                <TableCell>NDC</TableCell>
                                                <TableCell>QTY</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Dosage</TableCell>
                                                <TableCell>Price</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {box.medicines.map((medicine) => (
                                                <TableRow key={medicine.medicineID}>
                                                    <TableCell>{medicine.Medicine}</TableCell>
                                                    <TableCell>{medicine.Expiry}</TableCell>
                                                    <TableCell>{medicine.Lot}</TableCell>
                                                    <TableCell>{medicine.Manufacturer}</TableCell>
                                                    <TableCell>{medicine.NDC}</TableCell>
                                                    <TableCell>{medicine.QTY}</TableCell>
                                                    <TableCell>{medicine.desc}</TableCell>
                                                    <TableCell>{medicine.dsg}</TableCell>
                                                    <TableCell>{medicine.price}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                </div>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </div>
    );
};

export default Boxes;
