const getAccounts = async () => {
    const response = await fetch(process.env.REACT_APP_QR_BACKEND_URL + `/getAccounts`);
    const data = await response.json();
    console.log(data);
    
    if (!Array.isArray(data)) {
        throw new Error('Data is not an array');
    }
    
    const convertedData = data.reduce((acc, obj) => {
        acc[obj.DEA] = obj;
        return acc;
    }, {});
    
    console.log(convertedData);
    return convertedData;
}

module.exports = getAccounts;
