import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Modal, Button } from 'react-bootstrap';

const GenericList = ({ 
  data, 
  columns, 
  onRowClick, 
  emptyComponent: EmptyComponent, 
  headerActions,
  getSubRows = row => row.subRows,
}) => {
  const [expanded, setExpanded] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSubRows,
    state: {
      expanded,
      columnVisibility,
      sorting,
    },
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });

  if (!data || data.length === 0) {
    return EmptyComponent ? <EmptyComponent /> : null;
  }

  return (
    <div className='card kanban'>
      <div className='card-body' style={{ padding: "1rem 1rem" }}>
        <div className="table-responsive">
          <table className='table table-row-dashed table-row-gray-300 gy-3'>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className='fw-bold fs-6 text-gray-800'>
                  <th key={'expand' + headerGroup.id} className="max-w-50px min-w-25px">
                  </th>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <><i className="bi bi-filter-circle-fill fs-6 me-1 ms-2 text-primary"></i><i className="bi bi-arrow-up"></i></>,
                              desc: <><i className="bi bi-filter-circle-fill fs-6 me-1 ms-2 text-primary"></i><i className="bi bi-arrow-down"></i></>,
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                    </th>
                  ))}
                  <th key={'actions'} className="max-w-50px min-w-25px">
                    <div className="m-0">
                      <a
                        href="#"
                        className="btn btn-sm btn-flex bg-body btn-color-gray-700 btn-active-color-primary fw-bold"
                        onClick={handleShowModal}
                      >
                        <i className="bi bi-plus fs-6 text-muted me-1"></i>
                      </a>
                      {headerActions}
                      <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                          <Modal.Title>Columns</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <div className="w-250px w-md-300px">
                            <div className="separator border-gray-200"></div>
                            <div className="px-7 py-5">
                              <div className="mb-10">
                                <div className="mb-10 form-check">
                                  <label className="form-check-label fw-semibold mb-3">
                                    <input
                                      type="checkbox"
                                      checked={table.getIsAllColumnsVisible()}
                                      onChange={table.getToggleAllColumnsVisibilityHandler()}
                                      className="form-check-input"
                                    />
                                    Toggle All
                                  </label>
                                </div>
                                {table.getAllLeafColumns().map(column => (
                                  <div key={column.id} className="px-1 form-check mb-3">
                                    <label className='form-check-label'>
                                      <input
                                        type="checkbox"
                                        checked={column.getIsVisible()}
                                        onChange={column.getToggleVisibilityHandler()}
                                        className="form-check-input"
                                      />
                                      {column.id}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </div>
                  </th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  <td>
                    {row.getCanExpand() ? (
                      <button
                        className='btn btn-icon btn-light btn-active-light-primary toggle h-25px w-25px me-1'
                        onClick={row.getToggleExpandedHandler()}
                      >
                        {row.getIsExpanded() ? 
                          <span className="bi bi-dash fs-3 m-0"></span> : 
                          <span className="bi bi-plus fs-3 m-0"></span>}
                      </button>
                    ) : ''}
                  </td>
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      onClick={() => onRowClick && onRowClick(row, cell)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GenericList;
