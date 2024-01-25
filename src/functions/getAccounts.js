const getAccounts = async () => {
    const response = await fetch(process.env.REACT_APP_QR_BACKEND_URL + `/getAccounts`);
    const data = await response.json();
    
    const convertedData = data.reduce((acc, obj) => {
        acc[obj.DEA] = obj;
        return acc;
    }, {});

    return convertedData;
}

module.exports = getAccounts;
