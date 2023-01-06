import React from 'react';
import { FormattedMessage } from 'react-intl';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class ReactBootstrapTable extends React.Component {
  render() {
    const optionsDefault = {
      className: '',
      data: [],
      columns: [],
      showPageJump: false,
      sortable: false,
      defaultPageSize: 10,
      pageSizeOptions: [10, 25, 30, 50],
      noDataText: (
        <div>
          <span>
            <FormattedMessage id="app.orderbook.loadingorders" />{' '}
          </span>
          <i className="fa fa-spinner fa-spin" />
        </div>
      ),
      previousText: <i className="fa fa-chevron-left" />,
      nextText: <i className="fa fa-chevron-right" />,
      loadingText: 'Loading...',
      pageText: <FormattedMessage id="app.global.page" />,
      ofText: '/',
      rowsText: '',
      getTrProps: (state, rowInfo, column) => {
        if (rowInfo) {
          return {
            style: {
              backgroundColor: rowInfo.row._original.isUserOrderBook
                ? '#dcfbdc'
                : 'white'
            }
          };
        } else {
          return {
            style: {
              background: 'white'
            }
          };
        }
      }
    };

    const option = {
      ...optionsDefault,
      ...this.props
    };

    return <ReactTable {...option} />;
  }
}

export default ReactBootstrapTable;
