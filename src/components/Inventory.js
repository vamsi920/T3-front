import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
// import Table from "@mui/material/Table";
// import TableBody from "@mui/material/TableBody";
// import TableCell from "@mui/material/TableCell";
// import TableContainer from "@mui/material/TableContainer";
// import TableHead from "@mui/material/TableHead";
// import TableRow from "@mui/material/TableRow";
// import Paper from "@mui/material/Paper";
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
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
// import Typography from "@mui/material/Typography";
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import Chip from "@mui/material/Chip";
import { Grid } from "@mui/material";
import axios from "axios";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_QR_BACKEND_URL + "/inventory/getAllStores"
        );
        const data = await response.json();
        let dataFinal = data.data;
        // console.log(Object.keys(dataFinal))
        var dataFinalArray = [];
        var dataFinalArray2 = [];
        for (let key in dataFinal) {
          for (let i = 0; i < dataFinal[key].length; i++) {
            dataFinal[key][i]["SHELF"] = key;
            dataFinalArray.push(dataFinal[key][i]);
          }
        }
        for (let i = 0; i < dataFinalArray.length; i++) {
          var emptyObj = {};
          for (let key in dataFinalArray[i]) {
            if (key !== "SHELF") {
              emptyObj = dataFinalArray[i][key];
            } else {
              emptyObj["SHELF"] = dataFinalArray[i][key];
              emptyObj["id"] = i;
            }
          }
          dataFinalArray2.push(emptyObj);
        }
        dataFinalArray = dataFinalArray2;
        // appending all the present shelfs into shelfs array
        const shelfs = Array.isArray(dataFinalArray)
          ? dataFinalArray.map((item) => item.SHELF)
          : [];
        const uniqueShelfs = [...new Set(shelfs)];
        setShelfs(uniqueShelfs);
        // console.log(uniqueShelfs);
        setInventory(dataFinalArray);
        // console.log(inventory)

      } catch (error) {
        console.log(error);
      }

    };

    fetchData();
    // console.log(shelfs);
  }, []);
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "NDC", headerName: "NDC", width: 150 },
    { field: "MFG", headerName: "MFG", width: 250 },
    { field: "NAME", headerName: "NAME", width: 300 },
    { field: "LOT", headerName: "LOT", width: 120 },
    { field: "EXP", headerName: "EXP", width: 90 },
    { field: "YEAR", headerName: "YEAR", width: 100 },
    { field: "QTY", headerName: "QTY", width: 80, editable: true },
    { field: "SHELF", headerName: "SHELF", width: 100, editable: true },
  ];
  const [ndc, setNdc] = useState("");
  const [mfg, setMfg] = useState("");
  const [name, setName] = useState("");
  const [lot, setLot] = useState("");
  const [exp, setExp] = useState("");
  const [year, setYear] = useState("");
  const [qty, setQty] = useState("");
  const [shelf, setShelf] = useState("");
  const [shelfs, setShelfs] = useState("");
  const [newShelf, setNewShelf] = useState("");
  // const [barcodeInput, setBarcodeInput] = useState("");

  const handleMedicineSubmit = async (e) => {
    e.preventDefault();

    // Perform form submission logic here
    // You can access the form values using the state variables (ndc, mfg, name, lot, exp, year, qty, shelf)
    console.log(ndc, mfg, name, lot, exp, year, qty, shelf);
    if(mfg===""){
      const res = await fetchData(ndc);
      var packaging = res["results"][0].packaging;
          packaging.forEach((element) => {
            if (element["package_ndc"].split("-")[2] === ndc.slice(-2)) {
              res["results"][0].description = element["description"];
            }
          });
          // var desc = res["results"][0].description;
          // var dsg = res["results"][0].dosage_form;
          var man = res["results"][0].labeler_name;
          var med = res["results"][0].brand_name;
          // var mg = res["results"][0].active_ingredients[0].strength;
          console.log(res);
          setMfg(man);
          setName(med);

    }
      
    try {
      // first we check if the medicine is present or not from the inventory Array 
      var present = false;
      var shelfPresent = false;
      for (let i = 0; i < inventory.length; i++) {
        if (inventory[i].NDC === ndc && inventory[i].LOT === lot && inventory[i].EXP === exp && inventory[i].YEAR === year) {
          present = true;
          // break;
          if(inventory[i].SHELF === shelf){
              console.log("same shelf");
              shelfPresent = true;
              var oldInventory = inventory[i];
              inventory[i].QTY = parseInt(inventory[i].QTY) + parseInt(qty);
              console.log(inventory[i].QTY);
              const response = await axios.post(
                process.env.REACT_APP_QR_BACKEND_URL + "/inventory/updateMedicine",
                {
                  storeName: "Quick Returns",
                  originalMed: oldInventory,
                  updatedMed: inventory[i],
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log(response.data);

          }
          else{
            console.log("different shelf");
          }
        }
       
      
    }

    if(present === false){
      const response = await axios.post(
        process.env.REACT_APP_QR_BACKEND_URL + "/inventory/addMedicine",
        {
          shelfName: shelf,
          storeName: "Quick Returns",
          medicineData: {
            NDC: ndc,
            MFG: mfg,
            NAME: name,
            LOT: lot,
            EXP: exp,
            YEAR: year,
            QTY: qty,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      }
      else{
        if(shelfPresent === false){
          const response = await axios.post(
            process.env.REACT_APP_QR_BACKEND_URL + "/inventory/attachMedicineToNewShelf",
            {
              storeName: "Quick Returns",
              NDC: ndc,
              LOT: lot,
              YEAR: year,
              EXP: exp,
              shelfName: shelf,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          console.log(response.data);
        }
      }
    } catch (error) {
      console.log("Error:", error);
      // Handle the error appropriately
    }
    
    // Reset form fields
    setNdc("");
    setMfg("");
    setName("");
    setLot("");
    setExp("");
    setYear("");
    setQty("");
    setShelf("");
    // setNewShelf("");
  };

  const handleAddShelf = async () => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_QR_BACKEND_URL + "/inventory/addShelf",
        {
          shelfName: newShelf,
          storeName: "Quick Returns", // Replace with the actual store name
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);

    } catch (error) {
      console.log("Error:", error);
      // Handle the error appropriately
    }
  };

  // Call the handleAddShelf function when the form is submitted
  const handleShelfSubmit = (e) => {
    e.preventDefault();
    if(newShelf === ""){
      alert("Please enter a shelf name");
      return;
    }
    if(shelfs.includes(newShelf)){
      alert("Shelf already exists");
      return;
    }

    // Perform form submission logic here
    // You can access the form values using the state variables (newShelf)
    // console.log(newShelf);
    handleAddShelf();
    // Add the new shelf to the shelfs state
    setShelfs([...shelfs, newShelf]);

    // Reset form fields
    setNewShelf("");
  };

  const fetchAndParseData = async (variant) => {
    console.log(process.env.REACT_APP_QR_OPENFDA_SEARCH_URL);
    const query =
      process.env.REACT_APP_QR_OPENFDA_SEARCH_URL + variant + "&limit=1";
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

  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior
    const barcodeValue = event.target.elements.barcodeInput.value;
    // if (scanChecked) {
    //   // Process the barcodeInput data here
    //   console.log("Scanned Barcode:", barcodeInput);
    // }
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
      const shelfNameInput = window.prompt("Enter Shelf Name:", "");
      if (!shelfs.includes(shelfNameInput)) {
        const createNewShelf = window.confirm("Shelf does not exist. Do you want to create a new shelf?");
        if (createNewShelf) {
          handleAddShelf(shelfNameInput);
          setShelfs([...shelfs, shelfNameInput]);
        } else {
          alert("Please enter a valid shelf name (Ex: A1, A2, etc.)");
          return;
        }
      }

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
          var desc = res["results"][0].description;
          dsg = res["results"][0].dosage_form;
          man = res["results"][0].labeler_name;
          med = res["results"][0].brand_name;
          mg = res["results"][0].active_ingredients[0].strength;
          console.log(res);
          setNdc(NDC);
          setLot(lot);
          const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
          const expMonth = months[parseInt(exp.slice(0, 2)) - 1];
          const expYear = "20" + exp.slice(3, 5);

          setExp(expMonth);
          setYear(expYear);
          setQty(quantity);
          setShelf(shelfNameInput);
          setMfg(man);
          setName(med);


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


  const handleDeleteShelf = async (shelfName) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_QR_BACKEND_URL + "/inventory/deleteShelf",
        {
          shelfName: shelfName,
          storeName: "Quick Returns", // Replace with the actual store name
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);

      // Delete the shelf from the shelfs state
      setShelfs(shelfs.filter((shelf) => shelf !== shelfName));
    } catch (error) {
      console.log("Error:", error);
      // Handle the error appropriately
    }
  }

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "grey", textTransform: "uppercase", marginTop:"70px" }}>Inventory Page</h1>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginRight: "150px",
          marginBottom: "10px",
        }}
      >
       
        <Accordion style={{ boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
           marginTop: "10px" }}>
          <AccordionSummary
            //   expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            style={{ justifyContent: "flex-end", color: "blue" }}
          >
            + Add Medicine
          </AccordionSummary>
          <AccordionDetails>
            <form 
              onSubmit={handleFormSubmit}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ marginBottom: "10px", display: "flex" }}>
                {/* <TextField
                  label="Click here and scan 2D bar"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="form-input"
                  sx={{ width: "100%" }}
                /> */}
                <TextField
          id="barcodeInput"
          name="barcodeInput"
          label="Click here to enter NDC or Scan the 2d barcode"
          variant="outlined"
          style={{ width: "500px" }}
        />
              </Box>
            </form>
