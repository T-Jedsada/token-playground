import React from 'react';
import FeedItem from './FeedItem';
import { Feed } from 'semantic-ui-react';

function ListFeed(props) {
  var items = props.items;
  return (
    <Feed style={{ overflow: 'auto', willChange: 'transform', width: '550px' }}>
      {' '}
      {items.map(item => {
        return (
          <FeedItem
            key={item.postId}
            item={item}
            onLikePost={props.onLikePost}
            onUnLikePost={props.onUnLikePost}
            onItemImageClick={props.onItemImageClick}
            isReporter={props.isReporter}
          />
        );
      })}
    </Feed>
  );
}

export default ListFeed;
