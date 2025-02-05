/* eslint-disable react/no-danger */
// @flow
import React from 'react';
import type { Node } from 'react';

import type { QuestionCardDefault } from '../../../entities';
import { CardSpace, CardWrapper } from '../CardComponents';
import { AppDivider, AppText } from '../../AppComponents';

type FeedQuestionCardDefaultProps = {
  card: QuestionCardDefault,
};

function FeedQuestionCardDefault({ card }: FeedQuestionCardDefaultProps): Node {
  return (
    <CardWrapper
      card={card}
      size="auto"
      grid={card.layout_state || '1x1'}
    >
      <CardSpace
        selector="pg-question-card-1x2-default"
        type="vertical-full"
        style={{
          padding: 'var(--pg-padding-content)',
        }}
      >
        <AppText bold size="l">
          {card.question}
        </AppText>
        <AppDivider size="l" color="dark" />
        <AppText size="m">
          <div dangerouslySetInnerHTML={{ __html: card.answer }} />
        </AppText>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedQuestionCardDefault;
