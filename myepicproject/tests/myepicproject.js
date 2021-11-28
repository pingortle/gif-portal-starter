const anchor = require('@project-serum/anchor')
const { SystemProgram } = anchor.web3

runMain()

async function main () {
  console.log('🚀 Starting test...')

  const provider = anchor.Provider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Myepicproject
  const baseAccount = anchor.web3.Keypair.generate()

  const tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId
    },
    signers: [baseAccount]
  })

  console.log('📝 Your transaction signature', tx)

  const initialAccount = await program.account.baseAccount.fetch(baseAccount.publicKey)
  console.log('👀 GIF Count', initialAccount.totalGifs)
  console.log('👀 GIF List', JSON.stringify(initialAccount.gifList))

  await program.rpc.addGif('bogus gif', {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey
    }
  })

  const afterIncrementAccount = await program.account.baseAccount.fetch(baseAccount.publicKey)
  console.log('👀 GIF Count', afterIncrementAccount.totalGifs)
  console.log('👀 GIF List', JSON.stringify(afterIncrementAccount.gifList))
}

async function runMain () {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
