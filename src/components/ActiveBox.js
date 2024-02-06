import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
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
import { useSelector, useDispatch } from "react-redux";
import { addEntry, removeEntry, editEntry } from "../reducers/dataSlice";
import { addFullEntry } from "../reducers/fullDataSlice";
import Slide from "@mui/material/Slide";
import icon from "./miniComponents/alertbox";
import CircularProgress from "@mui/joy/CircularProgress";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { green } from "@mui/material/colors";
import CheckIcon from "@mui/icons-material/Check";
import ModalComponent from "./miniComponents/modal";
import getActiveBox from "../functions/getActiveBox";
import getMedicines from "../functions/getMedicines";
import getAccounts from "../functions/getAccounts";
import getWholesalers from "../functions/getWholesalers";

//////// function to convert data to json format
const createData = (
  NDC,
  Manufacturer,
  Medicine,
  Lot,
  Expiry,
  mg,
  QTY,
  dsg,
  desc,
  price
) => {
  return {
    NDC,
    Manufacturer,
    Medicine,
    Lot,
    Expiry,
    mg,
    QTY,
    dsg,
    desc,
    price,
  };
};

const fetchAndParseData = async (variant) => {
  console.log(process.env.REACT_APP_QR_OPENFDA_SEARCH_URL);
  const query =
    process.env.REACT_APP_QR_OPENFDA_SEARCH_URL + variant + "&limit=1";
  const response = await fetch(query);
  const data = await response.json();
  return data;
};

///////////////// function to fetch product only on NDC alone
// const fetchProductNDC = async (ndc) => {
//   ////// remove all other characters and placing only numbers in the string
//   ndc = ndc.replace(/\D/g, "");
//   console.log(ndc);

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

