import React from 'react';
import { Feed, Image, Icon } from 'semantic-ui-react';
import makeBlockie from 'ethereum-blockies-base64';
import MicrolinkCard from '../components/MicrolinkCard';
import 'react-aspect-ratio/aspect-ratio.css';
import AspectRatio from 'react-aspect-ratio';

const { web3 } = window;

function FeedItem(props) {
  var item = props.item;
  console.log(item);
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
            style={{
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
              props.onLikePost(item);
            }}
          >
            <Icon name="thumbs up" />
            9,999 Likes
          </Feed.Like>
          <Feed.Like
            style={{ display: props.isReporter ? 'inline' : 'none' }}
            onClick={() => {
              props.onUnLikePost(item);
            }}
          >
            <Icon name="thumbs down" />
            999 Likes
          </Feed.Like>
        </Feed.Meta>
      </Feed.Content>
    </Feed.Event>
  );
}

export default FeedItem;
