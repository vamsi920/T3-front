const getMedicines = async (boxName) => {
    const response = await fetch(process.env.REACT_APP_QR_BACKEND_URL + `/getMedicines/${boxName}`);
    const data = await response.json();
    return data;
}

module.exports = getMedicines;
