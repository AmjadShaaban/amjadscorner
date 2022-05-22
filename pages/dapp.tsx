import { ethers } from 'ethers';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { FaEthereum, FaReact } from 'react-icons/fa';
import { SiSolidity, SiTailwindcss } from 'react-icons/si';
import { Layout } from '../components/layout';
import { WaveCard } from '../components/dapp';
import abi from '../utils/WavePortal.json';

interface Wave {
  from?: string;
  waver?: string;
  address?: string;
  message: string;
  timestamp: Date;
}

const Dapp: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState('');

  const [allWaves, setAllWaves] = useState<Wave[]>([]);

  const [waveMessage, setWaveMessage] = useState('');

  const contractAddress = '0x7ac60BBEfFa71f14663185627477cdf7f2DAc8Af';

  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = waves.map((wave: Wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(parseInt(wave.timestamp.toString()) * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let wavePortalContract: any;

    const onNewWave = (from: string, timestamp: number, message: string) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if ((window as any).ethereum) {
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const signer = provider.getSigner();
      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on('NewWave', onNewWave);
    }
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        console.log('Make sure you have MetaMask');
      } else {
        console.log('We have the ethereum object', ethereum);
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllWaves();
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async (waveMessage: any) => {
    try {
      const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());

        const waveTxn = await wavePortalContract.wave(waveMessage, {
          gasLimit: 300000,
        });
        console.log('Mining...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <Layout>
      <div>
        <h1>Welcome to my first DAPP!</h1>
        <p>
          A Web3 app with <SiSolidity /> Solidity + <FaEthereum /> Ethereum
          smart contract built in <FaReact /> React + <SiTailwindcss /> Tailwind
          CSS
        </p>
        <p className='text-body text-muted text-center fs-6'>
          Deployed on Rinkeby Test Network!. Wave at me, send a message and you
          might be one of the lucky prize winners!
        </p>
        {!currentAccount && (
          <button onClick={connectWallet}>Connect to Wallet 💰</button>
        )}
        <form>
          <input />
          <button
            type='submit'
            onClick={(e) => {
              e.preventDefault();
              wave(waveMessage);
            }}
          >
            Send a Wave 👋
          </button>
        </form>
        {allWaves.map((wave, idx) => {
          return <WaveCard key={idx} wave={wave} />;
        })}
      </div>
    </Layout>
  );
};

export default Dapp;
