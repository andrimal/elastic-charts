/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import { MockSeriesSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store';
import { removeSpec, specParsed, upsertSpec } from '../../../state/actions/specs';
import type { GlobalChartState } from '../../../state/chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { getLegendItemsSelector } from '../../../state/selectors/get_legend_items';

const data = [
  { x: 0, y: 10 },
  { x: 1, y: 10 },
];

describe('XYChart - specs ordering', () => {
  let store: Store<GlobalChartState>;
  beforeEach(() => {
    store = MockStore.default({ width: 100, height: 100, left: 0, top: 0 });
  });

  it('the legend respect the insert [A, B, C] order', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({ id: 'A', data }),
        MockSeriesSpec.bar({ id: 'B', data }),
        MockSeriesSpec.bar({ id: 'C', data }),
      ],
      store,
    );

    const legendItems = getLegendItemsSelector(store.getState());
    const names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['A', 'B', 'C']);
  });
  it('the legend respect the insert order [B, A, C]', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({ id: 'B', data }),
        MockSeriesSpec.bar({ id: 'A', data }),
        MockSeriesSpec.bar({ id: 'C', data }),
      ],
      store,
    );
    const legendItems = getLegendItemsSelector(store.getState());
    const names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['B', 'A', 'C']);
  });
  it('the legend respect the order when changing properties of existing specs', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({ id: 'A', data }),
        MockSeriesSpec.bar({ id: 'B', data }),
        MockSeriesSpec.bar({ id: 'C', data }),
      ],
      store,
    );

    let legendItems = getLegendItemsSelector(store.getState());
    let names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['A', 'B', 'C']);

    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({ id: 'A', data }),
        MockSeriesSpec.bar({ id: 'B', name: 'B updated', data }),
        MockSeriesSpec.bar({ id: 'C', data }),
      ],
      store,
    );

    legendItems = getLegendItemsSelector(store.getState());
    names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['A', 'B updated', 'C']);
  });
  it('the legend respect the order when changing the order of the specs', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({ id: 'A', data }),
        MockSeriesSpec.bar({ id: 'B', data }),
        MockSeriesSpec.bar({ id: 'C', data }),
      ],
      store,
    );
    let legendItems = getLegendItemsSelector(store.getState());
    let names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['A', 'B', 'C']);

    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({ id: 'B', data }),
        MockSeriesSpec.bar({ id: 'A', data }),
        MockSeriesSpec.bar({ id: 'C', data }),
      ],
      store,
    );

    legendItems = getLegendItemsSelector(store.getState());
    names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['B', 'A', 'C']);
  });
  it('The status should switch to not initialized removing a spec', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({ id: 'A', data }),
        MockSeriesSpec.bar({ id: 'B', data }),
        MockSeriesSpec.bar({ id: 'C', data }),
      ],
      store,
    );
    expect(getInternalIsInitializedSelector(store.getState())).toBe(InitStatus.Initialized);
    // check on remove
    store.dispatch(removeSpec('A'));
    expect(getInternalIsInitializedSelector(store.getState())).not.toBe(InitStatus.Initialized);

    // initialized again after specParsed action
    store.dispatch(specParsed());
    expect(getInternalIsInitializedSelector(store.getState())).toBe(InitStatus.Initialized);
  });
  it('The status should switch to not initialized when upserting a spec', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.bar({ id: 'A', data }),
        MockSeriesSpec.bar({ id: 'B', data }),
        MockSeriesSpec.bar({ id: 'C', data }),
      ],
      store,
    );
    expect(getInternalIsInitializedSelector(store.getState())).toBe(InitStatus.Initialized);

    // check on upsert
    store.dispatch(upsertSpec(MockSeriesSpec.bar({ id: 'D', data })));
    expect(getInternalIsInitializedSelector(store.getState())).not.toBe(InitStatus.Initialized);

    // initialized again after specParsed action
    store.dispatch(specParsed());
    expect(getInternalIsInitializedSelector(store.getState())).toBe(InitStatus.Initialized);
  });
});
