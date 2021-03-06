import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Feed from './layouts/Feed';
import Register from './layouts/Register';
import { Image, Label, Icon } from 'semantic-ui-react';
import './App.css';

const { web3 } = window;

class App extends Component {
  state = {
    nextworkName: 'Unknown',
    address: '',
    isMetaMask: false
  };

  componentDidMount() {
    if (!web3) return;

    if (web3.currentProvider.isMetaMask) {
      this.setState({ isMetaMask: true });
      web3.version.getNetwork((err, netId) => {
        switch (netId) {
          case '1':
            this.setState({ nextworkName: 'Mainnet' });
            break;
          case '3':
            this.setState({ nextworkName: 'Ropsten' });
            break;
          case '4':
            this.setState({ nextworkName: 'Rinkeby' });
            break;
          case '42':
            this.setState({ nextworkName: 'Kovan' });
            break;
          case '1234567':
            this.setState({ nextworkName: 'Localhost' });
            break;
          default:
            this.setState({ nextworkName: 'Unknown' });
        }
      });

      web3.eth.getAccounts((err, accounts) => {
        this.setState({ address: accounts[0] });
        web3.currentProvider.publicConfigStore.on('update', response => {
          const { selectedAddress } = response;
          if (this.state.address != selectedAddress) {
            this.setState({ address: selectedAddress }, () => {
              window.location.reload();
            });
          }
        });
      });
    } else {
      this.setState({ isMetaMask: false });
    }
  }

  onNavigateToInstallMetaMask = () => {
    window.open(
      'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
      '_blank'
    );
  };

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {this.state.isMetaMask ? (
          <div>
            <div
              style={{
                height: '46px',
                background: '#E04447',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Image
                style={{ height: '46px', marginLeft: '16px' }}
                src="20scoops_icon.png"
              />
              <Label
                style={{ height: '26px', marginRight: '26px' }}
                as="a"
                color="green"
                image
              >
                <Icon name="signal" /> Network{' '}
                <Label.Detail>{this.state.nextworkName}</Label.Detail>
              </Label>
            </div>
            <div className="App">
              <Router>
                <Fragment>
                  <link
                    rel="stylesheet"
                    href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.3/semantic.min.css"
                  />
                  <Route exact path="/" component={Register} />
                  <Route path="/feed" component={Feed} />
                </Fragment>
              </Router>
            </div>
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Image
              style={{ height: '100px', cursor: 'pointer' }}
              src="ic_download_metamask.png"
              onClick={this.onNavigateToInstallMetaMask}
            />
          </div>
        )}
      </div>
    );
  }
}

export default App;
