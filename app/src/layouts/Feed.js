import React, { Component } from 'react';
import ListFeed from '../components/ListFeed';
import Contracts from '../services/contracts';
import {
  Form,
  TextArea,
  Button,
  Message,
  Icon,
  Modal,
  Image,
  Input
} from 'semantic-ui-react';
import token from '../tokens/maxToken';

const { web3 } = window;

class Feed extends Component {
  state = {
    username: '',
    isLoading: false,
    message: '',
    posts: [],
    errorMessage: '',
    myAddress: '',
    balance: 0,
    isReporter: false,
    isShowDialog: false,
    isShowDialogInputToken: false,
    token: null,
    tokenAmount: 0,
    isInputTokenError: false,
    likeItem: null
  };

  items = [];
  countLoop = 0;
  totalPost = false;

  componentDidMount() {
    Contracts.setNetwork('1234567');
    // Contracts.setNetwork('4')
    this.social = Contracts.Social();
    const account = web3.eth.defaultAccount;
    this.setState({ myAddress: account });
    this.getBalance(account);
    this.loadBalanceToken(account);

    this.social.getUsername((err, response) => {
      if (!err) {
        const username = web3.toAscii(response).replace(/\u0000/g, '');
        if (username.length > 0) {
          this.setState({ username });
        } else {
          this.props.history.replace('/');
        }
      } else {
        this.props.history.replace('/');
      }
    });

    this.social.getTotalPost((err, response) => {
      if (!err) {
        this.items = [];
        this.countLoop = 0;
        this.totalPost = response.c[0];
        for (let i = this.totalPost - 1; i >= 0; i--) {
          this.social.listPosts(i, (err, response) => {
            if (!err) this.setItem(response);
            this.countLoop++;
          });
        }
      }
    });

    this.checkPermission();

    this.social.allEvents((err, response) => {
      if (!err) {
        if (response.event === 'NewPost') {
          this.onNewPost(response);
        } else if (response.event === 'NewBalance') {
          this.onNewBalance(response);
        }
      } else {
        this.setState({ errorMessage: err.message, isLoading: false });
      }
    });
  }

  loadBalanceToken = account => {
    let contract = web3.eth.contract(token.abi);
    let erc20Token = contract.at(token.address);
    erc20Token.balanceOf(account, (err, response) => {
      if (!err) {
        let decimal = token.decimal;
        let precision = '1e' + decimal;
        let balance = response.c[0] / precision;
        let name = token.name;
        let symbol = token.symbol;
        let icon = token.icon;
        let abi = token.abi;
        let address = token.address;
        balance = balance >= 0 ? balance : 0;
        this.setState({
          token: {
            decimal,
            balance,
            name,
            symbol,
            icon,
            abi,
            address
          }
        });
      }
    });
  };

  showDialog = () => this.setState({ isShowDialog: true });

  dismissDialog = () => this.setState({ isShowDialog: false });

  showDialogInputToken = () => this.setState({ isShowDialogInputToken: true });

  dismissDialogInputToken = () =>
    this.setState({ isShowDialogInputToken: false });

  getBalance = address => {
    web3.eth.getBalance(address, (err, balance) => {
      if (!err) this.setState({ balance });
    });
  };

  createModelPost = (postId, username, message, hashImage, address) => {
    return {
      postId: postId,
      username: username,
      message: message,
      hashImage: hashImage,
      address: address
    };
  };

  setItem = item => {
    const model = this.createModelPost(
      item[0],
      item[1],
      item[2],
      item[3],
      item[4]
    );
    this.items.push(model);
    if (this.countLoop === this.totalPost - 1) {
      this.setState({ posts: this.items });
    }
  };

  onNewPost = response => {
    const { id, username, hashImage, message, owner } = response.args;
    const model = this.createModelPost(id, username, message, hashImage, owner);
    this.items.splice(0, 0, model);
    this.setState({ posts: this.items, isLoading: false });
    this.getBalance(response.args.owner);
  };

  onNewBalance = response => {
    this.loadBalanceToken(response.args.owner);
    this.getBalance(response.args.owner);
    this.checkPermission();
  };

  onPost = () => {
    const message = this.state.message;
    const hashImage = '';
    this.setState({ isLoading: true });
    this.social.post(message, hashImage, (err, _) => {
      if (!err) {
        this.setState({ message: '', errorMessage: '' });
      } else {
        this.setState({ errorMessage: err.message, isLoading: false });
      }
    });
  };

  onTextChange = event => {
    this.setState({ message: event.target.value, errorMessage: '' });
  };

  onLikePost = item => {
    this.setState({ likeItem: item });
    this.showDialogInputToken();
  };

  onUnLikePost = item => this.showDialog();

  checkPermission = () => {
    this.social.checkPermission((err, response) => {
      if (!err) {
        this.setState({ isReporter: response });
      } else {
        // ? Nothing
      }
    });
  };

