const getWholesalers = async ()=> {
    const response = await fetch(process.env.REACT_APP_QR_BACKEND_URL + `/getWholesalers`);
    const data = await response.json();
    const convertedData = data.reduce((acc, data) => {
        acc[data.DEA] = data;
        return acc;
    },{});
    return convertedData;
}

module.exports = getWholesalers;