Or
            <hr style={{ border: "none", borderTop: "1px dotted black", margin: "20px 0" }} />

            <form
              onSubmit={handleMedicineSubmit}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ marginBottom: "10px", display: "flex" }}>
                <TextField
                  label="NDC"
                  value={ndc}
                  onChange={(e) => setNdc(e.target.value)}
                  className="form-input"
                />
                <TextField
                  label="LOT"
                  value={lot}
                  onChange={(e) => setLot(e.target.value)}
                  className="form-input"
                  style={{ marginLeft: "10px" }}
                />
              </Box>
              {/* <Box sx={{ marginBottom: "10px" }}>
                <TextField
                  label="MFG"
                  value={mfg}
                  onChange={(e) => setMfg(e.target.value)}
                  className="form-input"
                />
              </Box>
              <Box sx={{ marginBottom: "10px" }}>
                <TextField
                  label="NAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </Box> */}
              <Box sx={{ marginBottom: "10px", display: "flex" }}>
                <TextField
                  label="EXP"
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="form-input"
                />
                <TextField
                  label="YEAR"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="form-input"
                  style={{ marginLeft: "10px" }}
                />
              </Box>
              <Box sx={{ marginBottom: "10px", display: "flex" }}>
                <TextField
                  label="QTY"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="form-input"
                />
                <TextField
                  label="SHELF"
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  className="form-input"
                  style={{ marginLeft: "10px" }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="form-button"

              >
                Submit
              </Button>
            </form>
          </AccordionDetails>
        </Accordion>
        <Accordion
          style={{

            boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
            marginTop: "10px",
            marginLeft: "10px",
          }}
        >
          <AccordionSummary
            //   expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            style={{ justifyContent: "flex-end", color: "blue" }}
          >
            + Add Shelf
          </AccordionSummary>
          <AccordionDetails>
            <form
              onSubmit={handleShelfSubmit}
              style={{ display: "flex", flexDirection: "row" }}
            >
              <Box sx={{ marginRight: "10px" }}>
                <TextField
                  label="New Shelf Label"
                  value={newShelf}
                  onChange={(e) => setNewShelf(e.target.value)}
                  className="form-input"
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="form-button"
              >
                Submit
              </Button>
            </form>
            <Stack
              direction={"row"}
              spacing={2}
              style={{ marginTop: "10px", width: "400px" }}
            >
              <Grid container spacing={2}>
                {shelfs.length > 0 ? (
                  shelfs.map((shelf) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                      <Chip
                        label={shelf}
                        onClick={() => {
                          const confirmDelete = window.confirm("Are you sure you want to delete the shelf?");
                          if (confirmDelete) {
                            handleDeleteShelf(shelf);
                          }
                        }}
                        style={{
                          width: "100%",
                          margin: "5px",
                          borderRadius: "5px",
                          transition: "width 0.3s",
                        }}
                        classes={{
                          root: "chip-root",
                          label: "chip-label",
                        }}
                      />
                    </Grid>
                  ))
                ) : (
                  <p>No shelfs</p>
                )}
              </Grid>
            </Stack>
          </AccordionDetails>
        </Accordion>
