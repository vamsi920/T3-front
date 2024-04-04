import React, { useState, useEffect } from "react";
import ReactCardFlip from "react-card-flip";
import "../../css/styles.css";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const ExportToExcelAPI = async (boxID) => {
    var fileName = "invoice.xlsx";
    var boxData = await fetch(
      process.env.REACT_APP_QR_BACKEND_URL + "/getBox/" + boxID
    );
    var data = await boxData.json();
    var acc = data[0]["assignedAccount"];
    var whole = data[0]["assignedWholesaler"];
    // getting account details
    var accData = await fetch(
      process.env.REACT_APP_QR_BACKEND_URL + "/getAccountInfo/" + acc
    );
    var accInfo = await accData.json();
    // getting wholesaler details
    var wholeData = await fetch(
      process.env.REACT_APP_QR_BACKEND_URL + "/getWholesalerInfo/" + whole
    );
    var wholeInfo = await wholeData.json();
    console.log(accInfo);
    console.log(wholeInfo);
    // console.log(data)
    // getting accountNumber if present else an empty string
    try {
      var accNumber = await fetch(
        process.env.REACT_APP_QR_BACKEND_URL + "/getAccountNumber",
  
        {
          method: "POST",
          body: JSON.stringify({
            wholesalerDEA: whole,
            accountDEA: acc,
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      )
        .then((response) => response.json())
        .then((json) => console.log(json));
    } catch (err) {
      accNumber = "";
      console.log(err);
    }
    if (accNumber == null || accNumber === undefined) {
      accNumber = "";
    }
    console.log(accNumber);
  
    try {
      await fetch(process.env.REACT_APP_QR_BACKEND_URL + "/extodm/" + fileName, {
        method: "POST",
        body: JSON.stringify({
          data: data[0]["medicines"],
          account: accInfo,
          wholesaler: wholeInfo,
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
const FlipCard = ({box}) => {
  const [isFlipped, setIsFlipped] = useState(false);
    useEffect(() => {
        console.log(box);
    }
    , []);

  
    

  const navigate = useNavigate();
  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="car-card">
      <ReactCardFlip
        isFlipped={isFlipped}
        flipDirection="vertical"
      >
        {/* Front side */}
        <Typography style={{ fontWeight: "bold" }}>
                  {box.boxName}
                </Typography>

                <Stack
                  direction="row"
                  spacing={2}
                  style={{ marginLeft: "15px" }}
                >
                  <Typography>Closed On: {box.boxClosedOn}</Typography>
                  <Typography>
                    Assigned Account: {box.assignedAccount}
                  </Typography>
                  <Typography>
                    Assigned Wholesaler: {box.assignedWholesaler}
                  </Typography>
                </Stack>
        {/* Back side */}
        <div className="card-back" onClick={handleClick}>
        {box.medicines.length === 0 ? (
                  <div>
                    {box.status !== "closed" ? (
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
                      </Button>
                    ) : (
                      ""
                    )}
                    <Typography>No medicine in the box</Typography>
                  </div>
                ) : (
                  <div>
                    <Button
                      label="Export Debit Memo"
                      variant="contained"
                      color="primary"
                      style={{ marginBottom: "5px" }}
                      onClick={() => ExportToExcelAPI(box.boxId)}
                    >
                      Export Debit Memo
                    </Button>
                    {box.status !== "closed" ? (
                      <Button
                        label="Go to Box"
                        variant="contained"
                        color="primary"
                        style={{ marginBottom: "5px", marginLeft: "5px" }}
                        onClick={() => {
                          // Add code to navigate to the active box page
                          navigate("/activeBox");
                        }}
                      >
                        Go to Box
                      </Button>
                    ) : (
                      ""
                    )}
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
        </div>
      </ReactCardFlip>
    </div>
  );
};

export default FlipCard;