const ActiveBox = () => {
  ////////// local states////////////////////////////////
  const [rowsFinal, setRows] = useState([]);
  const [checked, setChecked] = React.useState(false);
  const [scanChecked] = useState(false);
  const [barcodeInput] = useState("");
  // const [continousScanningInput, setContinousScanningInput] = useState("");
  const [accountsSetted, setAccountsSetted] = useState("");
  const [wholesalersSetted, setWholesalersSetted] = useState("");
  // const [openSlide, setOpenSlide] = React.useState(false);
  // const [lotState, setLot] = React.useState("");
  // const [expState, setExp] = React.useState("");
  const [loading, setReportLoading] = React.useState(false);
  const [success, setReportSuccess] = React.useState(false);
  const [medicineInfo, setMedicineInfo] = React.useState({});
  const [activeBox, setActiveBox] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [medicinesInBox, setMedicinesInBox] = useState([]);
  const [accounts, setAccounts] = useState({});
  const [wholesalers, setWholesalers] = useState({});

  ///////////////////////////////////////////////////////

  /////////// redux states///////////////////////////////
  const data = useSelector((state) => state.data);
  const fullData = useSelector((state) => state.fullData);

  ///////////////////////////////////////////////////////
  const timer = React.useRef();
  const dispatch = useDispatch();
  // const barcodeInputRef = useRef(null);

  ////////////////////////////////////////////////////////////////////

  /////////// function to set export button state //////////////////////
  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      "&:hover": {
        bgcolor: green[700],
      },
    }),
  };

  useEffect(() => {
    return async () => {
      const activeBoxData = await getActiveBox();
      const accounts = await getAccounts();
      const wholesalers = await getWholesalers();
      console.log(accounts);
      setAccounts(accounts);
      setWholesalers(wholesalers);
      console.log(wholesalers);
      // console.log(activeBoxData);
      setActiveBox(activeBoxData);
      const medicinesInBoxData = await getMedicines(activeBoxData.boxName);
      if ("error" in medicinesInBoxData) {
        // console.log('came here')
        setRows([]);
        console.log(rowsFinal.length);
      } else {
        console.log(medicinesInBoxData);
        setRows(medicinesInBoxData);
      }

      // setRows(medicinesInBoxData);
      for (let i = 0; i < medicinesInBoxData.length; i++) {
        dispatch(addEntry(medicinesInBoxData[i]));
      }
      clearTimeout(timer.current);
    };
  }, []);

  const handleExportReportButtonClick = () => {
    if (!loading) {
      setReportSuccess(false);
      setReportLoading(true);
      ExportToReportAPI();
    }
    console.log(activeBox);
    console.log(fullData);
  };
  /////////////////////////////////////////////////////////////////////

  const insertMedicine = (mInfo) => {
    // console.log(mInfo)

    // Prepare the data to be sent in the request body
    const data = {
      NDC: mInfo.NDC,
      Manufacturer: mInfo.Manufacturer,
      Medicine: mInfo.Medicine,
      Lot: mInfo.Lot,
      Expiry: mInfo.Expiry,
      mg: mInfo.mg,
      QTY: mInfo.QTY,
      dsg: mInfo.dsg,
      desc: mInfo.desc,
      price: mInfo.price,
    };

    // Make the POST request
    fetch(process.env.REACT_APP_QR_BACKEND_URL + "/addMedicineToBox", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        // Handle the response from the server and return the response
        console.log(result);
        setRows(result); // Set the rows state with the received data
        // return result;
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error(error);
      });
  };

  // console.log(data);
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior
    const barcodeValue = event.target.elements.barcodeInput.value;
    if (scanChecked) {
      // Process the barcodeInput data here
      console.log("Scanned Barcode:", barcodeInput);
    }
    console.log(`Entered barcode: ${barcodeValue}`);

    /////// converting barcode value to the original values
    var NDC = "";
    var man = "";
    var med = "";
    var lot = "";
    var exp = "";
    var mg = "";
    var dsg = "";
    // var qt = 0
    // counting all the integers in the given input
    var count = (barcodeValue.match(/\d/g) || []).length;
    // console.log(count)
    if (count > 0 && count < 11) {
      NDC = barcodeValue.match(/\d/g);
      NDC = NDC.join("");
      const lotInput = window.prompt("Enter Lot Number:", "");
      lot = lotInput;
      const expInput = window.prompt("Enter Expiry Date(MM/YY/DD):", "");
      exp = expInput;

      // const window.prompt()
      // setOpenSlide(true);
      // lot = lotState;
      // exp = expState;
    } else {
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
    }
    if (lot !== "" && exp !== "") {
      const quantityInput = window.prompt("Enter Quantity:", "1");
      const quantity = parseInt(quantityInput, 10);
      const priceInput = window.prompt("Enter Price:", "1");
      const price = parseFloat(priceInput, 10);

      if (!isNaN(quantity) && quantity > 0) {
        try {
          var res = await fetchData(NDC);
          // matching NDC last two digits with the packaging
          var packaging = res["results"][0].packaging;
          packaging.forEach((element) => {
            if (element["package_ndc"].split("-")[2] === NDC.slice(-2)) {
              res["results"][0].description = element["description"];
            }
          });
          dispatch(addFullEntry(res["results"][0]));

          // console the redux results
          var desc = res["results"][0].description;
          dsg = res["results"][0].dosage_form;
          man = res["results"][0].labeler_name;
          med = res["results"][0].brand_name;
          mg = res["results"][0].active_ingredients[0].strength;
          // console.log(res["results"][0].medicineID)
          var medicineData = createData(
            NDC,
            man,
            med,
            lot,
            exp,
            mg,
            quantity,
            dsg,
            desc,
            price
          );

          insertMedicine(medicineData);
          // console.log(rowsFinal)
          // setRows((prevRows) => {
          //   if (prevRows.error === 'No medicines found for the given box name') {
          //     return [medicineData];
          //   } else {
          //     return [...prevRows, medicineData];
          //   }
          // });

          dispatch(addEntry(medicineData));
          setReportSuccess(false);
          setReportLoading(false);
          console.log("dispatched entry");
        } catch (err) {
          alert("Please enter a valid code");
          console.log(err);
        }
      } else {
        console.log("Please enter a valid quantity");
      }
    }
    // const query = 'https://api.fda.gov/drug/ndc.json?search=product_ndc:'+NDC+'&limit=1';

    // clearing search bar input after sending the data
    document.getElementById("barcodeInput").value = "";
    // console.log(barcodeInput)
    // console.log(data);
  };

  const handleEditMedicineEntry = (row) => {
    var index = -1;
    for (let i = 0; i < rowsFinal.length; i++) {
      if (rowsFinal[i].NDC === row.NDC) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      const newValue = window.prompt("Enter new quantity: ");
      const newPrice = window.prompt("Enter new price: ");
      const newQuantity = parseInt(newValue, 10);
      const newPriceValue = parseFloat(newPrice, 10);
      if (!isNaN(newQuantity) && newQuantity > 0) {
        // const updatedRows = [...rowsFinal]; // Create a copy of the array
        // updatedRows[index] = {
        //   ...updatedRows[index],
        //   QTY: newQuantity,
        // }; // Create a copy of the object with updated quantity
        // setRows(updatedRows);
        // dispatch(editEntry(updatedRows[index])); // Assuming editEntry expects an updated row as an argument
        // console.log(data);
        fetch(process.env.REACT_APP_QR_BACKEND_URL + "/editMedicineInBox", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicineID: row.medicineID,
            boxName: activeBox.boxName,
            QTY: newQuantity,
            price: newPriceValue,
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            // Handle the response from the server
            console.log(result);
            if (result.error) {
              setRows([]);
            } else {
              setRows(result);
            }
          })
          .catch((error) => {
            // Handle any errors that occurred during the request
            console.error(error);
          });
      }
      if (!isNaN(newPriceValue) && newPriceValue > 0) {
        const updatedRows = [...rowsFinal]; // Create a copy of the array
        updatedRows[index] = {
          ...updatedRows[index],
          price: newPriceValue,
        }; // Create a copy of the object with updated quantity
        setRows(updatedRows);
        dispatch(editEntry(updatedRows[index])); // Assuming editEntry expects an updated row as an argument
        console.log(data);
      }
    }
  };
  /////// function to handle scan button clicked

  const handleChangeAccount = (event) => {
    setAccountsSetted(event.target.value);
    fetch(process.env.REACT_APP_QR_BACKEND_URL+'/setAccountToBox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        boxId: activeBox.boxId,
        account: event.target.value
      })
    })
      .then(response => response.json())
      .then(result => {
        // Handle the response from the server
        console.log(result);
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        console.error(error);
      });
  };
  

  const handleChangeWholesaler = (event) => {
    setWholesalersSetted(event.target.value);
    fetch(process.env.REACT_APP_QR_BACKEND_URL+'/setWholesalerToBox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        boxId: activeBox.boxId,
        wholesaler: event.target.value
      })
    })
      .then(response => response.json())
      .then(result => {
        // Handle the response from the server
        console.log(result);
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        console.error(error);

      });
  };

  const ExportToExcelAPI = async () => {
    if (
      accountsSetted === null ||
      wholesalersSetted === null ||
      accountsSetted === "" ||
      wholesalersSetted === ""
    ) {
      alert("Please select account and wholesaler");
      return;
    }
    // console.log(rowsFinal)
    setChecked((prev) => true);
    var fileName = "invoice.xlsx";
    var dataObj = {};
    dataObj["data"] = rowsFinal;
    dataObj = JSON.stringify(dataObj);
    var acc = accounts[accountsSetted];
    var whole = wholesalers[wholesalersSetted];
    try {
      await fetch(
        process.env.REACT_APP_QR_BACKEND_URL + "/extodm/" + fileName,
        {
          method: "POST",
          body: JSON.stringify({
            data: data["data"],
            account: acc,
            wholesaler: whole,
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
    setTimeout(() => {
      setChecked((prev) => false);
    }, 1000);

    var anchor = document.createElement("a");
    anchor.setAttribute(
      "href",
      "/Users/vamsi/Desktop/QuickInventoryManagement-main/docs/" + fileName
    );
    anchor.setAttribute("download", "");
    document.body.appendChild(anchor);
    anchor.click();
    anchor.parentNode.removeChild(anchor);
  };

  const ExportToReportAPI = async () => {
    var dataObj = {};
    dataObj["data"] = rowsFinal;
    dataObj = JSON.stringify(dataObj);
    try {
      await fetch(process.env.REACT_APP_QR_BACKEND_URL + "/extoreport/", {
        method: "POST",
        body: dataObj,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((json) => console.log(json));
    } catch (err) {
      console.log(err);
    }
    timer.current = window.setTimeout(() => {
      setReportSuccess(true);
      setReportLoading(false);
    }, 2000);
  };
  const handleBoxHover = () => {
    setIsHovered(true);
  };

  const handleBoxLeave = () => {
    setIsHovered(false);
  };

  const handleConfirmationOpen = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
  };

  const handleConfirmationYes = () => {
    console.log("closed");
    if(accountsSetted === null || accountsSetted.length === 0 || wholesalersSetted === null || wholesalersSetted.length === 0 || accountsSetted==="" || wholesalersSetted===""){
      alert("Please select account and wholesaler");
      return;
    }
    

    try {
      fetch(process.env.REACT_APP_QR_BACKEND_URL + "/closeBox", {
        method: "POST",
        body: JSON.stringify({
          boxId: activeBox.boxId,
          account: accountsSetted,
          wholesaler: wholesalersSetted,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((json) => {
          setRows([]);
          console.log(json)});
    } catch (err) {
      console.log(err);
    }
    setIsConfirmationOpen(false);
    setActiveBox({});
  };

  const handleCreateBox = async () => {
    try {
      await fetch(process.env.REACT_APP_QR_BACKEND_URL + "/createBox", {
        method: "GET",
      })
        .then((response) => response.json())
        .then((json) => {
          console.log(json);
          setActiveBox(json); // Set the active box using the response
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <Box
        component="form"
        onSubmit={handleFormSubmit}
        noValidate
        autoComplete="off"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <TextField
          id="barcodeInput"
          name="barcodeInput"
          label="Click here to enter NDC or Scan the 2d barcode"
          variant="outlined"
          style={{ width: "500px" }}
        />

        <div>
          <Box
            sx={{
              border: "1px dashed",
              borderColor: "primary.main",
              padding: "10px",
              // marginLeft: '10px',
            }}
            onMouseEnter={handleBoxHover}
            onMouseLeave={handleBoxLeave}
          >
            {activeBox === undefined || activeBox.boxName === undefined ? (
              <Button onClick={handleCreateBox}>Create Box</Button>
            ) : (
              <div>
                <p>{"Active Box: " + activeBox.boxName}</p>
                {isHovered && (
                  <div>
                    <Button onClick={handleConfirmationOpen}>
                      Close the box
                    </Button>
                    {isConfirmationOpen && (
                      <div>
                        <p>Are you sure you want to close the box?</p>
                        <Button onClick={handleConfirmationYes}>Yes</Button>
                        <Button onClick={handleConfirmationClose}>No</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Box>
        </div>

        {/* Export button aligned to the right */}
        <Box sx={{ m: 1, position: "relative" }}>
          <Button
            variant="contained"
            sx={buttonSx}
            disabled={loading}
            onClick={handleExportReportButtonClick}
          >
            {success ? <CheckIcon /> : "Export Report"}
          </Button>
          {loading && (
            <CircularProgress
              sx={{
                color: green[500],
                width: 40,
                height: 40,
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Box>
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
              <TableCell align="left">Price {"(usd)"}</TableCell>
              <TableCell align="left">Total Price {"(usd)"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {rowsFinal.map((row) => ( */}
            {rowsFinal.length === 0 ? (
              <TableRow
                key="1"
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {"No medicines found for the given box name"}
                </TableCell>
              </TableRow>
            ) : (
              rowsFinal.map((row) => (
                <TableRow
                  key={row.NDC}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.NDC}
                  </TableCell>
                  <TableCell align="left">{row.Manufacturer}</TableCell>
                  <TableCell
                    align="left"
                    onClick={() => {
                      var thisMedicine = {};

                      fullData["fullData"].forEach((element) => {
                        if (
                          element["product_ndc"].split("-").join("") ===
                          row.NDC.slice(0, row.NDC.length - 2)
                        ) {
                          thisMedicine = element;
                        }
                      });
                      if (!Object.isExtensible(thisMedicine)) {
                        thisMedicine = { ...thisMedicine }; // Create a new object that is extensible
                      }
                      thisMedicine["status"] = true; // Add the property

                      setMedicineInfo(thisMedicine);
                    }}
                  >
                    {row.Medicine}
                  </TableCell>
                  <TableCell align="left">{row.Lot}</TableCell>
                  <TableCell align="left">{row.Expiry}</TableCell>
                  <TableCell align="left">{row.mg}</TableCell>
                  <TableCell align="left">{row.QTY}</TableCell>
                  <TableCell align="left">{row.price}</TableCell>
                  <TableCell align="left">
                    {(parseFloat(row.price) * parseFloat(row.QTY)).toFixed(2)}
                  </TableCell>

                  {/* button to remote the entry */}
                  <TableCell align="left">
                    <Stack>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                          handleEditMedicineEntry(row);
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
                          console.log(row);
                          // const index = rowsFinal.indexOf(row);
                          // if (index > -1) {
                          //   rowsFinal.splice(index, 1);
                          //   setRows([...rowsFinal]);
                          // }
                          fetch(
                            process.env.REACT_APP_QR_BACKEND_URL +
                              "/deleteMedicineFromBox",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                medicineID: row.medicineID,
                                boxName: activeBox.boxName,
                              }),
                            }
                          )
                            .then((response) => response.json())
                            .then((result) => {
                              // Handle the response from the server
                              console.log(result);
                              if (result.error) {
                                setRows([]);
                              } else {
                                setRows(result);
                              }
                            })
                            .catch((error) => {
                              // Handle any errors that occurred during the request
                              console.error(error);
                            });

                          // dispatch(removeEntry(row.NDC));
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <FormControl
        style={{
          marginTop: "10px",
        }}
      >
        <InputLabel id="account">Account</InputLabel>
        <Select
          labelId="account"
          id="account"
          value={accountsSetted}
          label="Account"
          onChange={handleChangeAccount}
          onLoad={() => {}}
          style={{
            width: "200px",
          }}
        >
          {Object.keys(accounts).map((e, v) => (
            <MenuItem value={e}>{accounts[e]['name']}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        style={{
          marginTop: "10px",
        }}
      >
        <InputLabel id="wholesaler">Wholesaler</InputLabel>
        <Select
          labelId="wholesaler"
          id="wholesaler"
          value={wholesalersSetted}
          label="wholesaler"
          onChange={handleChangeWholesaler}
          style={{
            width: "200px",
          }}
        >
          {Object.keys(wholesalers).map((e, v) => (
            <MenuItem value={e}>{wholesalers[e]['name']}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Stack
        style={{
          marginTop: "50px",
          width: "100%",
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            // console.log(rowsFinal)
            ExportToExcelAPI();
          }}
          style={{
            width: "200px",
          }}
        >
          Export
        </Button>
      </Stack>
      <Slide direction="up" in={checked} mountOnEnter unmountOnExit>
        {icon}
      </Slide>
      <ModalComponent
        openMedicineInfo={medicineInfo}
        handleMedicineInfoClose={() => {
          medicineInfo.status = false;
          setMedicineInfo(medicineInfo);
        }}
      />
    </div>
  );
};

export default ActiveBox;
