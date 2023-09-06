const axios = require('axios');

const subgraphUrl = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';

// Define the batch size 
const batchSize = 1000;
const maxSkip = 500; // Maximum  skip value

async function fetchLiquidityPools(first, skip) {
  const query = `
    {
      pairs(
        where: {
          reserveUSD_gt: 1000
        }
        orderBy: reserveUSD
        orderDirection: asc
        first: ${first}
        skip: ${skip}
      ) {
        id
        reserveUSD
        reserveETH
      }
    }
  `;

  try {
    const response = await axios.post(subgraphUrl, { query });
    return response.data.data.pairs;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function fetchAllLiquidityPools() {
  const allLiquidityPools = [];
  
  try {
    let skip = 0;
    while (skip <= maxSkip) {
      const batchData = await fetchLiquidityPools(batchSize, skip);
      if (batchData.length === 0) {
        break;
      }

      // Add batch data to the result
      allLiquidityPools.push(...batchData);

      // Increment the skip value for the next batch
      skip += batchSize;
    }

    return allLiquidityPools;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Fetch all data and handle the result
fetchAllLiquidityPools()
  .then((liquidityPools) => {
    console.log('Liquidity Pools:');
    liquidityPools.forEach((pool, index) => {
      console.log(`Pool ${index + 1}:`);
      console.log(`ID: ${pool.id}`);
      console.log(`Reserve USD: ${pool.reserveUSD}`);
      console.log('------------------------');
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
