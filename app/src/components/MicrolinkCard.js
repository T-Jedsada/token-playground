import React, { Component } from 'react';
import MicrolinkCard from 'react-microlink';
import { Icon } from 'semantic-ui-react';

class MicrolinkCardWrapper extends Component {
  state = {
    isClear: false,
    url: ''
  };

  componentWillReceiveProps({ url }) {
    if (this.props.url !== url) {
      this.setState(
        {
          isClear: true,
          url: this.props.url
        },
        () => {
          window.setTimeout(() => {
            this.setState({
              isClear: false
            });
          }, 300);
        }
      );
    }
  }

  shouldComponentUpdate({ url }, { isClear }) {
    if (this.props.url === url && this.state.isClear === isClear) {
      return false;
    }
    return true;
  }

  render() {
    if (!this.state.isClear) {
      return (
        <div style={{ position: 'relative', ...this.props.style }}>
          <Icon
            name="close"
            style={{
              marginTop: '10px',
              position: 'absolute',
              right: '6px',
              zIndex: '1',
              cursor: 'pointer',
              display: this.props.hideButtonClose ? 'none' : 'block'
            }}
            onClick={this.props.onClosePreviewUrl}
          />
          <MicrolinkCard
            {...this.props}
            style={{
              maxWidth: '100%'
            }}
          />
        </div>
      );
    }
    return null;
  }
}

export default MicrolinkCardWrapper;
