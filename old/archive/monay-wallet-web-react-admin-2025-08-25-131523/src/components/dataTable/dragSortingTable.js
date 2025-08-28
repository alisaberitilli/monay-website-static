import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Table } from 'antd'
import { DndProvider, useDrag, useDrop, createDndContext } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import update from 'immutability-helper'
import { GlobalLoader } from '../common'
import logger from '../../utilities/logger'

const RNDContext = createDndContext(HTML5Backend)

const type = 'DragableBodyRow'

const DragableBodyRow = ({ index, moveRow, className, style, ...restProps }) => {
  const ref = React.useRef()
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { index: dragIndex } = monitor.getItem() || {}
      if (dragIndex === index) {
        return {}
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward'
      }
    },
    drop: item => {
      moveRow(item.index, index)
    }
  })
  const [, drag] = useDrag({
    item: { type, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  })
  drop(drag(ref))
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  )
}

const DragSortingTable = ({ data: tableData, columns, pagination, loading, handleTableChange, noDataMessage, handleDragOrderChange }) => {
  const [data, setData] = useState(tableData)

  useEffect(() => {
    setData(tableData)
  }, [tableData]) // eslint-disable-line react-hooks/exhaustive-deps

  const components = {
    body: {
      row: DragableBodyRow
    }
  }

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      if (dragIndex !== hoverIndex) {
        const dragRow = data[dragIndex]

        handleDragOrderChange(data[dragIndex].listOrder, data[hoverIndex].listOrder)

        dragRow.listOrder = data[hoverIndex].listOrder

        if (Number(hoverIndex) > Number(dragIndex)) {
          for (let index = Number(dragIndex) + 1; index <= Number(hoverIndex); index++) {
            data[index].listOrder = data[index].listOrder - 1
          }
        } else if (Number(hoverIndex) < Number(dragIndex)) {
          for (let index = Number(dragIndex) - 1; index >= Number(hoverIndex); index--) {
            data[index].listOrder = data[index].listOrder + 1
          }
        }

        const updatedData = update(data, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow]
          ]
        })
        setData(updatedData)
        logger({ dragIndex: dragIndex, hoverIndex: hoverIndex, updatedData, datadragIndex: data[dragIndex].listOrder, datahoverIndex: data[hoverIndex].listOrder })
      }
    },
    [data]
  )

  const manager = useRef(RNDContext)

  return (
    <DndProvider manager={manager.current.dragDropManager}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        // rowKey={obj => obj.id}
        locale={{
          emptyText: (<div style={{ textAlign: 'center' }}>
            {!loading && <div className='alert alert-danger text-center'>{noDataMessage}</div>}
          </div>)
        }}
        components={components}
        onRow={(record, index) => ({
          index,
          moveRow
        })}
        pagination={pagination}
        loading={{
          spinning: loading,
          indicator: <GlobalLoader />
        }}
        onChange={handleTableChange}
      />
    </DndProvider>
  )
}

export default DragSortingTable
