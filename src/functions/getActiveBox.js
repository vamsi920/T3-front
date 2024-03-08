const getActiveBox = async () => {
    const response = await fetch(process.env.REACT_APP_QR_BACKEND_URL + `/getActiveBox`);
    const data = await response.json();
    console.log(data);
    return data;
}

module.exports = getActiveBox;
