import { setIntervalAsync } from 'set-interval-async';
import axios from 'axios';
import { writeFileSync } from 'fs';
import axiosRetry from 'axios-retry';

const blockChair = axios.create({
  baseURL: 'https://api.blockchair.com/',
  timeout: 5000,
})
axiosRetry(blockChair, { retries: 3 });

const THORChain = axios.create({
  baseURL: 'https://thornode.ninerealms.com/thorchain/',
  timeout: 5000
})
axiosRetry(THORChain, { retries: 3 });

async function fetchGasData () {
  const timeOfFetch = Date.now()
  console.log('Query Thornode data...')
  const {data: inboundAddresses} = await THORChain.get('inbound_addresses')
  console.log('Got thronode data...')
  console.log('Query block chair data...')
  const {data: blockChairData} = await blockChair.get('stats')
  console.log('Got block chair api data...')

  const finalData = {
    thorchain: inboundAddresses,
    block_chair: blockChairData,
    timestamp: timeOfFetch 
  }

  const dataString = JSON.stringify(finalData)
  writeFileSync(`./data/${timeOfFetch}.json`, dataString)
  
  return
}

async function main() {
  try {
    await fetchGasData()
    setIntervalAsync(async () => {
      try {
        await fetchGasData()
      }
      catch (error: any) {
        console.error(error.stack)
      }
    }, 10 * 60 * 1000)
  } catch (error: any) {
    console.error(error.stack)  
  }
}

main()
