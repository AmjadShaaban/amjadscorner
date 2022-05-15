import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ethers } from 'ethers';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { FaEthereum, FaReact } from 'react-icons/fa';
import { SiMaterialui, SiSolidity } from 'react-icons/si';
import { WaveCard } from '../components/wave-card';
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
    <>
      <AppBar position='static'>
        <Toolbar>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            News
          </Typography>
          <Button color='inherit'>Login</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 4, mx: 2 }}>
        <Paper elevation={6}>
          <Typography variant='h2' component='div'>
            Welcome to my first DAPP!
          </Typography>
          <Typography variant='h3' component='div'>
            A Web3 app with <SiSolidity size={32} />
            Solidity + <FaEthereum size={32} />
            Ethereum smart contract built in <FaReact size={32} /> React +{' '}
            <SiMaterialui size={32} /> Material UI
          </Typography>
          <p className='text-body text-muted text-center fs-6'>
            Deployed on Rinkeby Test Network!. Wave at me, send a message and
            you might be one of the lucky prize winners!
          </p>
        </Paper>
        {!currentAccount && (
          <Button onClick={connectWallet}>Connect to Wallet 💰</Button>
        )}
        <TextField id='standard-basic' label='Standard' variant='standard' />
        <Button
          type='submit'
          onClick={(e) => {
            e.preventDefault();
            wave(waveMessage);
          }}
        >
          Send a Wave 👋
        </Button>
        {allWaves.map((wave, idx) => {
          return <WaveCard key={idx} wave={wave} />;
        })}
      </Box>
    </>
  );
};

export default Dapp;
