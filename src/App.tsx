
import "./App.css";
import 'antd/dist/reset.css';
import { createContext, useState } from "react";
import Web3 from 'web3';
import ABI from "./Abi.json";
import fromExponential from "from-exponential";
import { ethers } from 'ethers'
import { Button, Input, Row, Col, Typography, Card, Switch } from 'antd';

import Starknet from "./Starknet";
import GuardianWallet from "guardian-wallet";
import { Provider } from "guardian-wallet";
import dotenv from 'dotenv'


dotenv.config()
export const { TextArea } = Input;
export const { Title } = Typography;
export const guardianWallet = new GuardianWallet()


export const WalletContext = createContext<GuardianWallet | null>(null)
function App() {
  const [layer, setlayer] = useState<'ETHEREUM' | 'STARKNET'>('ETHEREUM')
  const [result, setResult] = useState("")
  const [message, setMessage] = useState("")
  const [chainID, setChainID] = useState<string>("")
  const [publicAddress, setPublicAddress] = useState<string>("")
  const [status, setStatus] = useState<boolean>(false)
  const [web3] = useState(new Web3(guardianWallet.provider))

  const showNewWallet = () => {
    guardianWallet.showWallet("/")
  }

  const logout = () => {
    guardianWallet.logout((loggedOut: any) => {
      if (loggedOut) {
        setStatus(false)
      }
    })
  }

  const getUserInfo = () => {
    guardianWallet.getUserInfo((result: any) => {
      setResult(JSON.stringify(result))
    })
  }


  const showWallet = (path: string) => {
    guardianWallet.showWallet(path)
  }

  const sign = async () => {
    if (message !== "") {
      try {
        const hash = await web3.eth.personal.sign(message, "0xAFF2DA9B29b092367F23Eb83112A3F7636278e33", "");
        setResult(JSON.stringify(hash, undefined, 4))
      } catch (error) {
        setResult(JSON.stringify(error, undefined, 4))
      }
    }
  }

  const addChainHandler = async () => {
    const hex = web3.utils.numberToHex(43114)
    const params = {
      chainId: hex,
      chainName: "Avalanche C-Chain",
      nativeCurrency: {
        decimals: 10,
        name: "Avalanche",
        symbol: "ETH"
      },
      rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
      blockExplorerUrls: ["https://subnets.avax.network/"],
      iconUrls: ["https://optimistic.etherscan.io/"]
    }
    try {
      await guardianWallet.provider.request({ method: "wallet_addEthereumChain", params: params })
    } catch (e) {
      setResult(JSON.stringify((e as any)))
    }
  }

  const switchNetworkHandler = async () => {
    await guardianWallet.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x5' }],
    });
  }


  const sendEth = async () => {
    try {
      const result = await web3.eth
        .sendTransaction({ from: publicAddress, to: "0x8da6700A5bF8d0854409F1ff646321D8DD81c781", value: web3.utils.toWei("0.01") })
      setResult(JSON.stringify(result, undefined, 5))
    } catch (error: any) {
      setResult(JSON.stringify(error, undefined, 5))
    }
  }

  const getAccounts = async () => {
    try {
      const result = await web3.eth.getAccounts()
      setResult(JSON.stringify(result, undefined, 5))
    } catch (error: any) {
      setResult(JSON.stringify(error, undefined, 5))
    }
  }

  const signMessage = async () => {
    const provider = new ethers.providers.Web3Provider(guardianWallet.provider)
    const signer = provider.getSigner()
    const result = await signer.signMessage("Hello World")
    setResult(result)
  }

  const sendToken = async () => {
    try {
      let contractInstance = new web3.eth.Contract(ABI as any, "0xF626d456ac0C78eBaEe81Fa2678898c5945c8ec0");
      let transaction = Object.assign({
        gas: web3.utils.toHex(3), // gas limit for sending a transaction
        maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('0.02', 'gwei')),
        maxFeePerGas: web3.utils.toHex(web3.utils.toWei('0.02', 'gwei')), // Gas price --> each gas price in wei, if user gives in gwei we need to mulitply by 10 ** 9 = per gas in wei
      });
      Object.assign(transaction, {
        from: publicAddress,
        value: 0,
        to: "0xF626d456ac0C78eBaEe81Fa2678898c5945c8ec0",
        data: await contractInstance.methods.transfer("0x8da6700A5bF8d0854409F1ff646321D8DD81c781",
          web3.utils.toBN(fromExponential(0.01 * 10 ** (await contractInstance.methods.decimals().call())))).encodeABI()
      })
      const result = await web3.eth.sendTransaction(transaction, (err, hash: string) => {
        console.warn("TRANSACTION RESULT", hash)
      })
    } catch (error: any) {
      setResult(JSON.stringify(error, undefined, 5))
    }
  }

  const connect = async () => {
    await guardianWallet.init({ buttonPosition: 'top-right', environment: process.env.REACT_APP_ENVIRONMENT, zIndex: "1000000" });
    await getChainId();

    (web3.currentProvider as any).on('disconnect', (data: any) => {
      window.location.href = "/"
      // setChainID(`${Number(data).toString()}`)
    });

    (web3.currentProvider as any).on('chainChanged', (data: any) => {
      setChainID(`${Number(data).toString()}`)
    });

    (web3.currentProvider as Provider).on('accountsChanged', (data: any) => {
      setPublicAddress(data)
    });
    const account = await (web3.currentProvider as Provider).enable();
    setPublicAddress(account[0])
    setStatus(true)
  }

  const getChainId = async () => {
    const id = await web3.eth.getChainId()
    setChainID(id.toString())
    setChainID(`${id.toString()}`)
  }


  return (
    <div className="page">
      <header style={{ background: '#2d2d2d', padding: '10px 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '0 auto' }}>
          <img src="https://techstory.in/wp-content/uploads/2021/11/GuardianLink.io_.jpg" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '100px' }} alt="" />
          <Title style={{ margin: '0px', color: 'white' }} level={4}>Guardian Wallet Test App <b>[Web]</b></Title>
        </div>
      </header>
      <div style={{ display: 'flex', gap: '7px', marginTop: '1.5rem', marginLeft: '1rem' }}>
        <Title level={5}>Starknet</Title>
        <Switch checked={layer === 'STARKNET'} onChange={(value) => { value ? setlayer('STARKNET') : setlayer('ETHEREUM') }} />
      </div>
      {layer === 'ETHEREUM' ?
        <div style={{ padding: '1rem' }}>
          <Card bodyStyle={{ padding: 0 }} title="Status" extra={status ? <span style={{ fontWeight: '600', color: 'green' }}>CONNECTED</span> : <span style={{ fontWeight: '600', color: 'red' }}>NOT CONNECTED</span>} style={{ width: 600, margin: '0 auto' }}>
            {status && <div style={{ padding: '1rem' }}>
              <p>Chain ID: {status && chainID}</p>
              <p>Connected Address: {status && publicAddress}</p>
              <TextArea rows={4} placeholder="Response" id="message" value={result} defaultValue={result} maxLength={6} />
            </div>}
          </Card>
          <hr />
          <Title level={4} style={{ marginTop: '1rem' }}>Basic Action</Title>
          <Row gutter={16}>
            <Col>
              <Button type="primary" onClick={connect}>Connect with Wallet</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => { getUserInfo() }}>Get User Info</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={logout}>Disconnect</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => { showNewWallet() }}>Show Wallet</Button>
            </Col>
          </Row>
          <hr />
          <Title level={4} style={{ marginTop: '1rem' }}>Wallet Action</Title>
          <Row style={{ marginTop: '10px' }} gutter={16}>
            <Col>
              <Button type="primary" onClick={() => { showWallet("settings") }}>Settings</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => { showWallet("transfer") }}>Transfer</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => { addChainHandler() }}>Add Ethereum Chain</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => { switchNetworkHandler() }}>Switch Network</Button>
            </Col>
          </Row>
          <hr />
          <Title level={4} style={{ marginTop: '1rem' }}>Blockchain Functions:</Title>
          <TextArea rows={4} style={{ width: '300px' }} placeholder="Message to sign" value={message} onChange={(e) => setMessage(e.target.value)} id="message" />
          <Row style={{ marginTop: '10px' }} gutter={16}>
            <Col>
              <Button type="primary" onClick={() => { sign() }}>Personal Sign</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => { sendEth() }}>Send ETH</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => { getAccounts() }}>Get Accounts</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={async () => { signMessage() }}>Sign message</Button>
            </Col>
          </Row>
        </div> :
        <Starknet />
      }

    </div>
  );
}

export default App;
