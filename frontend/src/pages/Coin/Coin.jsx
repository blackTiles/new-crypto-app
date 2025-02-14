import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Component Connections
import { CoinContext } from '../../context/CoinContext';
import LineChart from '../../components/LineChart/LineChart';
import axios from 'axios';
// Style Component
import './Coin.css';

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState();
  const [historicalData, setHistoricalData] = useState();
  const { currency } = useContext(CoinContext);

  const fetchCoinData = async () => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': 'CG-8n9xZhH1qwShPfWPWtR35Qnh',
      },
    };

    fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, options)
      .then((response) => response.json())
      .then((response) => setCoinData(response))
      .catch((err) => console.error(err));
  };

  const fetchHistoricalData = async () => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': 'CG-8n9xZhH1qwShPfWPWtR35Qnh',
      },
    };

    fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency.name}&days=10&interval=daily`,
      options
    )
      .then((response) => response.json())
      .then((response) => setHistoricalData(response))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCoinData();
    fetchHistoricalData();
  }, [currency]);

  // check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
    const validateToken = async () => {
      try {
        const { data } = await axios.post("http://localhost:5000/api/auth/validate-token", { token });
        if (!data) {
          window.location.href = "/login";
        }
      } catch (err) {
        console.log(err);
      }
    }
    validateToken().then((data) => {
      fetchCoinData();
      fetchHistoricalData();
    }).catch((err) => console.error(err));
  }, []);

  if (coinData && historicalData) {
    return (
      <div className="coin">
        <div className="coin-name">
          <img src={coinData.image.large} alt="" />
          <p>
            <b>
              {coinData.name} ({coinData.symbol.toUpperCase()})
            </b>
          </p>
        </div>

        <div className="coin-chart">
          <LineChart historicalData={historicalData} />
        </div>

        <div className="coin-info">
          <ul>
            <li>Crypto Market Rank</li>
            <li>{coinData.market_cap_rank}</li>
          </ul>

          <ul>
            <li>Current Price</li>
            <li>
              {currency.symbol}{' '}
              {coinData.market_data.current_price[
                currency.name
              ].toLocaleString()}
            </li>
          </ul>

          <ul>
            <li>Market Cap</li>
            <li>
              {currency.symbol}{' '}
              {coinData.market_data.market_cap[currency.name].toLocaleString()}
            </li>
          </ul>

          <ul>
            <li>24 Hour High</li>
            <li>
              {currency.symbol}{' '}
              {coinData.market_data.high_24h[currency.name].toLocaleString()}
            </li>
          </ul>

          <ul>
            <li>24 Hour Low</li>
            <li>
              {currency.symbol}{' '}
              {coinData.market_data.low_24h[currency.name].toLocaleString()}
            </li>
          </ul>
        </div>
      </div>
    );
  } else {
    return (
      <div className="spinner">
        <div className="spin"></div>
      </div>
    );
  }
};

export default Coin;
