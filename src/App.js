import React, { useEffect, useState } from 'react'
import twitterLogo from './assets/twitter-logo.svg'
import './App.css'

// Constants
const TWITTER_HANDLE = 'RailsQuest'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const TEST_GIFS = [
  'https://media.giphy.com/media/1ZDHBI83x55sdxsejk/giphy.gif',
  'https://media.giphy.com/media/BdghqxNFV4efm/giphy.gif',
  'https://media.giphy.com/media/fV0oSDsZ4UgdW/giphy.gif',
  'https://media.giphy.com/media/V2ojLo7PvhVug/giphy.gif'
]

export default () => {
  const [walletAddress, setWalletAddress] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [gifList, setGifList] = useState([])

  const saveWallet = async ({ onlyIfTrusted }) => {
    const result = await connectWallet({ onlyIfTrusted })
    const stringifiedPublicKey = result?.publicKey.toString()
    if (stringifiedPublicKey) {
      console.log(stringifiedPublicKey)
      setWalletAddress(stringifiedPublicKey)
    }
  }

  const handleLoad = async () => {
    saveWallet({ onlyIfTrusted: true })
  }

  useEffect(() => {
    window.addEventListener('load', handleLoad)
    return () => window.removeEventListener('load', handleLoad)
  }, [])

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...')

      // Call Solana program here.

      // Set state
      setGifList(TEST_GIFS)
    }
  }, [walletAddress])

  return (
    <div className='App'>
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className='header-container'>
          <p className='header'>😎 Enter the Matrix</p>
          <p className='sub-text'>
            Follow the white rabbit… 🐇
          </p>
          {
            walletAddress
              ? renderConnectedContainer({ gifList, inputValue, setInputValue })
              : renderNotConnectedContainer({ click: saveWallet })
          }
        </div>
        <div className='footer-container'>
          <img alt='Twitter Logo' className='twitter-logo' src={twitterLogo} />
          <a
            className='footer-text'
            href={TWITTER_LINK}
            target='_blank'
            rel='noreferrer'
          >{`built on @${TWITTER_HANDLE}`}
          </a>
        </div>
      </div>
    </div>
  )
}

function renderNotConnectedContainer ({ click }) {
  return (
    <button
      className='cta-button connect-wallet-button'
      onClick={click}
    >
      Connect to Wallet
    </button>
  )
}

function renderConnectedContainer ({ gifList, inputValue, setInputValue }) {
  return (
    <div className='connected-container'>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sendGif(inputValue)
        }}
      >
        <input
          type='text'
          placeholder='Enter gif link!'
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button type='submit' className='cta-button submit-gif-button'>Submit</button>
      </form>
      <div className='gif-grid'>
        {gifList.map(gif => (
          <div className='gif-item' key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  )
}

function connectWallet (options = {}) {
  return fetchPhantomSolana()
    .connect(options)
    .catch(handlePhantomError)
}

function fetchPhantomSolana () {
  const isPhantom = window.solana?.isPhantom
  if (isPhantom) {
    return window.solana
  } else {
    handlePhantomError(new Error('Phantom wallet is not connected 😱'))
  }
}

function handlePhantomError (error) {
  console.error(error)
}

function sendGif (url) {
  if (url.length > 0) {
    console.log('Gif link:', url)
  } else {
    console.log('Empty input. Try again.')
  }
}
