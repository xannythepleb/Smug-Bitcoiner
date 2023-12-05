import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function App() {
  const [date, setDate] = useState('');
  const [priceOnDate, setPriceOnDate] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);
  const [historicalData, setHistoricalData] = useState({ dates: [], prices: [] });

  const handleDateChange = (event) => {
  setDate(event.target.value || ''); // Reset date to empty string if cleared
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
    // American date is a shitcoin
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`; // correct date format for API

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

const fetchHistoricalData = async (selectedDate) => {
    try {
      const endDate = Math.floor(new Date().getTime() / 1000); // Current timestamp
      const startDate = Math.floor(new Date(selectedDate).getTime() / 1000); // Selected date timestamp

      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range`, {
        params: {
          vs_currency: 'usd',
          from: startDate,
          to: endDate
        }
      });

      const prices = response.data.prices;
      const formattedData = {
        dates: prices.map((item) => new Date(item[0]).toLocaleDateString()),
        prices: prices.map((item) => item[1])
      };

      setHistoricalData(formattedData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  const fetchBitcoinPriceOnDate = async (selectedDate) => {
    try {

    // Create a new Date object from the selected date
    const dateObj = new Date(selectedDate);
    
    // Format the date to DD-MM-YYYY
    // American date is a shitcoin
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`; // correct date format for API

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
      console.error("Error fetching Bitcoin price on date:", error);
    }
  };

  // Chart data
  const data = {
    labels: historicalData.dates,
    datasets: [
      {
        label: 'Bitcoin Price (USD)',
        data: historicalData.prices,
        borderColor: 'orange',
        backgroundColor: 'transparent',
      },
    ],
  };

  // Chart options
  const options = {
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'orange',
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'orange',
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      }
    },
    elements: {
      line: {
        tension: 0.1 // Disables bezier curves
      }
    }
  };

  const handleSubmit = async () => {
  if (date) {
    // Fetch Bitcoin price for the selected date
    await fetchBitcoinPriceOnDate(date);

    // Fetch historical data for the chart
    await fetchHistoricalData(date);
  }
};

  return (
    <div className="container">
      <h1>Smug Bitcoiner</h1>
      <p className="slogan">Has it pumped or dumped?</p>
      <input
      type="date"
      value={date}
      onChange={handleDateChange}
      style={!date ? { color: '#999' } : {}}
      />
      <button onClick={handleSubmit}>Get Bitcoin Prices</button>
      <div className="data-display">
        {historicalData.dates.length > 0 && (
        <div>
          <Line data={data} options={options} />
        </div>
        )}
        {priceOnDate && <p>Price on {formatDate(date)}: {formatPrice(priceOnDate)} USD</p>}
        {currentPrice && <p>Current Price: {formatPrice(currentPrice)} USD</p>}
        {percentageChange && <p>Percentage Change: {formatPrice(percentageChange)}%</p>}
      </div>
    </div>
  );
}

export default App;
