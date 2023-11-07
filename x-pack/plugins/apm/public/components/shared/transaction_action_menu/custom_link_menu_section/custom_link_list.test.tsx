/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { render } from '@testing-library/react';
import React from 'react';
import { CustomLink } from '../../../../../common/custom_link/custom_link_types';
import { Transaction } from '../../../../../typings/es_schemas/ui/transaction';
import {
  expectTextsInDocument,
  expectTextsNotInDocument,
} from '../../../../utils/test_helpers';
import { CustomLinkList, getParsedCustomLinkUrl } from './custom_link_list';

describe('CustomLinkList', () => {
  const customLinks = [
    { id: '1', label: 'foo', url: 'http://elastic.co' },
    {
      id: '2',
      label: 'bar',
      url: 'http://elastic.co?service.name={{service.name}}',
    },
  ] as CustomLink[];

  const transaction = {
    service: { name: 'foo.bar' },
  } as unknown as Transaction;

  const customLinkWithTemplateVars = {
    id: '3',
    label: 'foo/bar',
    url: 'http://elastic.co?service.name={{service.name}}/transactions?transactionName={{transaction.name}}',
  };

  const transactionWithUnsafeCharacters = {
    service: { name: 'foo bar' },
    transaction: { name: '#/foo bar/%25c' },
  } as unknown as Transaction;

  it('shows links', () => {
    const component = render(
      <CustomLinkList customLinks={customLinks} transaction={transaction} />
    );
    expectTextsInDocument(component, ['foo', 'bar']);
  });

  it('doesnt show any links', () => {
    const component = render(
      <CustomLinkList customLinks={[]} transaction={transaction} />
    );
    expectTextsNotInDocument(component, ['foo', 'bar']);
  });

  it('urlencode custom links with unsafe characters', () => {
    const parsedLink = getParsedCustomLinkUrl(
      customLinkWithTemplateVars,
      transactionWithUnsafeCharacters
    );

    expect(parsedLink).toBe(
      'http://elastic.co?service.name=foo%20bar/transactions?transactionName=#/foo%20bar/%2525c'
    );
  });
});
