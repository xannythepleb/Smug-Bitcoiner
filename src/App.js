import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [date, setDate] = useState('');
  const [priceOnDate, setPriceOnDate] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const fetchBitcoinData = async (selectedDate) => {
  try {
    // Create a new Date object from the selected date
    const dateObj = new Date(selectedDate);

    // Format the date to DD-MM-YYYY
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;

    // CoinGecko API endpoint for historical data
    const historicalUrl = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${formattedDate}&localization=false`;
    
    // CoinGecko API endpoint for current data
    const currentUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin';

    // Fetch historical data
    const historicalResponse = await axios.get(historicalUrl);
    const historicalPrice = historicalResponse.data.market_data.current_price.usd;

    // Fetch current data
    const currentResponse = await axios.get(currentUrl);
    const currentPrice = currentResponse.data.market_data.current_price.usd;

    // Calculate percentage change
    const percentageChange = ((currentPrice - historicalPrice) / historicalPrice) * 100;

    // Update state with the fetched data
    setPriceOnDate(historicalPrice);
    setCurrentPrice(currentPrice);
    setPercentageChange(percentageChange.toFixed(2));
  } catch (error) {
    console.error("Error fetching Bitcoin data:", error);
  }
};

  const handleSubmit = () => {
    fetchBitcoinData(date);
  };

  return (
    <div className="container">
      <input type="date" value={date} onChange={handleDateChange} />
      <button onClick={handleSubmit}>Get Bitcoin Prices</button>
      <div className="data-display">
        {priceOnDate && <p>Price on {formatDate(date)}: {formatPrice(priceOnDate)} USD</p>}
        {currentPrice && <p>Current Price: {formatPrice(currentPrice)} USD</p>}
        {percentageChange && <p>Percentage Change: {formatPrice(percentageChange)}%</p>}
      </div>
    </div>
  );
}

export default App;
