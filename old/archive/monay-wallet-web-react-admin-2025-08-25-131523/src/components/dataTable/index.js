import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import BootstrapTable from 'react-bootstrap-table-next'
import filterFactory from 'react-bootstrap-table2-filter'
import paginationFactory from 'react-bootstrap-table2-paginator'
// import overlayFactory from 'react-bootstrap-table2-overlay'
import ToolkitProvider from 'react-bootstrap-table2-toolkit'
import { GlobalLoader } from '../common'
import textMessages from '../../utilities/messages'
import PropTypes from 'prop-types'

/**
 * Custom Text for showing from-to and all records count
 * @param {*} from
 * @param {*} to
 * @param {*} size
 */
const customTotal = (from, to, size, t) => {
  return size > 0 ? <span className="react-bootstrap-table-pagination-total pl-2">
    {t('common.recordShowing', { from, to, size })}
  </span> : <></>
}

/**
 * indicationNoRecords function
 *
 * This function is used to indicate the no records found
 */
const indicationNoRecords = (message) => (
  <div className='alert alert-danger text-center'>{message || textMessages.noDataFound}</div>
)

/**
 * indicationLoading function
 *
 * This function is used to show during initial set of table
 */
const indicationLoading = () => (<GlobalLoader />)

/**
 * RemoteDataTable function
 *
 * This is the main function which is responsible to render the Data Table
 *
 * @param {obj} props
 *
 * In props we @required
 * @param {array} data
 * @param {array} columns
 * @param {number} totalSize
 * @param {number} sizePerPage
 * @param {boolean} loading
 */
export const MyExportCSV = (props) => {
  const handleClick = () => {
    props.onExport(props.data)
  }
  return (
    <div className='export-csv-button'>
      <button className='btn btn-success' onClick={handleClick}>{props.t('common.exportToCsv')}</button>
    </div>
  )
}

const RemoteDataTable = ({
  data,
  noDataMessage,
  page,
  sizePerPage,
  onTableChange,
  totalSize,
  columns,
  excelColumns,
  fileName,
  selectRow,
  defaultSorted,
  loading,
  handleSelectedRows
}) => {
  const [selected, setSelected] = useState([])
  const { t } = useTranslation()

  /**
   * Reset the selected on data change
   */
  useEffect(() => {
    setSelected([])
  }, [data])

  /**
   * To set the value on the particular select/deselect checkbox
   */
  const handleOnSelect = (row, isSelect) => {
    let selectedNew = [...selected]

    if (isSelect) {
      selectedNew = [...selectedNew, row.id]
    } else {
      selectedNew = selectedNew.filter(x => x !== row.id)
    }

    setSelected([...selectedNew])
    handleSelectedRows([...selectedNew])
  }

  /**
   * To set the value on the select/deselect all checkbox
   */
  const handleOnSelectAll = (isSelect, rows) => {
    let selectedNew = [...selected]

    const ids = rows.map(r => r.id)
    if (isSelect) {
      selectedNew = ids
    } else {
      selectedNew = []
    }

    setSelected([...selectedNew])
    handleSelectedRows([...selectedNew])
  }

  if (data.length > 0) {
    setTimeout(() => {
      window.horizontalScroll()
    }, 1000 / 2)
  }

  if (selectRow) {
    selectRow = {
      mode: 'checkbox',
      clickToSelect: false,
      selected: selected,
      onSelect: handleOnSelect,
      onSelectAll: handleOnSelectAll,
      selectionHeaderRenderer: ({ mode, indeterminate, ...rest }) => { // eslint-disable-line
        return <div className="form-check custom-checkbox d-inline-block mt-0 mr-0">
          <input className="form-check-input custom-control-input ml-0 mt-0"
            type={mode}
            ref={(input) => {
              if (input) input.indeterminate = indeterminate
            }}
            {...rest}
          />
          <label className="form-check-label custom-control-label">
            <span className="checkbox-icon"></span>
          </label>
        </div>
      },
      selectionRenderer: ({ mode, ...rest }) => { // eslint-disable-line
        return <div className="form-check custom-checkbox d-inline-block mt-0 mr-0">
          <input className="form-check-input custom-control-input ml-0 mt-0"
            type={mode}
            {...rest}
          />
          <label className="form-check-label custom-control-label">
            <span className="checkbox-icon"></span>
          </label>
        </div>
      }
    }
  }

  return <div className='common-table'>
    <div className='table-responsive'>
      <ToolkitProvider
        keyField='id'
        data={data}
        columns={excelColumns || []}
        exportCSV={{
          fileName: fileName,
          separator: ',',
          ignoreHeader: false,
          noAutoBOM: false,
        }}
      >
        {
          props => (
            <>
              {
                (fileName) && <MyExportCSV {...props.csvProps} t={t} />
              }
              <BootstrapTable
                {...props.baseProps}
                remote
                bootstrap4
                loading={loading}
                keyField='id'
                data={data}
                columns={columns}
                defaultSorted={defaultSorted}
                filter={filterFactory()}
                pagination={paginationFactory({
                  page,
                  sizePerPage,
                  totalSize,
                  hideSizePerPage: totalSize < 1,
                  paginationTotalRenderer: (from, to, size) => customTotal(from, to, size, t),
                  showTotal: true,
                  disablePageTitle: true,
                  sizePerPageList: [{
                    text: '10', value: 10
                  },
                  {
                    text: '25', value: 25
                  },
                  {
                    text: '50', value: 50
                  },
                  {
                    text: '100', value: 100
                  },
                  {
                    text: 'All', value: totalSize
                  }]
                })}
                selectRow={selectRow}
                onTableChange={onTableChange}
                bordered={false}
                noDataIndication={loading ? indicationLoading : indicationNoRecords(noDataMessage)}
                wrapperClasses='table-responsive common_table'
                // overlay={overlayFactory({ background: 'rgba(255,255,255,1)', zIndex: 0 })}
                tabIndexCell
              />
            </>
          )
        }
      </ToolkitProvider>
    </div>
  </div>
}

MyExportCSV.propTypes = {
  onExport: PropTypes.func.isRequired
}

RemoteDataTable.propTypes = {
  data: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  sizePerPage: PropTypes.number.isRequired,
  onTableChange: PropTypes.func.isRequired,
  totalSize: PropTypes.number.isRequired,
  columns: PropTypes.array.isRequired,
  defaultSorted: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  noDataMessage: PropTypes.string,
  excelColumns: PropTypes.array,
  fileName: PropTypes.string,
  selectRow: PropTypes.bool,
  csvProps: PropTypes.any,
  baseProps: PropTypes.any,
  handleSelectedRows: PropTypes.any
}

export default RemoteDataTable
