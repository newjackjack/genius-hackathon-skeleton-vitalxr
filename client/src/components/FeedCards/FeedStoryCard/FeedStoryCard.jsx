// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { StoryCard } from '../../../entities';
import { AppImage, AppVideo, AppText } from '../../AppComponents';

type StoryCardProps = {
  card: StoryCard,
};

function FeedStoryCard({ card }: StoryCardProps): Node {
  if (card.layout_state === 'horizontal') {
    return (
      <CardWrapper size="auto" card={card} grid="full_w">
        <CardSpace
          type="horizontal-full"
          style={{
            overflow: 'hidden',
            borderRadius: 'var(--pg-story-border-radius)',
            border: 'var(--pg-story-border)',
          }}
        >
          {card.video_link_url ? (
            <AppVideo videoURL={card.video_link_url} />
          ) : (
            <AppImage
              imageURL={card.image_url}
              style={{
                height: '100%',
                width: 'auto',
                maxWidth: 'var(--pg-story-img-horiz-h)',
              }}
            />
          )}
          <CardSpace
            type="vertical-full"
            style={{ padding: 'var(--pg-story-padding)', gap: 10 }}
          >
            <AppText style={{ color: 'var(--pg-story-color)' }} size="l">
              {card.title}
            </AppText>
            <AppText style={{ color: 'var(--pg-story-color)' }} size="m">
              {card.description}
            </AppText>
          </CardSpace>
        </CardSpace>
      </CardWrapper>
    );
  }
  if (card.layout_state === 'vertical') {
    return (
      <CardWrapper size="auto" card={card} grid="full_w">
        <CardSpace
          type="vertical-full"
          style={{
            overflow: 'hidden',
            borderRadius: 'var(--pg-story-border-radius)',
            border: 'var(--pg-story-border)',
          }}
        >
          {card.video_link_url ? (
            <AppVideo videoURL={card.video_link_url} />
          ) : (
            <AppImage
              imageURL={card.image_url}
              style={{
                height: 'auto',
                width: '100%',
                maxHeight: 'var(--pg-story-img-vert-w)',
                '--pg-object-fit-image': 'cover',
              }}
            />
          )}
          <CardSpace
            type="vertical-full"
            style={{ padding: 'var(--pg-story-padding)', gap: 10 }}
          >
            <AppText style={{ color: 'var(--pg-story-color)' }} size="l">
              {card.title}
            </AppText>
            <AppText style={{ color: 'var(--pg-story-color)' }} size="m">
              {card.description}
            </AppText>
          </CardSpace>
        </CardSpace>
      </CardWrapper>
    );
  }
  if (card.layout_state === 'backdrop') {
    return (
      <CardWrapper size="auto" card={card} grid="full_w">
        <CardSpace
          type="vertical-full"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--pg-story-border-radius)',
            border: 'var(--pg-story-border)',
          }}
        >
          {card.video_link_url ? (
            <AppVideo
              videoURL={card.video_link_url}
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          ) : (
            <AppImage
              imageURL={card.image_url}
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                '--pg-object-fit-image': 'cover',
              }}
            />
          )}
          <CardSpace
            type="vertical-full"
            style={{ padding: 'var(--pg-story-padding)', gap: 10, zIndex: 1 }}
          >
            <AppText style={{ color: 'var(--pg-story-color)' }} size="l">
              {card.title}
            </AppText>
            <AppText style={{ color: 'var(--pg-story-color)' }} size="m">
              {card.description}
            </AppText>
          </CardSpace>
        </CardSpace>
      </CardWrapper>
    );
  }
}

export default FeedStoryCard;