  onTokenAmountChange = event => {
    const value = event.target.value;
    const isNumber = !!Number(value);
    this.setState({ tokenAmount: value, isInputTokenError: !isNumber });
  };

  onTransferToken = () => {
    const { address, postId } = this.state.likeItem;
    this.dismissDialogInputToken();
    this.setState({ isLoading: true });
    const token = this.state.token;
    let contract = web3.eth.contract(token.abi).at(token.address);
    let amount = `${this.state.tokenAmount}e${token.decimal}`;
    let receiver = address;

    amount = new web3.BigNumber(amount).toNumber();

    contract.approve(
      Contracts.getContractAddress(),
      amount,
      (err, response) => {
        if (!err) {
          this.social.likeWithToken(
            receiver,
            postId,
            amount,
            (err, response) => {
              if (!err) {
                this.setState({
                  isLoading: false,
                  errorMessage: ''
                });
              } else {
                this.setState({
                  isLoading: false,
                  errorMessage: err.message
                });
              }
            }
          );
        } else {
          this.setState({
            isLoading: false,
            errorMessage: err.message
          });
        }
      }
    );
  };

  render() {
    const token = this.state.token;
    return (
      <div>
        <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
          <div
            style={{
              width: '40%',
              height: '100%',
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              background: '#80808054'
            }}
          >
            <div style={{ width: '100%' }}>
              <div style={{ margin: '36px' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <h2 style={{ margin: '0' }}>Hi... {this.state.username}</h2>
                  <div
                    style={{
                      display: this.state.isReporter ? 'inline' : 'none'
                    }}
                  >
                    <Icon
                      name="chess queen"
                      color="orange"
                      size="big"
                      style={{ marginLeft: '6px' }}
                    />
                  </div>
                </div>
                <h5 style={{ margin: '8px' }}>{this.state.myAddress}</h5>
                <h5 style={{ margin: '8px' }}>{`${web3.fromWei(
                  this.state.balance,
                  'ether'
                )} ETH`}</h5>
                {token === null ? (
                  <div>Loading..</div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Image
                      style={{ marginRigth: '16px' }}
                      circular
                      src={token.icon}
                      className="token-icon"
                    />
                    <h4 style={{ marginTop: '8px', marginLeft: '6px' }}>
                      {' '}
                      {token.balance.toFixed(3)}{' '}
                    </h4>
                    <h4 style={{ marginTop: '8px', marginLeft: '6px' }}>
                      {' '}
                      {token.symbol}
                    </h4>
                  </div>
                )}

                <Form onSubmit={this.onPost} error={this.state.errorMessage}>
                  <TextArea
                    autoHeight
                    style={{ maxHeight: '500px' }}
                    placeholder="Typing Message"
                    onChange={this.onTextChange}
                    value={this.state.message}
                  />
                  <Message
                    error
                    header="Oops!"
                    content={this.state.errorMessage}
                  />
                </Form>
                <Button
                  style={{
                    margin: '26px',
                    width: '50%'
                  }}
                  primary
                  loading={this.state.isLoading}
                  onClick={this.onPost}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
          <div
            style={{ width: '60%', overflow: 'auto', background: '#fafafa' }}
          >
            <div
              style={{
                width: '100%',
                justifyContent: 'center',
                display: 'flex'
              }}
            >
              <div style={{ marginTop: '26px', marginBottom: '26px' }}>
                <ListFeed
                  items={this.state.posts}
                  onLikePost={this.onLikePost}
                  onUnLikePost={this.onUnLikePost}
                  isReporter={this.state.isReporter}
                />
              </div>
            </div>
          </div>
        </div>
        <Modal
          size="tiny"
          open={this.state.isShowDialog}
          onClose={this.dismissDialog}
        >
          <Modal.Header>Delete Post</Modal.Header>
          <Modal.Content>
            <p>Are you sure you want to delete this post?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button negative onClick={this.dismissDialog}>
              No
            </Button>
            <Button
              positive
              onClick={this.dismissDialog}
              icon="checkmark"
              labelPosition="right"
              content="Yes"
            />
          </Modal.Actions>
        </Modal>

        {token != null ? (
          <Modal
            dimmer={true}
            size="tiny"
            open={this.state.isShowDialogInputToken}
            onClose={this.dismissDialogInputToken}
          >
            <Modal.Header>Enter Amount Token</Modal.Header>
            <Modal.Content image>
              <Input
                error={this.state.isInputTokenError}
                value={this.state.tokenAmount}
                onChange={this.onTokenAmountChange}
                style={{ width: '100%' }}
                label={{ basic: true, content: token.symbol }}
                labelPosition="right"
                placeholder="Amount"
              />
            </Modal.Content>
            <Modal.Actions>
              <Button color="black" onClick={this.dismissDialogInputToken}>
                CANCEL
              </Button>
              <Button
                positive
                icon="checkmark"
                labelPosition="right"
                content="OK"
                onClick={this.onTransferToken}
              />
            </Modal.Actions>
          </Modal>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default Feed;
