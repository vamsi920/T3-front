const getActiveBox = async (boxId) => {
    const response = await fetch(process.env.REACT_APP_QR_BACKEND_URL + `/getActiveBox`);
    const data = await response.json();
    return data;
}

module.exports = getActiveBox;
