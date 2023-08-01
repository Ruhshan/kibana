/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo } from 'react';

import { SerializableRecord } from '@kbn/utility-types';
import { fromKueryExpression, toElasticsearchQuery } from '@kbn/es-query';
import { i18n } from '@kbn/i18n';
import type { SignificantTerm } from '@kbn/ml-agg-utils';

import { SEARCH_QUERY_LANGUAGE } from '@kbn/ml-query-utils';
import { useAiopsAppContext } from '../../hooks/use_aiops_app_context';

import { TableActionButton } from './table_action_button';
import { getTableItemAsKQL } from './get_table_item_as_kql';
import type { GroupTableItem, TableItemAction } from './types';

const viewInLogPatternAnalysisMessage = i18n.translate(
  'xpack.aiops.logRateAnalysis.resultsTable.linksMenu.viewInLogPatternAnalysis',
  {
    defaultMessage: 'View in Log Pattern Analysis',
  }
);

export const useViewInLogPatternAnalysisAction = (dataViewId?: string): TableItemAction => {
  const { application, share, data } = useAiopsAppContext();

  const mlLocator = useMemo(() => share.url.locators.get('ML_APP_LOCATOR'), [share.url.locators]);

  const generateLogPatternAnalysisUrl = async (
    groupTableItem: GroupTableItem | SignificantTerm
  ) => {
    if (mlLocator !== undefined) {
      const searchString = getTableItemAsKQL(groupTableItem);
      const ast = fromKueryExpression(searchString);
      const searchQuery = toElasticsearchQuery(ast);

      const appState = {
        logCategorization: {
          filters: data.query.filterManager.getFilters(),
          // QueryDslQueryContainer type triggers an error as being
          // not working with SerializableRecord, however, it works as expected.
          searchQuery: searchQuery as unknown,
          searchQueryLanguage: SEARCH_QUERY_LANGUAGE.KUERY,
          searchString: getTableItemAsKQL(groupTableItem),
        },
      } as SerializableRecord;

      return await mlLocator.getUrl({
        page: 'aiops/log_categorization',
        pageState: {
          index: dataViewId,
          timeRange: data.query.timefilter.timefilter.getTime(),
          appState,
        },
      });
    }
  };

  const logPatternAnalysisUrlError = useMemo(() => {
    if (!mlLocator) {
      return i18n.translate(
        'xpack.aiops.logRateAnalysis.resultsTable.mlLocatorMissingErrorMessage',
        {
          defaultMessage: 'No locator for Log Pattern Analysis detected',
        }
      );
    }
    if (!dataViewId) {
      return i18n.translate(
        'xpack.aiops.logRateAnalysis.resultsTable.autoGeneratedLogPatternAnalysisLinkErrorMessage',
        {
          defaultMessage:
            'Unable to link to Log Pattern Analysis; no data view exists for this index',
        }
      );
    }
  }, [dataViewId, mlLocator]);

  return {
    render: (tableItem: SignificantTerm | GroupTableItem) => {
      const message = logPatternAnalysisUrlError
        ? logPatternAnalysisUrlError
        : viewInLogPatternAnalysisMessage;

      const clickHandler = async () => {
        const openInLogPatternAnalysisUrl = await generateLogPatternAnalysisUrl(tableItem);
        if (typeof openInLogPatternAnalysisUrl === 'string') {
          await application.navigateToUrl(openInLogPatternAnalysisUrl);
        }
      };

      const isDisabled = logPatternAnalysisUrlError !== undefined;

      return (
        <TableActionButton
          dataTestSubjPostfix="LogPatternAnalysis"
          iconType="logstashQueue"
          isDisabled={isDisabled}
          label={viewInLogPatternAnalysisMessage}
          tooltipText={message}
          onClick={clickHandler}
        />
      );
    },
  };
};
