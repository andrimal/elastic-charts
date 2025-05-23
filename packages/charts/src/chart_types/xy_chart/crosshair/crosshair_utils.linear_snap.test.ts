/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getCursorBandPosition, getSnapPosition } from './crosshair_utils';
import { ChartType } from '../..';
import { MockGlobalSpec } from '../../../mocks/specs/specs';
import { MockXDomain } from '../../../mocks/xy/domains';
import type { ScaleContinuous } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import type { Dimensions } from '../../../utils/dimensions';
import { getScaleConfigsFromSpecs } from '../state/selectors/get_api_scale_configs';
import { computeSeriesDomains } from '../state/utils/utils';
import { computeXScale } from '../utils/scales';
import type { BasicSeriesSpec } from '../utils/specs';
import { SeriesType } from '../utils/specs';

describe('Crosshair utils linear scale', () => {
  const barSeries1SpecId = 'barSeries1';
  const barSeries2SpecId = 'barSeries2';
  const lineSeries1SpecId = 'lineSeries1';
  const lineSeries2SpecId = 'lineSeries2';

  const barSeries1: BasicSeriesSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    id: barSeries1SpecId,
    groupId: 'group1',
    seriesType: SeriesType.Bar,
    data: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    xAccessor: 0,
    yAccessors: [1],
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
  };
  const barSeries2: BasicSeriesSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    id: barSeries2SpecId,
    groupId: 'group1',
    seriesType: SeriesType.Bar,
    data: [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    xAccessor: 0,
    yAccessors: [1],
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
  };
  const lineSeries1: BasicSeriesSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    id: lineSeries1SpecId,
    groupId: 'group1',
    seriesType: SeriesType.Line,
    data: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    xAccessor: 0,
    yAccessors: [1],
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
  };
  const lineSeries2: BasicSeriesSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Series,
    id: lineSeries2SpecId,
    groupId: 'group1',
    seriesType: SeriesType.Line,
    data: [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    xAccessor: 0,
    yAccessors: [1],
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
  };

  const barSeries = [barSeries1];
  const barSeriesDomains = computeSeriesDomains(
    barSeries,
    getScaleConfigsFromSpecs([], barSeries, MockGlobalSpec.settings()),
    [],
    { locale: 'en-US' },
  );

  const multiBarSeries = [barSeries1, barSeries2];
  const multiBarSeriesDomains = computeSeriesDomains(
    multiBarSeries,
    getScaleConfigsFromSpecs([], multiBarSeries, MockGlobalSpec.settings()),
    [],
    { locale: 'en-US' },
  );

  const lineSeries = [lineSeries1];
  const lineSeriesDomains = computeSeriesDomains(
    lineSeries,
    getScaleConfigsFromSpecs([], lineSeries, MockGlobalSpec.settings()),
    [],
    { locale: 'en-US' },
  );

  const multiLineSeries = [lineSeries1, lineSeries2];
  const multiLineSeriesDomains = computeSeriesDomains(
    multiLineSeries,
    getScaleConfigsFromSpecs([], multiLineSeries, MockGlobalSpec.settings()),
    [],
    { locale: 'en-US' },
  );

  const mixedLinesBars = [lineSeries1, lineSeries2, barSeries1, barSeries2];
  const mixedLinesBarsSeriesDomains = computeSeriesDomains(
    mixedLinesBars,
    getScaleConfigsFromSpecs([], mixedLinesBars, MockGlobalSpec.settings()),
    [],
    { locale: 'en-US' },
  );

  const barSeriesScale = computeXScale({
    xDomain: barSeriesDomains.xDomain,
    totalBarsInCluster: barSeries.length,
    range: [0, 120],
  }) as ScaleContinuous;
  const multiBarSeriesScale = computeXScale({
    xDomain: multiBarSeriesDomains.xDomain,
    totalBarsInCluster: multiBarSeries.length,
    range: [0, 120],
  }) as ScaleContinuous;
  const lineSeriesScale = computeXScale({
    xDomain: lineSeriesDomains.xDomain,
    totalBarsInCluster: lineSeries.length,
    range: [0, 120],
  }) as ScaleContinuous;
  const multiLineSeriesScale = computeXScale({
    xDomain: multiLineSeriesDomains.xDomain,
    totalBarsInCluster: multiLineSeries.length,
    range: [0, 120],
  }) as ScaleContinuous;
  const mixedLinesBarsSeriesScale = computeXScale({
    xDomain: mixedLinesBarsSeriesDomains.xDomain,
    totalBarsInCluster: mixedLinesBars.length,
    range: [0, 120],
  }) as ScaleContinuous;

  /**
   * if we have lines on a linear scale, the snap position and band should
   * be always the same independently of the number of series
   */
  test('can snap position on linear scale (line/area)', () => {
    let snappedPosition = getSnapPosition(0, lineSeriesScale);
    expect(snappedPosition?.band).toEqual(1);
    expect(snappedPosition?.position).toEqual(0);

    snappedPosition = getSnapPosition(1, lineSeriesScale);
    expect(snappedPosition?.band).toEqual(1);
    expect(snappedPosition?.position).toEqual(60);

    snappedPosition = getSnapPosition(2, lineSeriesScale);
    expect(snappedPosition?.band).toEqual(1);
    expect(snappedPosition?.position).toEqual(120);

    // TODO uncomment this when we will limit the scale function to domain values.
    // snappedPosition = getSnapPosition(3, singleScale);
    // expect(snappedPosition?.band).toEqual(1);
    // expect(snappedPosition?.position).toBeUndefined();

    snappedPosition = getSnapPosition(0, multiLineSeriesScale, 2);
    expect(snappedPosition?.band).toEqual(1);
    expect(snappedPosition?.position).toEqual(0);

    snappedPosition = getSnapPosition(1, multiLineSeriesScale, 2);
    expect(snappedPosition?.band).toEqual(1);
    expect(snappedPosition?.position).toEqual(60);

    snappedPosition = getSnapPosition(2, multiLineSeriesScale, 2);
    expect(snappedPosition?.band).toEqual(1);
    expect(snappedPosition?.position).toEqual(120);
  });

  /**
   * if we have bars on a linear scale, the snap position and band should
   * be always the same independently of the number of series
   */
  test('can snap position on linear scale (bar)', () => {
    let snappedPosition = getSnapPosition(0, barSeriesScale);
    expect(snappedPosition?.band).toEqual(40);
    expect(snappedPosition?.position).toEqual(0);

    snappedPosition = getSnapPosition(1, barSeriesScale);
    expect(snappedPosition?.band).toEqual(40);
    expect(snappedPosition?.position).toEqual(40);

    snappedPosition = getSnapPosition(2, barSeriesScale);
    expect(snappedPosition?.band).toEqual(40);
    expect(snappedPosition?.position).toEqual(80);

    // TODO uncomment this when we will limit the scale function to domain values.
    // snappedPosition = getSnapPosition(3, singleScale);
    // expect(snappedPosition?.band).toEqual(40);
    // expect(snappedPosition?.position).toBeUndefined();

    // test a scale with a value of totalBarsInCluster > 1
    snappedPosition = getSnapPosition(0, multiBarSeriesScale, 2);
    expect(snappedPosition?.band).toEqual(40);
    expect(snappedPosition?.position).toEqual(0);

    snappedPosition = getSnapPosition(1, multiBarSeriesScale, 2);
    expect(snappedPosition?.band).toEqual(40);
    expect(snappedPosition?.position).toEqual(40);

    snappedPosition = getSnapPosition(2, multiBarSeriesScale, 2);
    expect(snappedPosition?.band).toEqual(40);
    expect(snappedPosition?.position).toEqual(80);
  });

  /**
   * if we have bars and lines on a linear scale, the snap position and band should
   * be always the same independently of the number of series
   */
  test('can snap position on linear scale (mixed bars and lines)', () => {
    let snappedPosition = getSnapPosition(0, mixedLinesBarsSeriesScale, 4);
    expect(snappedPosition?.band).toEqual(40);
    expect(snappedPosition?.position).toEqual(0);

    snappedPosition = getSnapPosition(1, mixedLinesBarsSeriesScale, 4);
    expect(snappedPosition?.band).toEqual(40);
    expect(snappedPosition?.position).toEqual(40);

    snappedPosition = getSnapPosition(2, mixedLinesBarsSeriesScale, 4);
    expect(snappedPosition?.band).toEqual(40);
    expect(snappedPosition?.position).toEqual(80);
  });
  test('safeguard cursor band position', () => {
    const chartDimensions: Dimensions = { top: 0, left: 0, width: 120, height: 100 };
    const chartRotation = 0;
    const snapPosition = false;

    let bandPosition = getCursorBandPosition(
      chartRotation,
      chartDimensions,
      { x: 200, y: 0 },
      lineSeriesScale.invertWithStep(200, [0, 1, 2]),
      snapPosition,
      lineSeriesScale,
      1,
    );
    expect(bandPosition).toBeUndefined();

    bandPosition = getCursorBandPosition(
      chartRotation,
      chartDimensions,
      { x: 0, y: 200 },
      lineSeriesScale.invertWithStep(0, [0, 1, 2]),
      snapPosition,
      lineSeriesScale,
      1,
    );
    expect(bandPosition).toBeUndefined();

    bandPosition = getCursorBandPosition(
      chartRotation,
      chartDimensions,
      { x: -1, y: 0 },
      lineSeriesScale.invertWithStep(-1, [0, 1, 2]),
      snapPosition,
      lineSeriesScale,
      1,
    );
    expect(bandPosition).toBeUndefined();

    bandPosition = getCursorBandPosition(
      chartRotation,
      chartDimensions,
      { x: 0, y: -1 },
      lineSeriesScale.invertWithStep(0, [0, 1, 2]),
      snapPosition,
      lineSeriesScale,
      1,
    );
    expect(bandPosition).toBeUndefined();
  });

  describe('BandPosition line chart', () => {
    const chartDimensions: Dimensions = { top: 0, left: 0, width: 120, height: 100 };

    describe('0 degree rotation, snap disabled', () => {
      const chartRotation = 0;
      const snapPosition = false;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test("changes on y mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 45 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 40, y: 0 },
          lineSeriesScale.invertWithStep(40, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 40,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 90, y: 0 },
          lineSeriesScale.invertWithStep(90, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 90,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 200, y: 0 },
          lineSeriesScale.invertWithStep(200, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toBeUndefined();
      });
    });
    describe('0 degree rotation, snap enabled', () => {
      const chartRotation = 0;
      const snapPosition = true;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test("changes on y mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 45 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 20, y: 0 },
          lineSeriesScale.invertWithStep(20, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 40, y: 0 },
          lineSeriesScale.invertWithStep(40, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 60,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 3', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 95, y: 0 },
          lineSeriesScale.invertWithStep(95, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 120,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 200, y: 0 },
          lineSeriesScale.invertWithStep(200, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toBeUndefined();
      });
    });

    describe('180 degree rotation, snap disabled', () => {
      const chartRotation = 180;
      const snapPosition = false;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );

        expect(bandPosition).toEqual({
          x: 120,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test("changes on y mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 45 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 120,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 40, y: 0 },
          lineSeriesScale.invertWithStep(40, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 80,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 90, y: 0 },
          lineSeriesScale.invertWithStep(90, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 30,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 200, y: 0 },
          lineSeriesScale.invertWithStep(200, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toBeUndefined();
      });
    });

    describe('180 degree rotation, snap enabled', () => {
      const chartRotation = 180;
      const snapPosition = true;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 120,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test("changes on y mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 45 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 120,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 20, y: 0 },
          lineSeriesScale.invertWithStep(20, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 120,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 40, y: 0 },
          lineSeriesScale.invertWithStep(40, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 60,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('increase of x axis increase the left param 3', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 95, y: 0 },
          lineSeriesScale.invertWithStep(95, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 0,
          y: 0,
          height: 100,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 200, y: 0 },
          lineSeriesScale.invertWithStep(200, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toBeUndefined();
      });
    });

    describe('90 degree rotation, snap disabled', () => {
      const chartRotation = 90;
      const snapPosition = false;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 0,
          height: 0,
        });
      });

      test("changes on x mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 45, y: 0 },
          lineSeriesScale.invertWithStep(45, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 45,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 40 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 0,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 90 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 0,
          height: 0,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 200 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toBeUndefined();
      });
    });

    describe('90 degree rotation, snap enabled', () => {
      const chartRotation = 90;
      const snapPosition = true;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 0,
          height: 0,
        });
      });

      test("changes on x mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 45, y: 0 },
          lineSeriesScale.invertWithStep(45, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 60,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 20 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 0,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 40 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 0,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 3', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 95 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 0,
          height: 0,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 200 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toBeUndefined();
      });
    });

    describe('-90 degree rotation, snap disabled', () => {
      const chartRotation = -90;
      const snapPosition = false;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 100,
          height: 0,
        });
      });

      test("changes on x mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 45, y: 0 },
          lineSeriesScale.invertWithStep(45, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 55,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 40 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 100,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 90 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 100,
          height: 0,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 200 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toBeUndefined();
      });
    });

    describe('-90 degree rotation, snap enabled', () => {
      const chartRotation = -90;
      const snapPosition = true;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 100,
          height: 0,
        });
      });

      test("changes on x mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 45, y: 0 },
          lineSeriesScale.invertWithStep(45, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 40,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 20 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 100,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 40 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 100,
          height: 0,
        });
      });

      test('increase of y mouse position increase the top param 3', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 95 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toEqual({
          x: 0,
          width: 120,
          y: 100,
          height: 0,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 200 },
          lineSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          lineSeriesScale,
          0,
        );
        expect(bandPosition).toBeUndefined();
      });
    });
  });

  describe('BandPosition bar chart', () => {
    const chartDimensions: Dimensions = { top: 0, left: 0, width: 120, height: 100 };
    describe('0 degree rotation, snap enabled', () => {
      const chartRotation = 0;
      const snapPosition = true;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 0,
          height: 100,
          width: 40,
        });
      });

      test("changes on y mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 45 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 0,
          height: 100,
          width: 40,
        });
      });

      test('increase of x axis increase the left param 1', () => {
        let bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 40, y: 0 },
          barSeriesScale.invertWithStep(40, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 0,
          height: 100,
          width: 40,
        });
        bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 41, y: 0 },
          barSeriesScale.invertWithStep(41, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 40,
          y: 0,
          height: 100,
          width: 40,
        });
      });

      test('increase of x axis increase the left param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 90, y: 0 },
          barSeriesScale.invertWithStep(90, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 80,
          y: 0,
          height: 100,
          width: 40,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 200, y: 0 },
          barSeriesScale.invertWithStep(200, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toBeUndefined();
      });
    });

    describe('180 degree rotation, snap enabled', () => {
      const chartRotation = 180;
      const snapPosition = true;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 80,
          y: 0,
          height: 100,
          width: 40,
        });
      });

      test("changes on y mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 45 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 80,
          y: 0,
          height: 100,
          width: 40,
        });
      });

      test('increase of x axis increase the left param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 41, y: 0 },
          barSeriesScale.invertWithStep(41, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 40,
          y: 0,
          height: 100,
          width: 40,
        });
      });

      test('increase of x axis increase the left param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 90, y: 0 },
          barSeriesScale.invertWithStep(90, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 0,
          height: 100,
          width: 40,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 200, y: 0 },
          barSeriesScale.invertWithStep(200, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toBeUndefined();
      });
    });

    describe('90 degree rotation, snap enabled', () => {
      const chartRotation = 90;
      const snapPosition = true;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 0,
          height: 40,
          width: 120,
        });
      });

      test("changes on x mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 45, y: 0 },
          barSeriesScale.invertWithStep(45, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 40,
          height: 40,
          width: 120,
        });
      });

      test('increase of y mouse position increase the top param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 40 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 0,
          height: 40,
          width: 120,
        });
      });

      test('increase of y mouse position increase the top param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 90 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 0,
          height: 40,
          width: 120,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 200 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toBeUndefined();
      });
    });

    describe('-90 degree rotation, snap disabled', () => {
      const chartRotation = -90;
      const snapPosition = true;

      test('0,0 position', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 0 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 60,
          height: 40,
          width: 120,
        });
      });

      test("changes on x mouse position doesn't change the band position", () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 45, y: 0 },
          barSeriesScale.invertWithStep(45, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 20,
          height: 40,
          width: 120,
        });
      });

      test('increase of y mouse position increase the top param 1', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 40 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 60,
          height: 40,
          width: 120,
        });
      });

      test('increase of y mouse position increase the top param 2', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 90 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toEqual({
          x: 0,
          y: 60,
          height: 40,
          width: 120,
        });
      });

      test('limit the band position based on chart dimension', () => {
        const bandPosition = getCursorBandPosition(
          chartRotation,
          chartDimensions,
          { x: 0, y: 200 },
          barSeriesScale.invertWithStep(0, [0, 1, 2]),
          snapPosition,
          barSeriesScale,
          1,
        );
        expect(bandPosition).toBeUndefined();
      });
    });
  });

  describe('BandPosition bar chart wwith limited edges', () => {
    const chartDimensions: Dimensions = { top: 0, left: 0, width: 120, height: 120 };
    test('cursor at begin of domain', () => {
      const barSeriesScaleLimited = computeXScale({
        xDomain: MockXDomain.fromScaleType(ScaleType.Linear, {
          domain: [0.5, 3.5],
          isBandScale: true,
          minInterval: 1,
        }),
        totalBarsInCluster: 1,
        range: [0, 120],
      });
      const bandPosition = getCursorBandPosition(
        0,
        chartDimensions,
        { x: 0, y: 0 },
        {
          value: 0,
          withinBandwidth: true,
        },
        true,
        barSeriesScaleLimited,
        1,
      );
      expect(bandPosition).toEqual({
        x: 0,
        y: 0,
        height: 120,
        width: 15,
      });
    });
    test('cursor at end of domain', () => {
      const barSeriesScaleLimited = computeXScale({
        xDomain: MockXDomain.fromScaleType(ScaleType.Linear, {
          domain: [-0.5, 2.5],
          isBandScale: true,
          minInterval: 1,
        }),
        totalBarsInCluster: barSeries.length,
        range: [0, 120],
      });
      const bandPosition = getCursorBandPosition(
        0,
        chartDimensions,
        { x: 119, y: 0 },
        {
          value: 3,
          withinBandwidth: true,
        },
        true,
        barSeriesScaleLimited,
        1,
      );
      expect(bandPosition).toEqual({
        x: 105,
        y: 0,
        height: 120,
        width: 15,
      });
    });
    test('cursor at top begin of domain', () => {
      const barSeriesScaleLimited = computeXScale({
        xDomain: MockXDomain.fromScaleType(ScaleType.Linear, {
          domain: [0.5, 3.5],
          isBandScale: true,
          minInterval: 1,
        }),
        totalBarsInCluster: 1,
        range: [0, 120],
      });
      const bandPosition = getCursorBandPosition(
        90,
        chartDimensions,
        { x: 0, y: 0 },
        {
          value: 0,
          withinBandwidth: true,
        },
        true,
        barSeriesScaleLimited,
        1,
      );
      expect(bandPosition).toEqual({
        x: 0,
        y: 0,
        height: 15,
        width: 120,
      });
    });
    test('cursor at top end of domain', () => {
      const barSeriesScaleLimited = computeXScale({
        xDomain: MockXDomain.fromScaleType(ScaleType.Linear, {
          domain: [-0.5, 2.5],
          isBandScale: true,
          minInterval: 1,
        }),
        totalBarsInCluster: barSeries.length,
        range: [0, 120],
      });
      const bandPosition = getCursorBandPosition(
        90,
        chartDimensions,
        { x: 0, y: 119 },
        {
          value: 3,
          withinBandwidth: true,
        },
        true,
        barSeriesScaleLimited,
        1,
      );
      expect(bandPosition).toEqual({
        x: 0,
        y: 105,
        height: 15,
        width: 120,
      });
    });
  });
});
