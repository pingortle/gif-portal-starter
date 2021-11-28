import idl from './idl.json'
import kp from './keypair.json'

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { Program, Provider, web3 } from '@project-serum/anchor'
import React, { useEffect, useState } from 'react'
import twitterLogo from './assets/twitter-logo.svg'
import './App.css'

const { SystemProgram } = web3

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

const programID = new PublicKey(idl.metadata.address)
const network = clusterApiUrl('devnet')
const opts = {
  preflightCommitment: 'processed'
}

const TWITTER_HANDLE = 'RailsQuest'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

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
  })

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...')
      getGifList({ setGifList })
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
              ? renderConnectedContainer({ gifList, setGifList, inputValue, setInputValue })
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

function renderConnectedContainer ({ gifList, setGifList, inputValue, setInputValue }) {
  const onInputChange = (event) => setInputValue(event.target.value)
  const onClickInitButton = () => createGifAccount({ setGifList })

  if (gifList === null) {
    return (
      <div className='connected-container'>
        <button className='cta-button submit-gif-button' onClick={onClickInitButton}>
          Do One-Time Initialization For GIF Program Account
        </button>
      </div>
    )
  } else {
    return (
      <div className='connected-container'>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            sendGif({ url: inputValue, setGifList })
          }}
        >
          <input
            type='text'
            placeholder='Enter gif link!'
            value={inputValue}
            onChange={onInputChange}
          />
          <button type='submit' className='cta-button submit-gif-button'>
            Submit
          </button>
        </form>
        <div className='gif-grid'>
          {/* We use index as the key instead, also, the src is now item.gifLink */}
          {gifList?.map((item, index) => (
            <div className='gif-item' key={index}>
              <img src={item.gifLink} alt={item.gifLink} />
            </div>
          ))}
        </div>
      </div>
    )
  }
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

async function getGifList ({ setGifList }) {
  try {
    const provider = getProvider()
    const program = new Program(idl, programID, provider)
    const account = await program.account.baseAccount.fetch(baseAccount.publicKey)

    console.log('Got the account', account)
    setGifList(account.gifList)
  } catch (error) {
    setGifList(null)
  }
}
function getProvider () {
  const connection = new Connection(network, opts.preflightCommitment)
  const provider = new Provider(
    connection,
    window.solana,
    opts.preflightCommitment
  )
  return provider
}

function handlePhantomError (error) {
  console.error(error)
}

async function sendGif ({ url, setGifList }) {
  if (url.length === 0) {
    console.error('No length given')
    return
  }

  console.log('Gif link:', url)
  try {
    const provider = getProvider()
    const program = new Program(idl, programID, provider)

    await program.rpc.addGif(url, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey
      }
    })
    console.log('GIF successfully sent to program', url)

    await getGifList({ setGifList })
  } catch (error) {
    console.error('Error sending GIF', error)
  }
}

async function createGifAccount ({ setGifList }) {
  try {
    const provider = getProvider()
    const program = new Program(idl, programID, provider)
    console.log('ping')
    await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
      },
      signers: [baseAccount]
    })
    console.log('Created a new BaseAccount w/ address:', baseAccount.publicKey.toString())
    await getGifList({ setGifList })
  } catch (error) {
    console.log('Error creating BaseAccount account:', error)
  }
}