<Button
  onClick={() => {
    const exportInventoryToReport = async (data) => {
      try {
        const response = await axios.post(process.env.REACT_APP_QR_BACKEND_URL +'/inventory/exportInventoryToReport', { data });
        alert("exported to excel file")
        return response.data;
      } catch (error) {
        console.error(error);
        return { error: error.message };
      }
    };

    exportInventoryToReport(inventory);
  }}
  variant="outlined"
  color="primary"
  className="form-button"
  style={{ marginLeft: "10px" }}
>
  Export
</Button>
        
      </Box>

      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={inventory}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 50,
              },
            },
          }}
          pageSizeOptions={[5]}
          // checkboxSelection
          processRowUpdate={async (updatedRow, originalRow) => {
            console.log(updatedRow, originalRow);
            try {
              await fetch(
                process.env.REACT_APP_QR_BACKEND_URL +
                  "/inventory/updateMedicine",
                {
                  method: "POST",
                  body: JSON.stringify({
                    storeName: "Quick Returns",
                    originalMed: originalRow,
                    updatedMed: updatedRow,
                  }),
                  headers: {
                    "Content-type": "application/json; charset=UTF-8",
                  },
                }
              )
                .then((response) => {
                  response.json();
                  if (
                    updatedRow["SHELF"] !== originalRow["SHELF"] ||
                    updatedRow["QTY"] !== originalRow["QTY"]
                  ) {
                    window.location.reload();
                  }
                  // alert("Updated Successfully, please refresh the page to see the changes")
                })
                .then((json) => {
                  console.log(json);
                  // Refresh the page
                  // window.location.reload();
                });
            } catch (err) {
              console.log(err);
            }
          }}
          onProcessRowUpdateError={(error, updatedRow, originalRow) =>
            console.error(error, updatedRow, originalRow)
          }
          disableRowSelectionOnClick
          // onCellEditCommit={(params) => {
          //     console.log(params);
          // }}
        />
      </Box>
    </div>
  );
};

export default Inventory;
