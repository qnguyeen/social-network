import { Table, Popconfirm, Tooltip, Button, Tag } from "antd";
import { EditOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import moment from "moment";

export default function FundraisingTable({
  columns,
  data,
  loading,
  handleTableChange,
  isUpdateModalOpen,
  handleCloseUpdateModal,
  selectedUserId,
  handleCloseCampaign,
}) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Handle searching functionality
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText("");
    confirm();
  };

  // Get column search props
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
          className="w-full p-2 border rounded"
        />
        <div className="flex justify-between">
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            className="bg-blue-500 text-white"
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm)}
            size="small"
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // Enhanced columns with search and sort functionality
  const enhancedColumns = columns.map((col) => {
    // Add search capabilities to title and description
    if (col.dataIndex === "title" || col.dataIndex === "description") {
      return {
        ...col,
        ...getColumnSearchProps(col.dataIndex),
      };
    }

    // Add sorting to amount columns and created date
    if (
      ["current_amount", "target_amount", "created_date"].includes(
        col.dataIndex
      )
    ) {
      return {
        ...col,
        sorter: (a, b) => {
          if (col.dataIndex === "created_date") {
            return (
              moment(a[col.dataIndex]).unix() - moment(b[col.dataIndex]).unix()
            );
          }
          return a[col.dataIndex] - b[col.dataIndex];
        },
        sortDirections: ["descend", "ascend"],
      };
    }

    // Special rendering for time slots
    if (col.dataIndex === "time_slots") {
      return {
        ...col,
        render: (slots) => (
          <div className="flex flex-wrap gap-1">
            {slots && slots.length > 0 ? (
              slots.map((slot, index) => (
                <Tag key={index} color="blue">
                  {slot}
                </Tag>
              ))
            ) : (
              <span className="text-gray-400">No time slots</span>
            )}
          </div>
        ),
      };
    }

    return col;
  });

  // Add action column with edit and close buttons
  // enhancedColumns.push({
  //   title: "Actions",
  //   key: "actions",
  //   render: (_, record) => (
  //     <div className="flex space-x-2">
  //       <Tooltip title="Edit Campaign">
  //         <Button
  //           type="primary"
  //           shape="circle"
  //           icon={<EditOutlined />}
  //           className="bg-blue-500"
  //         />
  //       </Tooltip>
  //       {(record.status === "active" || record.status === "UNFINISHED") && (
  //         <Popconfirm
  //           title="Are you sure you want to close this campaign?"
  //           onConfirm={() => handleCloseCampaign(record.id)}
  //           okText="Yes"
  //           cancelText="No"
  //         >
  //           <Tooltip title="Close Campaign">
  //             <Button danger shape="circle" icon={<CloseOutlined />} />
  //           </Tooltip>
  //         </Popconfirm>
  //       )}
  //     </div>
  //   ),
  // });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table
          bordered
          className="custom-table"
          columns={enhancedColumns}
          dataSource={data}
          loading={loading}
          onChange={handleTableChange}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </div>
    </div>
  );
}
