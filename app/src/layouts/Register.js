import React, { Component }from "react"
import Contracts from "../services/contracts"
import { Button, Form, Message } from 'semantic-ui-react'
const { web3 } = window

class Register extends Component {

    social = null

    state = {
        isLoading: false,
        isClickAble: false,
        errorMessage: '',
        username: ''
    }

    componentDidMount() {
        Contracts.setNetwork('1234567')
        // Contracts.setNetwork('4')
        this.social = Contracts.Social()

        const defaultAccount = web3.eth.defaultAccount
        console.log('my address', defaultAccount)

        this.social.getUsername((err, response) => {
            console.log(err)
            console.log(response)
            
            if (!err) {
                const username = web3.toAscii(response).replace(/\u0000/g, '')              
                if (username.length > 1) {
                    this.props.history.replace('/feed')
                }
            }
        })

        this.social.NewUser().watch((err, result) => {
            // TODO: event new user
        })
    }

    onRegister = () => {
        this.setState({isLoading: true})
        this.social.register(this.state.username, (err) => {
            this.setState({isLoading: false})
            if (!err) {
                this.props.history.replace('/feed')
            } else {
                this.setState({errorMessage: err.message})
            }
        })
    }

    onTextChange = (event) => {
        const username = event.target.value
        this.setState({isClickAble: username, username : web3.fromAscii(username), errorMessage: ''})
    }

    render() {
        return(
            <div style={{ width:'500px' }}>
                <Form error={this.state.errorMessage} onSubmit={this.onRegister}>
                    <h3>Username</h3>
                    <Form.Input placeholder='20scoops' onChange={this.onTextChange}/>
                    <Message error header='Oops!' content={this.state.errorMessage}/>
                    <Button loading={this.state.isLoading} disabled={!this.state.isClickAble} primary>Register</Button>
                </Form>
            </div>
        )
    }
}

export default Register