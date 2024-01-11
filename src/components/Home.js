import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import React, { useState, useRef, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { addEntry, removeEntry, editEntry } from "../reducers/dataSlice";
// import Grow from '@mui/material/Grow';
import Slide from '@mui/material/Slide';
import FormControlLabel from '@mui/material/FormControlLabel';
import icon from "./miniComponents/alertbox";
import CircularProgress from '@mui/joy/CircularProgress';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
// const ExportToExcel = require('./functions/exportToExcel.js');
// import { Result } from 'aws-cdk-lib/aws-stepfunctions';
//////// function to convert data to json format
const createData = (NDC, Manufacturer, Medicine, Lot, Expiry, mg, QTY) => {
  return { NDC, Manufacturer, Medicine, Lot, Expiry, mg, QTY };
};

const rows = [
  //
  // Add more rows as needed
];
const fetchAndParseData = async (variant) => {
  const query =
    "https://api.fda.gov/drug/ndc.json?search=product_ndc:" +
    variant +
    "&limit=1";
  const response = await fetch(query);
  const data = await response.json();
  return data;
};
const fetchData = async (NDC) => {
  var ndcVariant1 = NDC.slice(0, 5) + "-" + NDC.slice(5, 8);
  var ndcVariant2 = NDC.slice(0, 5) + "-" + NDC.slice(5, 9);
  var ndcVariant3 = NDC.slice(0, 4) + "-" + NDC.slice(4, 8);

  try {
    const resp1 = await fetchAndParseData(ndcVariant1);
    console.log(resp1);
    return resp1;
  } catch (error1) {
    try {
      const resp2 = await fetchAndParseData(ndcVariant2);
      console.log(resp2);
      return resp2;
    } catch (error2) {
      try {
        const resp3 = await fetchAndParseData(ndcVariant3);
        console.log(resp3);
        return resp3;
      } catch (error3) {
        console.error("Error fetching data for all NDC variants:", error3);
        throw error3; // Re-throw the last error if none of the variants succeed
      }
    }
  }
};
const accounts = {
  Parmed: {
      name: "ParMed Pharmaceuticals",
      companyName: "Parmed",
      address: "5960 East Shelby Drive, Suite 100",
      address2: " Memphis, TN 3841",
      phone: "(800) 727-6331",
      DEA: "xxxxxxxxxxx",
      mail: "chris.dewitt@parmedpharm.com"
  },
  Cardinal: {
      name: "Cardinal Health",
      companyName: "Acd",
      address: "7000 Cardinal Place",
      address2: "Dublin, OH 43017",
      phone: "(800) 926-3161",
      DEA: "xxxxxxxxxxx",
      mail: "krish@cardinal.com"}
}

const wholesalers = {
  Wholesaler1: {
      name: "Proud Pharmaceuticals",
      companyName: "Testing",
      address: "5960 East Shelby Drive, Suite 100",
      address2: " Memphis, TN 3841",
      phone: "(800) 727-6331",
      DEA: "xxxxxxxxxxx",
      mail: "chris.dewitt@parmedpharm.com"
  },
  Wholesaler2: {
      name: "Jealous Health",
      companyName: "Testing2",
      address: "7000 Cardinal Place",
      address2: "Dublin, OH 43017",
      phone: "(800) 926-3161",
      DEA: "xxxxxxxxxxx",
      mail: "krish@cardinal.com"}
}


const Home = () => {

  ////////// local states////////////////////////////////
  const [rowsFinal, setRows] = useState(rows);
  const [checked, setChecked] = React.useState(false);
  const [scanChecked, setScanChecked] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [continousScanningInput, setContinousScanningInput] = useState('');
  const [account, setAccount] = useState('');
  const [wholesaler, setWholesaler] = useState('');

  ///////////////////////////////////////////////////////

  /////////// redux states///////////////////////////////
  const data = useSelector((state) => state.data);
  ///////////////////////////////////////////////////////

  const dispatch = useDispatch();
  const barcodeInputRef = useRef(null);


  // console.log(data);
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior
    const barcodeValue = event.target.elements.barcodeInput.value;
    if (scanChecked) {
      // Process the barcodeInput data here
      console.log("Scanned Barcode:", barcodeInput);
    }
    console.log(`Entered barcode: ${barcodeValue}`);
    // rows.push(createData('2345678901', 'MediCare', 'Antipyretic', 'E97531', '2023-09-05', '100mg', 120))
    // console.log(rows)

    /////// converting barcode value to the original values
    var NDC = "";
    var man = "";
    var med = "";
    var lot = "";
    var exp = "";
    var mg = "";
    // var qt = 0
    var b = barcodeValue.split("(");
    for (let index = 1; index < b.length; index++) {
      let bb = b[index].split(")");
      if (bb[0] === "01") {
        NDC = bb[1].slice(3, 13);
      } else if (bb[0] === "17") {
        exp = bb[1];
        // converting yymmdd to mm/yy/dd
        exp = exp.slice(2, 4) + "/" + exp.slice(0, 2) + "/" + exp.slice(4, 6);
      } else if (bb[0] === "10") {
        lot = bb[1];
      }
    }
    const quantityInput = window.prompt("Enter Quantity:", "1");
    const quantity = parseInt(quantityInput, 10);
    if (!isNaN(quantity) && quantity > 0) {
      try {
        var res = await fetchData(NDC);

        man = res["results"][0].labeler_name;
        med = res["results"][0].brand_name;
        mg = res["results"][0].active_ingredients[0].strength;

        // console.log(man)
        setRows((prevRows) => [
          ...prevRows,
          createData(NDC, man, med, lot, exp, mg, quantity),
        ]);
        dispatch(addEntry(createData(NDC, man, med, lot, exp, mg, quantity)));
        console.log("dispatched entry");
      } catch (err) {
        alert("Please enter a valid code");
        console.log(err);
      }
    } else {
      console.log("Please enter a valid quantity");
    }

    // const query = 'https://api.fda.gov/drug/ndc.json?search=product_ndc:'+NDC+'&limit=1';

    // clearing search bar input after sending the data
    document.getElementById("barcodeInput").value = "";
    // console.log(barcodeInput)
    // console.log(data);
    

  };

  /////// function to handle scan button clicked 
  const handleClickScan = () => {
    setScanChecked(true);
    if (barcodeInputRef.current) {
      barcodeInputRef.current.click();
      barcodeInputRef.current.focus();
    }
  };

  const handleChangeAccount = (event) => {
    setAccount(event.target.value);
  };
  
  const handleChangeWholesaler = (event) => {
    setWholesaler(event.target.value);
  }

  ////////////// function to get input even without input being entered
  // document.addEventListener("keypress", function(e) {
  //   if (e.target.tagName !== "INPUT") {
  //     var input = document.querySelector(".barInput");
  //     input.focus();
  //     input.value = e.key;
  //     e.preventDefault();
  //   }
  //   // console log the input captured and appending to continousScaningInput state
  //   console.log(input.value);
  //   setBarcodeInput((prev) => prev + e.key);
  //   // console.log(barcodeInput)
    
  //   // setContinousScanningInput((prev) => prev + e.key);
  //   // console.log(continousScanningInput)
  // });


  // useEffect(() => {
  //   const handleKeyPress = (e) => {

  //     if (e.target.tagName !== 'INPUT' && barcodeInputRef.current) {
  //       barcodeInputRef.current.focus();
  //       barcodeInputRef.current.value = e.key;
  //       e.preventDefault();
  //       setBarcodeInput((prev) => prev + e.key);
  //       console.log(barcodeInput) 

  //     }
  //   };

  //   document.addEventListener('keypress', handleKeyPress);
  //   console.log(barcodeInput)
  //   return () => {
  //     document.removeEventListener('keypress', handleKeyPress);
  //   };
    
  // }, []);



  const ExportToExcelAPI = async () => {
    // console.log(rowsFinal)
      setChecked((prev) => true);

    var dataObj = {};
    dataObj["data"] = rowsFinal;
    dataObj = JSON.stringify(dataObj);
    var acc = accounts[account];
    var whole = wholesalers[wholesaler];
    try {
      await fetch("http://localhost:105/extodm/invoice.xlsx", {
        method: "POST",
        body: JSON.stringify({
          data: data['data'],
          account: acc,
          wholesaler: whole
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((json) => console.log(json));
    } catch (err) {
      console.log(err);
    }
    // setting the checked state to false after two seconds
    setTimeout(() => {
      setChecked((prev) => false);
    }, 1000);
  };

  return (
    <div className="App">
      <Box
      
        component="form"
        onSubmit={handleFormSubmit}
        noValidate
        autoComplete="off"
      >
        
      <TextField
          id="barcodeInput"
          // ref = {barcodeInputRef}
          name="barcodeInput"
          label="Click here and scan"
          variant="outlined"
          // value={barcodeInput}
          // type="text"
          // class = 'barInput'
          // onChange={(e) => setBarcodeInput(e.target.value)}
          // style={{ position: 'absolute', top: 0, left: 0, 
          // visibility: 'hidden' 
        // }}
        />
      
        {/* ternary operator to switch between two components */}
        {/* {!scanChecked ? <CircularProgress size="lg" determinate value={100}
        onClick={handleClickScan}
        >
        Scan
      </CircularProgress> : <CircularProgress size="lg" 
      onClick={() => {
        setScanChecked(false)
      }
      }
      >
        Stop
      </CircularProgress>} */}
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>NDC</TableCell>
              <TableCell align="left">Manufacturer</TableCell>
              <TableCell align="left">Medicine</TableCell>
              <TableCell align="left">Lot</TableCell>
              <TableCell align="left">Expiry</TableCell>
              <TableCell align="left">mg</TableCell>
              <TableCell align="left">QTY</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {/* {rowsFinal.map((row) => ( */}
            {data['data'].map((row) => (
              <TableRow
                key={row.NDC}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.NDC}
                </TableCell>
                <TableCell align="left">{row.Manufacturer}</TableCell>
                <TableCell align="left">{row.Medicine}</TableCell>
                <TableCell align="left">{row.Lot}</TableCell>
                <TableCell align="left">{row.Expiry}</TableCell>
                <TableCell align="left">{row.mg}</TableCell>
                <TableCell align="left">{row.QTY}</TableCell>
                {/* button to remote the entry */}
                <TableCell align="left">
                  <Stack>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => {
                        var index = -1; 
                        for (let i = 0; i < rowsFinal.length; i++)
                        {
                          if (rowsFinal[i].NDC === row.NDC)
                          {
                            index = i;
                            break;
                          }
                        }
                        if(index !== -1)
                       { console.log(rowsFinal)
                        console.log(index)
                          console.log('came here')
                          const newValue = window.prompt(
                            "Enter new quantity: "
                          );
                          const newQuantity = parseInt(newValue, 10);
                          if (!isNaN(newQuantity) && newQuantity > 0) {
                            // row.QTY = newQuantity;
                            // setRows([...rowsFinal]);
                            // dispatch(editEntry(row));
                            // console.log(data)
                            const updatedRows = [...rowsFinal]; // Create a copy of the array
                            updatedRows[index] = { ...updatedRows[index], QTY: newQuantity }; // Create a copy of the object with updated quantity
                            setRows(updatedRows);
                            dispatch(editEntry(updatedRows[index])); // Assuming editEntry expects an updated row as an argument
                            console.log(data);
                        }}

                      }}
                    >
                      Edit
                    </Button>
                  </Stack>
                </TableCell>
                <TableCell align="left">
                  <Stack>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        const index = rowsFinal.indexOf(row);
                        if (index > -1) {
                          rowsFinal.splice(index, 1);
                          setRows([...rowsFinal]);
                        }
                      dispatch(removeEntry(row.NDC));
                      }
                    }
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            // console.log(rowsFinal)
            ExportToExcelAPI();
          }}
        >
          Export
        </Button>
      </Stack>
      <Slide direction="up" in={checked} mountOnEnter unmountOnExit>
        {icon}
      </Slide>
      <FormControl 
      style={{
        marginTop: '10px',
      }}
      >
        <InputLabel id="account">Account</InputLabel>
        <Select
          labelId="account"
          id="account"
          value={account}
          label="Account"
          onChange={handleChangeAccount}
          onLoad={()=>{
          }}
        >
          {Object.keys(accounts).map((e, v)=> <MenuItem value={e}>{e}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl 
      style={{
        marginTop: '10px',
      }}
      >
        <InputLabel id="wholesaler">Wholesaler</InputLabel>
        <Select
          labelId="wholesaler"
          id="wholesaler"
          value={wholesaler}
          label="wholesaler"
          onChange={handleChangeWholesaler}
        >
          {Object.keys(wholesalers).map((e, v)=> <MenuItem value={e}>{e}</MenuItem>)}
        </Select>
      </FormControl>
    </div>
  );
};

export default Home;
