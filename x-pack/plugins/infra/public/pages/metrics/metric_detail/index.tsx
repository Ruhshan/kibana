/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiErrorBoundary } from '@elastic/eui';
import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import type { InventoryItemType } from '@kbn/metrics-data-access-plugin/common';
import { ChromeBreadcrumb } from '@kbn/core/public';
import { useLinkProps } from '@kbn/observability-shared-plugin/public';
import { useMetricsBreadcrumbs } from '../../../hooks/use_metrics_breadcrumbs';
import { AssetDetailPage } from './asset_detail_page';
import { MetricDetailPage } from './metric_detail_page';
import { MetricsTimeProvider } from './hooks/use_metrics_time';

export const NodeDetail = () => {
  const {
    params: { type: nodeType, node: nodeName },
  } = useRouteMatch<{ type: InventoryItemType; node: string }>();

  const breadCrumbs: ChromeBreadcrumb[] = [];

  const hostsLinkProps = useLinkProps({
    app: 'metrics',
    pathname: 'hosts',
  });

  if (nodeType === 'host') {
    breadCrumbs.push({
      ...hostsLinkProps,
      text: 'Hosts',
    });
  }

  breadCrumbs.push({
    text: nodeName,
  });

  useMetricsBreadcrumbs(breadCrumbs);

  return (
    <EuiErrorBoundary>
      {nodeType === 'host' ? (
        <AssetDetailPage />
      ) : (
        <MetricsTimeProvider>
          <MetricDetailPage />
        </MetricsTimeProvider>
      )}
    </EuiErrorBoundary>
  );
};
