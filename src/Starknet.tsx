import { useContext, useState } from 'react'
import { Abi, Contract, number, Signature, uint256 } from 'starknet'
import { utils } from 'ethers'
import GuardianWallet, { getStarknetWallet } from "guardian-wallet"
import { TextArea, Title, WalletContext } from './App'
import { Button, Card, Col, Input, Row } from 'antd'
// import { getStarknetWallet } from './dist/src/starknet'

function Starknet() {
  const gaurdianWallet = useContext(WalletContext)
  const [publicAddress, setPublicAddress] = useState<string>("")
  const [messageToSign, setMessageToSign] = useState("")
  const [status, setStatus] = useState(false)
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")
  const [result, setResult] = useState<any>("")


  const connectWalletModal = async () => {
    // await gaurdianWallet?.init({ environment: 'DEV',zIndex: "1000000" })
    // const address = await gaurdianWallet?.starknetWallet?.enable()
    const guardianWallet = new GuardianWallet();
    await guardianWallet.init({
      environment: "DEV"
    })
    const guardianStarknet = (window as any)['starknet-guardian-wallet'];
    const address = await guardianStarknet.enable()
    setPublicAddress(address![0])
    setStatus(true)
  }

  const signMessageHandler = async () => {
    if (!messageToSign) return
    message.message.message = messageToSign
    console.log(message)
    const signResult: Signature = await getStarknetWallet().account.signer.signMessage(message, publicAddress)
    setResult(JSON.stringify({ r: signResult![0], s: signResult![1] }, undefined, 4))
    console.log(signResult)
  }

  const mintToken = async (
    mintAmount: string,
    network: PublicNetwork,
  ): Promise<any> => {
    const starknet = getStarknetWallet()
    if (!starknet?.isConnected) {
      throw Error("starknet wallet not connected")
    }
    const erc20Contract = new Contract(
      Erc20Abi as Abi,
      getErc20TokenAddress(network),
      starknet.provider,
    )
    erc20Contract.connect(starknet.account)
    // const balance = await erc20Contract.balance_of(starknet.account.address)
    // console.log("balance",balance)
    // const balance = await erc20Contract.balanceOf("0x01cc7438ca3659361d9758529fe153a6d2c54c0eefb82319cd9abceb73b35075")
    const result = await erc20Contract.mint(starknet.account.address, "10000000000000", { maxFee: "99999999999999" })
    setResult(JSON.stringify(result, undefined, 4))
    // console.log(mintTx.transaction_hash)
    // await starknet.provider.waitForTransaction(mintTx.transaction_hash``)

    // const { transaction_hash: mintTxHash } = await erc20Contract.mint(
    //     starknet.account.address,
    //     "1000",
    //     {
    //       maxFee: "999999995330000"
    //     }
    //   );
    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Minting...`, result);
    //   await starknet.provider.waitForTransaction(mintTxHash);
    return
  }

  const transferToken = async (
    mintAmount: string,
    network: PublicNetwork
  ): Promise<any> => {
    const starknet = getStarknetWallet()
    if (!starknet?.isConnected) {
      throw Error("starknet wallet not connected")
    }
    const erc20Contract = new Contract(
      Erc20Abi as Abi,
      getErc20TokenAddress(network),
      starknet.provider,
    )
    erc20Contract.connect(starknet.account)
    // const balance = await erc20Contract.balance_of(starknet.account.address)
    // console.log("balance",balance)
    // const balance = await erc20Contract.balanceOf("0x01cc7438ca3659361d9758529fe153a6d2c54c0eefb82319cd9abceb73b35075")
    const result = await erc20Contract.transfer(to, amount, { maxFee: "99999999999999" })
    setResult(JSON.stringify(result, undefined, 4))
    // console.log(mintTx.transaction_hash)
    // await starknet.provider.waitForTransaction(mintTx.transaction_hash``)

    // const { transaction_hash: mintTxHash } = await erc20Contract.mint(
    //     starknet.account.address,
    //     "1000",
    //     {
    //       maxFee: "999999995330000"
    //     }
    //   );
    // Wait for the invoke transaction to be accepted on StarkNet
    console.log(`Waiting for Tx to be Accepted on Starknet - Minting...`, result);
    //   await starknet.provider.waitForTransaction(mintTxHash);
    return
  }

  function getUint256CalldataFromBN(bn: number.BigNumberish) {
    return { type: "struct" as const, ...uint256.bnToUint256(bn) }
  }

  function parseInputAmountToUint256(
    input: string,
    decimals: number = 18,
  ) {
    return getUint256CalldataFromBN(utils.parseUnits("10", decimals).toString())
  }


  return (
    <div>
      <div style={{ padding: '1rem' }}>
        <Card bodyStyle={{ padding: 0 }} title="Status" extra={status ? <span style={{ fontWeight: '600', color: 'green' }}>CONNECTED</span> : <span style={{ fontWeight: '600', color: 'red' }}>NOT CONNECTED</span>} style={{ width: 600, margin: '0 auto' }}>
          {status && <div style={{ padding: '1rem' }}>
            <p>Connected Address: {status && publicAddress}</p>
            <TextArea rows={4} placeholder="Response" id="message" value={result} defaultValue={result} maxLength={6} />
          </div>}
        </Card>
      </div>
      <div style={{ padding: '0rem 1rem' }}>
        <hr />
        <Title level={4} style={{ marginTop: '1rem' }}>Basic Action</Title>
        <Row gutter={16}>
          <Col>
            <Button type="primary" onClick={connectWalletModal}>Connect with Wallet</Button>
          </Col>
        </Row>
        <hr />
        <Title level={4} style={{ marginTop: '1rem' }}>Blockchain Functions:</Title>
        <TextArea rows={4} style={{ width: '300px' }} placeholder="Message to sign"  id="message" value={messageToSign} onChange={(event) => setMessageToSign(event.target.value)} />
        <br />
        <Input size="large" placeholder="Receiver address" style={{marginTop: '1rem', width: '360px'}} value={to} onChange={(event) => setTo(event.target.value)} />
        <br />
        <Input size="large" placeholder="Amount" style={{marginTop: '1rem', width: '360px'}} value={amount} onChange={(event) => setAmount(event.target.value)} />

        <Row gutter={16} style={{marginTop: '1rem'}}>
          <Col>
            <Button type="primary" onClick={signMessageHandler}>Sign Message</Button>
          </Col>
          <Col>
            <Button type="primary" onClick={() => mintToken("1", "goerli-alpha")}>Mint token</Button>
          </Col>
          <Col>
            <Button type="primary" onClick={() => transferToken("1", "goerli-alpha")}>Transfer token</Button>
          </Col>
        </Row>
      </div>
      
      

      {/* <p><b>STATUS:</b> {status ? <span style={{ fontWeight: '600', color: 'green' }}>CONNECTED</span> : <span style={{ fontWeight: '600', color: 'red' }}>NOT CONNECTED</span>}</p>
      <p><b>PUBLIC ADDRESS:</b> {status && publicAddress}</p>
      <button
        className="buttonStyle"
        onClick={connectWalletModal}
      >
        Connect with Wallet
      </button>
      <br />
      <p style={{ marginTop: '20px', marginBottom: '0px' }}>Result</p>
      <textarea style={{ width: '300px', height: '100px', display: 'block' }} disabled value={result}></textarea>
      <p></p>
      <textarea placeholder='Message to sign'
        style={{ width: '300px', height: '100px', display: 'block' }}
        onChange={(event) => setMessageToSign(event.target.value)}
        value={messageToSign}></textarea>
      <input placeholder='to address'
        style={{ width: '300px', height: '50px', display: 'block', marginTop: '10px' }}
        onChange={(event) => setTo(event.target.value)}
        value={to}></input>
      <input placeholder='amount'
        style={{ width: '300px', height: '50px', display: 'block', marginTop: '10px' }}
        onChange={(event) => setAmount(event.target.value)}
        value={amount}></input>
      <button
        style={{ marginTop: '10px' }}
        className="buttonStyle"
        onClick={signMessageHandler}
      >
        Sign Message
      </button>
      <button
        className="buttonStyle"
        onClick={() => mintToken("1", "goerli-alpha")}
      >
        Mint token
      </button>
      <button
        className="buttonStyle"
        onClick={() => transferToken("1", "goerli-alpha")}
      >
        Transfer token
      </button> */}
    </div>
  )
}

export default Starknet




const message = {
  domain: {
    "chainId": "SN_MAIN",
    "name": "Example DApp",
    "version": "0.0.1"
  },
  message: {
    "message": "bnhh"
  },
  primaryType: "Message",
  types: {
    "Message": [
      {
        "name": "message",
        "type": "felt"
      }
    ],
    "StarkNetDomain": [
      {
        "name": "name",
        "type": "felt"
      },
      {
        "name": "chainId",
        "type": "felt"
      },
      {
        "name": "version",
        "type": "felt"
      }
    ]
  }
}


export type PublicNetwork = keyof typeof erc20TokenAddressByNetwork

export const getErc20TokenAddress = (network: PublicNetwork) =>
  erc20TokenAddressByNetwork[network]


export const erc20TokenAddressByNetwork = {
  "goerli-alpha":
    "0x05b4a07edb512bef7813195f66f4c6424e55d147f6f42406d6927f994e6af16e",

  "mainnet-alpha":
    "0x06a09ccb1caaecf3d9683efe335a667b2169a409d19c589ba1eb771cd210af75",
}


const Erc20Abi = [
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "res",
        "type": "felt"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "get_total_supply",
    "outputs": [
      {
        "name": "res",
        "type": "felt"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "user",
        "type": "felt"
      }
    ],
    "name": "balance_of",
    "outputs": [
      {
        "name": "res",
        "type": "felt"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "owner",
        "type": "felt"
      },
      {
        "name": "spender",
        "type": "felt"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "res",
        "type": "felt"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "initialize",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "recipient",
        "type": "felt"
      },
      {
        "name": "amount",
        "type": "felt"
      }
    ],
    "name": "mint",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "recipient",
        "type": "felt"
      },
      {
        "name": "amount",
        "type": "felt"
      }
    ],
    "name": "transfer",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "sender",
        "type": "felt"
      },
      {
        "name": "recipient",
        "type": "felt"
      },
      {
        "name": "amount",
        "type": "felt"
      }
    ],
    "name": "transfer_from",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "spender",
        "type": "felt"
      },
      {
        "name": "amount",
        "type": "felt"
      }
    ],
    "name": "approve",
    "outputs": [],
    "type": "function"
  }
]