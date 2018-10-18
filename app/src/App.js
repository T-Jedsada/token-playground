import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Feed from './layouts/Feed';
import Register from './layouts/Register';
import './App.css';

class App extends Component {
  render() {
    return (
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
    );
  }
}

export default App;
