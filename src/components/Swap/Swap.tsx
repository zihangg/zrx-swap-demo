import React, { useEffect, useState } from "react";
import styles from "./Swap.module.css";
import qs from "qs";
import Web3 from "web3";

function Swap() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [account, setAccount] = useState();
  const buttonTexts = ["Connect Wallet", "Swap"];

  const web3 = new Web3(Web3.givenProvider);

  const sellToken = "ETH";
  const buyToken = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"; // UNI address in goerli
  let amount = Number(from) * 10 ** 18;

  const params = {
    sellToken: sellToken,
    buyToken: buyToken,
    sellAmount: amount,
    takerAddress: account,
  };

  useEffect(() => {
    if (account === undefined) {
      setButtonText(buttonTexts[0]);
    } else {
      setButtonText(buttonTexts[1]);
    }
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result: any[]) => {
          setAccount(result[0]);
        });
    } else {
      console.log("No MM.");
    }

    // switch to goerli
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x5" }],
    });
  };

  const handleClick = () => {
    if (buttonText === buttonTexts[0]) {
      connectWallet();
    } else if (buttonText === buttonTexts[1]) {
      executeSwap();
    }
  };

  const getPrice = async () => {
    await fetch(
      `${process.env.REACT_APP_0X_SWAP_API}/price?${qs.stringify(params)}`
    )
      .then((res) => res.json())
      .then((res) => setTo((res.buyAmount / 10 ** 18).toString()));
  };

  const executeSwap = async () => {
    const params = {
      sellToken: sellToken,
      buyToken: buyToken,
      sellAmount: amount,
      takerAddress: account,
    };

    const response = await fetch(
      `${process.env.REACT_APP_0X_SWAP_API}/quote?${qs.stringify(params)}`
    );

    console.log(response);

    await web3.eth.sendTransaction(await response.json());
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>SWAP API</div>
      <div className={styles.box}>
        <div className={styles.fromAsset}>
          <div className={styles.token}>ETH</div>
          <input
            disabled={account === undefined}
            type="text"
            placeholder="0"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onBlur={getPrice}
          />
        </div>
        <div className={styles.toAsset}>
          <div className={styles.token}>UNI</div>
          <input
            disabled={true}
            type="text"
            placeholder="0"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button className={styles.swap} onClick={handleClick}>
          {buttonText}
        </button>
        <div>
          {account ? (
            <span className={styles.wallet}>Wallet connected: {account}</span>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default Swap;
