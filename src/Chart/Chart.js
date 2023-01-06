import React from 'react';
import PropTypes from 'prop-types';

import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

import { ChartCanvas, Chart, ZoomButtons } from 'react-stockcharts';
import { BarSeries, CandlestickSeries } from 'react-stockcharts/lib/series';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { HoverTooltip } from 'react-stockcharts/lib/tooltip';
import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
} from 'react-stockcharts/lib/coordinates';

import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { last } from 'react-stockcharts/lib/utils';
import { CHECK_IS_MOBILE } from '../Helpers/constants/system';

const dateFormat = timeFormat('%m/%d/%Y %H:%M:%S');
const numberFormat = format(',.2f');

function tooltipContent() {
  return ({ currentItem, xAccessor }) => {
    return {
      x: dateFormat(xAccessor(currentItem)),
      y: [
        {
          label: 'open',
          value: currentItem.open && numberFormat(currentItem.open),
        },
        {
          label: 'high',
          value: currentItem.high && numberFormat(currentItem.high),
        },
        {
          label: 'low',
          value: currentItem.low && numberFormat(currentItem.low),
        },
        {
          label: 'close',
          value: currentItem.close && numberFormat(currentItem.close),
        },
      ].filter(line => line.value),
    };
  };
}
class CandleStickStockScaleChartWithVolumeBarV3 extends React.Component {
  constructor(props) {
    super(props);
    this.saveNode = this.saveNode.bind(this);
    this.resetYDomain = this.resetYDomain.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }
  componentWillMount() {
    this.setState({
      suffix: 1,
    });
  }
  saveNode(node) {
    this.node = node;
  }
  resetYDomain() {
    this.node.resetYDomain();
  }
  handleReset() {
    this.setState({
      suffix: this.state.suffix + 1,
    });
  }
  render() {
    const {
      type,
      data: initialData,
      width,
      ratio,
      mouseMoveEvent,
      panEvent,
      zoomEvent,
      zoomAnchor,
      clamp,
    } = this.props;

    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      d => d.date,
    );
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      initialData,
    );

    const start = xAccessor(last(data));
    const end = xAccessor(
      data[Math.max(0, CHECK_IS_MOBILE() ? data.length - 30 : data.length - 80)],
    );
    const xExtents = [start, end];

    const candlesAppearance = {
      wickStroke: '#000000',
      fill: function fill(d) {
        return d.close > d.open
          ? 'rgba(38, 194, 129, 1)'
          : 'rgba(225, 35, 48, 1)';
      },
      stroke: '#000000',
      candleStrokeWidth: 1,
      widthRatio: 0.8,
      opacity: 1,
    };

    let chartHeight = 500;
    if (CHECK_IS_MOBILE()) {
      chartHeight = 320;
    }

    let candleChartHeight = !CHECK_IS_MOBILE()
      ? chartHeight - 205
      : chartHeight - 120;
    let volumeChartHeight = chartHeight - candleChartHeight;

    let margin = { left: 50, right: 50, top: 10, bottom: 30 };
    if (CHECK_IS_MOBILE()) {
      margin = { left: 20, right: 20, top: 10, bottom: 20 };
    }
    let gridHeight = chartHeight - margin.top - margin.bottom;
    let gridWidth = width - margin.left - margin.right;

    let showGrid = true;
    let yGrid = showGrid
      ? {
          innerTickSize: -1 * gridWidth,
          tickStrokeDasharray: 'Solid',
          tickStrokeOpacity: 0.2,
          tickStrokeWidth: 1,
        }
      : {};
    let xGrid = showGrid
      ? {
          innerTickSize: -1 * gridHeight,
          tickStrokeDasharray: 'Solid',
          tickStrokeOpacity: 0.2,
          tickStrokeWidth: 1,
        }
      : {};

    return (
      <ChartCanvas
        height={chartHeight}
        ratio={ratio}
        width={width}
        margin={margin}
        type={type}
        seriesName={`MSFT_${this.state.suffix}`}
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
        mouseMoveEvent={mouseMoveEvent}
        panEvent={panEvent}
        zoomEvent={zoomEvent}
        clamp={clamp}
        zoomAnchor={zoomAnchor}
      >
        <Chart
          id={1}
          height={candleChartHeight}
          yExtents={d => [d.high, d.low]}
        >
          <YAxis
            axisAt="right"
            orient="right"
            ticks={5}
            tickFormat={format('.2s')}
            yZoomWidth={CHECK_IS_MOBILE() ? 30 : 40}
            fontSize={CHECK_IS_MOBILE() ? 8 : 12}
            {...yGrid}
          />
          {!CHECK_IS_MOBILE() && (
            <XAxis axisAt="bottom" orient="bottom" {...xGrid} />
          )}

          <MouseCoordinateY
            at="right"
            orient="right"
            rectWidth={CHECK_IS_MOBILE() ? 50 : 110}
            rectHeight={20}
            fontSize={CHECK_IS_MOBILE() ? 11 : 12}
            dx={-55}
            displayFormat={format(',.1f')}
          />
          <CandlestickSeries {...candlesAppearance} />
          {!CHECK_IS_MOBILE() ? (
            <HoverTooltip
              tooltipContent={tooltipContent()}
              fontSize={15}
              fontFamily="Open Sans, sans-serif"
            />
          ) : (
            ''
          )}
          <ZoomButtons onReset={this.handleReset} />
        </Chart>
        <Chart
          id={2}
          origin={(w, h) => [0, h - volumeChartHeight]}
          height={volumeChartHeight}
          yExtents={d => d.volume}
        >
          {!CHECK_IS_MOBILE() && (
            <YAxis
              axisAt="left"
              orient="left"
              ticks={5}
              tickFormat={format('.2s')}
            />
          )}
          {!CHECK_IS_MOBILE() &&
            ((
              <MouseCoordinateX
                at="bottom"
                orient="bottom"
                rectWidth={150}
                displayFormat={timeFormat('%m/%d/%Y %H:%M:%S')}
                // displayFormat={moment(uctTime).format()}
              />
            ),
            (
              <MouseCoordinateY
                at="left"
                orient="left"
                displayFormat={format('.4s')}
              />
            ))}

          <BarSeries
            yAccessor={d => d.volume}
            fill={d =>
              d.close > d.open
                ? 'rgba(38, 194, 129, 0.8)'
                : 'rgba(225, 35, 48, 0.8)'}
          />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    );
  }
}
CandleStickStockScaleChartWithVolumeBarV3.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['svg', 'hybrid']).isRequired,
};

CandleStickStockScaleChartWithVolumeBarV3.defaultProps = {
  type: 'svg',
};
CandleStickStockScaleChartWithVolumeBarV3 = fitWidth(
  CandleStickStockScaleChartWithVolumeBarV3,
);

export default CandleStickStockScaleChartWithVolumeBarV3;
