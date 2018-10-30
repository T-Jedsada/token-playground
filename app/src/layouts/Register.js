import React, { Component } from 'react';
import Contracts from '../services/contracts';
import { Button, Form, Message } from 'semantic-ui-react';
const { web3 } = window;

class Register extends Component {
  social = null;

  state = {
    isLoading: false,
    isClickAble: false,
    errorMessage: '',
    username: ''
  };

  componentDidMount() {
    Contracts.setNetwork('1234567');
    // Contracts.setNetwork('4')
    this.social = Contracts.Social();
    web3.eth.getAccounts((err, accounts) => {
      if (accounts.length > 0) {
        this.social.getUsername((err, response) => {
          if (!err) {
            const username = web3.toAscii(response).replace(/\u0000/g, '');
            console.log(username);
            if (username.length > 1) {
              this.props.history.replace('/feed');
            }
          }
        });
        this.social.NewUser().watch((err, result) => {
          if (!err) {
            this.props.history.replace('/feed');
          } else {
            this.setState({ errorMessage: err.message });
          }
        });
      }
    });
  }

  onRegister = () => {
    this.setState({ isLoading: true });
    this.social.register(this.state.username, err => {
      this.setState({ isLoading: false });
    });
  };

  onTextChange = event => {
    const username = event.target.value;
    this.setState({
      isClickAble: username,
      username: web3.fromAscii(username),
      errorMessage: ''
    });
  };

  render() {
    return (
      <div
        style={{
          width: '500px',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Form error={this.state.errorMessage} onSubmit={this.onRegister}>
          <h3>Username</h3>
          <Form.Input placeholder="20scoops" onChange={this.onTextChange} />
          <Message error header="Oops!" content={this.state.errorMessage} />
          <Button
            loading={this.state.isLoading}
            disabled={!this.state.isClickAble}
            primary
          >
            Register
          </Button>
        </Form>
      </div>
    );
  }
}

export default Register;
