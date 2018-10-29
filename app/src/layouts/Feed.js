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
import MicrolinkCard from '../components/MicrolinkCard';
import ipfs from '../services/ipfs';

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
    likeItem: null,
    isPreviewUrl: false,
    urlPreview: '',
    isClear: false,
    hashImage: '',
    fileImage: null,
    imagePreview: ''
  };

  items = [];
  countLoop = 0;
  totalPost = false;

  componentDidMount() {
    Contracts.setNetwork('1234567');
    // Contracts.setNetwork('4')
    this.social = Contracts.Social();
    web3.eth.getAccounts((err, accounts) => {
      const currentAddress = accounts[0];
      this.setState({ myAddress: currentAddress });
      this.getBalance(currentAddress);
      this.loadBalanceToken(currentAddress);
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

  createModelPost = (postId, username, message, url, hashImage, address) => {
    return {
      postId: postId,
      username: username,
      message: message,
      url: url,
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
      item[4],
      item[5]
    );
    this.items.push(model);
    if (this.countLoop === this.totalPost - 1) {
      this.setState({ posts: this.items });
    }
  };

  onNewPost = response => {
    const { id, username, hashImage, message, url, owner } = response.args;
    const model = this.createModelPost(
      id,
      username,
      message,
      url,
      hashImage,
      owner
    );
    this.items.splice(0, 0, model);
    this.setState({
      posts: this.items,
      isLoading: false,
      urlPreview: '',
      isPreviewUrl: false
    });
    this.getBalance(response.args.owner);
  };

  onNewBalance = response => {
    this.loadBalanceToken(response.args.owner);
    this.getBalance(response.args.owner);
    this.checkPermission();
  };

  onPost = () => {
    if (this.state.fileImage) {
      this.uploadFileToIPFS();
    } else {
      this.newPost();
    }
  };

  newPost = () => {
    const message = this.state.message;
    const url = this.state.urlPreview;
    const hashImage = this.state.hashImage;
    this.setState({ isLoading: true });
    this.social.post(message, url, hashImage, (err, _) => {
      if (!err) {
        this.setState({
          message: '',
          errorMessage: '',
          fileImage: null,
          hashImage: '',
          imagePreview: ''
        });
      } else {
        this.setState({ errorMessage: err.message, isLoading: false });
      }
    });
  };

  onTextChange = event => {
    const message = event.target.value;
    if (
      this.isValidURL(message) &&
      !this.state.isPreviewUrl &&
      !this.state.imagePreview
    ) {
      this.setState({
        urlPreview: message,
        message,
        errorMessage: '',
        isPreviewUrl: true
      });
    } else {
      this.setState({
        message,
        errorMessage: '',
        isPreviewUrl: this.state.urlPreview.length > 0
      });
    }
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
    this.setState({ isLoading: true, tokenAmount: 0 });
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

  isValidURL = str => {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(str);
  };

  onClosePreviewUrl = () => {
    this.setState({ urlPreview: '', isPreviewUrl: false });
  };

  uploadFileToIPFS = async () => {
    this.setState({ isLoading: true });
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(this.state.fileImage);
    reader.onloadend = () => {
      const buffer = Buffer.from(reader.result);
      ipfs.add(buffer, (err, ipfsHash) => {
        if (!err) {
          this.setState(
            { hashImage: ipfsHash[0].hash, isLoading: false },
            () => {
              this.newPost();
            }
          );
        } else {
          this.setState({ errorMessage: err.message, isLoading: false });
        }
      });
    };
  };

  onSelectFileImage = () => {
    this.refs.fileUploader.click();
  };

  onImageChange(event) {
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      reader.onload = e => {
        this.setState({ imagePreview: e.target.result });
      };
      reader.readAsDataURL(event.target.files[0]);
      this.setState({ errorMessage: '', fileImage: event.target.files[0] });
    }
  }

  onClearImagePreivew = () => {
    this.setState({ fileImage: null, imagePreview: '' });
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

                <Form error={this.state.errorMessage}>
                  <TextArea
                    autoHeight
                    style={{ maxHeight: '200px' }}
                    placeholder="Typing Message"
                    onChange={this.onTextChange}
                    value={this.state.message}
                  />
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'right',
                      marginTop: '6px',
                      display: this.state.isPreviewUrl ? 'none' : 'block'
                    }}
                  >
                    <label htmlFor="single">
                      <Button
                        size="small"
                        basic
                        color="blue"
                        onClick={this.onSelectFileImage}
                      >
                        <Icon name="photo" />
                        Photo
                      </Button>
                    </label>
                    <input
                      type="file"
                      id="file"
                      ref="fileUploader"
                      className="filetype"
                      id="group_image"
                      style={{ display: 'none' }}
                      onChange={this.onImageChange.bind(this)}
                    />
                  </div>
                  <div
                    class="image-container-preivew"
                    style={{
                      display: this.state.imagePreview ? 'block' : 'none'
                    }}
                  >
                    <Image
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                      src={this.state.imagePreview}
                    />
                    <div class="middle">
                      <Icon
                        name="close"
                        color="black"
                        style={{ cursor: 'pointer' }}
                        onClick={this.onClearImagePreivew}
                      />
                    </div>
                  </div>
                  <MicrolinkCard
                    style={{
                      maxWidth: '100%',
                      marginTop: '8px',
                      display: this.state.isPreviewUrl ? 'block' : 'none'
                    }}
                    url={this.state.urlPreview}
                    onClosePreviewUrl={this.onClosePreviewUrl}
                  />
                  <Message
                    error
                    header="Oops!"
                    content={this.state.errorMessage}
                  />
                </Form>
                <Button
                  style={{
                    margin: '16px',
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
            style={{
              width: '70%',
              overflow: 'auto',
              background: '#fafafa',
              height: 'calc(100vh - 46px)'
            }}
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
