import React, { Component } from 'react';
import { Feed, Image, Icon } from 'semantic-ui-react';
import makeBlockie from 'ethereum-blockies-base64';
import MicrolinkCard from '../components/MicrolinkCard';
import 'react-aspect-ratio/aspect-ratio.css';

const { web3 } = window;

class FeedItem extends Component {
  state = {
    countLike: 0,
    countDisLike: 0
  };

  getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  prettifyNumber = value => {
    var thousand = 1000;
    var million = 1000000;
    var billion = 1000000000;
    var trillion = 1000000000000;
    if (value < thousand) {
      return String(value);
    }

    if (value >= thousand && value <= 1000000) {
      return Math.round(value / thousand) + 'K';
    }

    if (value >= million && value <= billion) {
      return Math.round(value / million) + 'M';
    }

    if (value >= billion && value <= trillion) {
      return Math.round(value / billion) + 'B';
    } else {
      return Math.round(value / trillion) + 'T';
    }
  };

  componentDidMount() {
    this.setState({
      countLike: this.getRandomInt(100000),
      countDisLike: this.getRandomInt(1000)
    });
  }

  render() {
    var item = this.props.item;
    return (
      <Feed.Event style={{ marginTop: '6px', marginBottom: '6px' }}>
        <div class="label">
          <Image
            style={{
              width: '35px',
              height: '35px',
              border: '1px solid #847e7e9e',
              marginTop: '6px'
            }}
            avatar
            src={makeBlockie(item.address)}
          />
        </div>
        <Feed.Content>
          <Feed.Date style={{ fontSize: '12px' }} content={item.address} />
          <Feed.Summary style={{ textAlign: 'start' }}>
            <a>{web3.toAscii(item.username).replace(/\u0000/g, '')}</a>
          </Feed.Summary>
          <Feed.Extra
            text
            style={{
              textAlign: 'start',
              maxWidth: '550px',
              wordBreak: 'break-all',
              display: item.message ? 'block' : 'none'
            }}
          >
            {item.message}
          </Feed.Extra>
          <div
            class="image-container"
            style={{ display: item.hashImage ? 'block' : 'none' }}
          >
            <Image
              onClick={() => {
                this.props.onItemImageClick(
                  `https://ipfs.infura.io/ipfs/${item.hashImage}`
                );
              }}
              style={{
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              src={`https://ipfs.infura.io/ipfs/${item.hashImage}`}
            />
          </div>
          <MicrolinkCard
            style={{
              marginTop: '10px',
              marginBottom: '5px',
              maxWidth: '550px',
              display: item.url ? 'block' : 'none'
            }}
            url={item.url}
            hideButtonClose={true}
          />
          <Feed.Meta>
            <Feed.Like
              onClick={() => {
                this.props.onLikePost(item);
              }}
            >
              <Icon name="thumbs up" />
              {this.prettifyNumber(this.state.countLike)} Likes
            </Feed.Like>
            <Feed.Like
              style={{ display: this.props.isReporter ? 'inline' : 'none' }}
              onClick={() => {
                this.props.onUnLikePost(item);
              }}
            >
              <Icon name="thumbs down" />
              {this.prettifyNumber(this.state.countDisLike)} Likes
            </Feed.Like>
          </Feed.Meta>
        </Feed.Content>
      </Feed.Event>
    );
  }
}

export default FeedItem;
