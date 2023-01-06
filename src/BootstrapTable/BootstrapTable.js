import React from 'react';
import { injectIntl } from 'react-intl';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import accounting from 'accounting';


class BootstrapTableClass extends React.Component {
  priceFormatter = (cell, row) => {
    let p = Number(cell);
    let fixedNumber = p - Math.floor(cell) > 0 ? 4 : 0;
    return accounting.formatMoney(p, '', fixedNumber, ',', '.');
  }

  renderColumn = () => {
    const { columns, type } = this.props;
    return columns.map((item, i) => {
      let dataFormat = item.dataFormat;
      if (item.dataFormat && typeof item.dataFormat == 'string') {
        dataFormat = this[item.dataFormat];
      }

      return (
        <TableHeaderColumn
          {...item}
          dataFormat={dataFormat}
          key={i}
        >
          {item.label}
        </TableHeaderColumn>
      );
    });
  }

  render() {
    const { data, options, intl } = this.props;

    const defaultOption = {
      clearSearch: true,
      searchPosition: 'right',
      sizePerPage: 50,
    }
    return (
      <BootstrapTable
        data={data}
        hover
        condensed
        bordered={false}
        options={{ ...defaultOption, ...options }}
        pagination
        search
        searchPlaceholder={intl.formatHTMLMessage({
          id: 'app.global.search',
        })}
        headerStyle={{ textAlign: 'center' }}
      >
        {this.renderColumn()}
      </BootstrapTable>
    );
  }
}

export default injectIntl(BootstrapTableClass);