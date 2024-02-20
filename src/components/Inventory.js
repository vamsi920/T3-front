import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import React, { useState, useEffect, useRef } from "react";
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
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";
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
        console.log(uniqueShelfs);
        setInventory(dataFinalArray);
        // const response1 = await fetch(
        //   process.env.REACT_APP_QR_BACKEND_URL + "/inventory/getShelf", {
        //     method: "POST",
        // body: JSON.stringify({
        //   storeName: "Quick Returns"
        // }),
        // headers: {
        //   "Content-type": "application/json; charset=UTF-8",
        // }
        //   }
        // );
        // response1.json()
        //   .then((data1) => {
        //     const names = Array.isArray(data1) ? data1.map(item => item.sh.name) : [];
        //     const sortedNames = names.sort();
        //     setShelfs(sortedNames);
        //     console.log(sortedNames);
        //   });
      } catch (error) {
        console.log(error);
      }
      // try{
      //   const response = await fetch(
      //     process.env.REACT_APP_QR_BACKEND_URL + "/inventory/getShelf", {
      //       method: "POST",
      //   body: JSON.stringify({
      //     storeName: "Quick Returns"
      //   }),
      //   headers: {
      //     "Content-type": "application/json; charset=UTF-8",
      //   }
      //     }
      //   );
      //   const data = await response.json();
      //   const names = Array.isArray(data) ? data.map(item => item.sh.name) : [];
      //   console.log(names);
      //   setShelfs(names);
      // }
      // catch (error) {
      //   console.log(error);
      // }
    };

    fetchData();
    console.log(shelfs);
  }, []);
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "EXP", headerName: "EXP", width: 90 },
    { field: "LOT", headerName: "LOT", width: 120 },
    { field: "MFG", headerName: "MFG", width: 250 },
    { field: "NAME", headerName: "NAME", width: 300 },
    { field: "NDC", headerName: "NDC", width: 150 },
    { field: "QTY", headerName: "QTY", width: 80, editable: true },
    { field: "SHELF", headerName: "SHELF", width: 100, editable: true },
    { field: "YEAR", headerName: "YEAR", width: 100 },
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
  const [barcodeInput, setBarcodeInput] = useState("");

  const handleMedicineSubmit = (e) => {
    e.preventDefault();

    // Perform form submission logic here
    // You can access the form values using the state variables (ndc, mfg, name, lot, exp, year, qty, shelf)
    console.log(ndc, mfg, name, lot, exp, year, qty, shelf);
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
      <h1>Inventory Page</h1>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginRight: "150px",
          marginBottom: "10px",
        }}
      >
        <Button
          style={{
            borderRadius: "5px",
            backgroundColor: "#eee",
            marginRight: 10,
          }}
          onClick={() => console.log(inventory)}
        >
          + Add Medicine
        </Button>
        <Accordion style={{ backgroundColor: "#eee", marginTop: "10px" }}>
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
              onSubmit={()=>console.log('hello')}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ marginBottom: "10px", display: "flex" }}>
                <TextField
                  label="Click here and scan 2D bar"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="form-input"
                  sx={{ width: "100%" }}
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
            backgroundColor: "#eee",
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
