import { Col, DatePicker, Input, Row, Select, Empty } from "antd";
import Button from "components/Button";
import PaginationComponent from "components/PaginationComponent";
import ScreenWrapper from "components/ScreenWrapper";
import { ROUTER, STRING } from "constants/Constant";
import React, { useState, useEffect, useRef } from "react";
import { Table } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { notifyFail, notifySuccess } from "utils/notify";
import { orderList, deleteOrder, supplierFullList } from "network/OrderApi";
import Moment from "moment";
import ConfirmModal from "components/ConfirmModal";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
const { RangePicker } = DatePicker;

const { Option } = Select;
// { title: `${STRING.numericalOrder}/数值顺序` },
const headerTable = [
  { title: STRING.numericalOrder, chinese: "数值顺序" },
  { title: STRING.orderCode, chinese: "代码顺序" },
  { title: STRING.createdDate, chinese: "创建日期" },
  { title: STRING.supplier, chinese: "供应商" },
  { title: STRING.construction, chinese: "建造" },
  { title: STRING.contractCode, chinese: "合约编号" },
  { title: STRING.status, chinese: "状态" },
  { title: STRING.dueDate, chinese: "完成期限" },
  // { title: "Tổng tiền (VNĐ)" },
  { title: STRING.creator, chinese: "创作者" },
  { title: STRING.updatePerson, chinese: "更新的人" },
  { title: "checkbox", chinese: "" },
];

const orderStatus = [
  { value: 1, label: `${STRING.ordered}/已订购` },
  { value: 2, label: `${STRING.transporting}/正在运输` },
  { value: 3, label: `${STRING.returnedToPort}/到达港口` },
  { value: 4, label: `${STRING.complete}/结束` },
];

const recordsPerPage = 20;

function OrderListScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [checkItemList, setCheckItemList] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [searchedName, setSearchedName] = useState("");
  const [paging, setPaging] = useState({
    totalItem: 0,
    totalPage: 0,
  });
  const inputRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const [supplierId, setSupplierId] = useState(undefined);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [supplierData, setSupplierData] = useState([]);
  const [searchedStatus, setSearchedStatus] = useState();

  const history = useHistory();

  // useEffect(() => {
  //   getOrderList();
  //   getSupplierList();
  // }, []);

  useEffect(() => {
    getOrderList();
  }, [activePage, supplierId, searchedStatus, fromDate, toDate]);

  // useEffect(() => {
  //   getOrderList();
  // }, [supplierId]);

  // useEffect(() => {
  //   getOrderList();
  // }, [searchedStatus]);

  // useEffect(() => {
  //   getOrderList();
  // }, [fromDate, toDate]);

  useEffect(() => inputRef?.current?.focus(), [searchedName]);

  const HeaderButton = () => {
    return (
      <>
        <ReactHTMLTableToExcel
          id="test-table-xls-button"
          className="download-table-xls-button btn-warning btn mr-2"
          table="export__excel"
          filename={`thong-ke-don-hang-订单统计`}
          sheet="tablexls"
          buttonText="Export Excel/出口 Excel"
        ></ReactHTMLTableToExcel>
        <Button
          className="btn btn-primary"
          onClick={() =>
            history.push({
              pathname: ROUTER.CREATE_ORDER,
              state: { isUpdate: false },
            })
          }
        >
          {`${STRING.addNew}/添新`}
        </Button>
      </>
    );
  };

  const FilterField = () => {
    return (
      <Row className="mb-4" gutter={16} justify="space-between">
        <Col span={6}>
          <Input
            placeholder={`${STRING.orderCode}/代码顺序`}
            style={{ width: "100%" }}
            onKeyUp={onKeyUp}
            value={searchedName}
            ref={inputRef}
            onChange={(e) => setSearchedName(e.target.value.toUpperCase())}
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder={`${STRING.supplier}/供应商`}
            style={{ width: "100%" }}
            value={supplierId}
            onChange={(value) => setSupplierId(value)}
            allowClear
            autoClearSearchValue
          >
            {supplierData.length &&
              supplierData.map((item, index) => {
                return (
                  <Option key={index} value={item.value}>
                    {item.label}
                  </Option>
                );
              })}
          </Select>
        </Col>
        <Col span={5}>
          <Select
            placeholder={`${STRING.status}/状态`}
            style={{ width: "100%" }}
            value={searchedStatus}
            onChange={(value) => {
              setSearchedStatus(value);
            }}
            allowClear
            autoClearSearchValue
          >
            {orderStatus.length &&
              orderStatus.map((item, index) => {
                return (
                  <Option key={index} value={item.value}>
                    {item.label}
                  </Option>
                );
              })}
          </Select>
        </Col>
        <Col span={7}>
          <RangePicker
            style={{ width: "100%" }}
            placeholder={[
              `${STRING.fromDate}/自从`,
              `${STRING.toDate}/迄今为止`,
            ]}
            format="DD/MM/YYYY"
            defaultValue={[
              fromDate ? Moment(fromDate, "DD/MM/YYYY") : Moment(),
              toDate ? Moment(toDate, "DD/MM/YYYY") : Moment(),
            ]}
            onChange={(dates, dateStrings) => {
              setFromDate(dateStrings[0]);
              setToDate(dateStrings[1]);
            }}
            allowEmpty={[true, true]}
          />
        </Col>
      </Row>
    );
  };

  const ButtonGroup = () => {
    return (
      <div className="text-right mb-4">
        <Button className="btn btn-success mr-2" onClick={() => getOrderList()}>
          {`${STRING.search}/搜索`}
        </Button>
        <Button
          className="btn btn-secondary mr-2"
          onClick={() => clearSearching()}
        >
          {`${STRING.deleteSearching}/删除搜寻`}
        </Button>
        <Button
          className="btn btn-danger"
          onClick={() => {
            if (countNumberOfElementIsChecked(checkItemList) < 1) {
              notifyFail("Vui lòng chọn ít nhất 1 đơn hàng để xóa!");
              return;
            }
            setConfirmModal(true);
          }}
        >
          {`${STRING.delete}/抹去`}
        </Button>
        {/* <Button
          className="btn btn-warning"
          onClick={() => {
            const counter = countNumberOfElementIsChecked(checkItemList);
            if (counter < 1) {
              notifyFail("Vui lòng chọn 1 đơn hàng để sửa!");
              return;
            }
            if (counter > 1) {
              notifyFail("Chỉ được sửa 1 đơn hàng!");
              return;
            }
            let index = checkItemList.findIndex((item) => item === true);
            let value = orderData[index];
            history.push({
              pathname: `/chi-tiet-don-hang/${value.id}`,
              state: { isUpdate: true },
            });
          }}
        >
          {`${STRING.edit}/修理`}
        </Button> */}
      </div>
    );
  };

  const DataTable = (props) => {
    // khai báo một biến hidden để dùng cho việc ẩn cái bảng cần xuất excel và một số thông tin khác
    const { hidden } = props;
    return (
      <div className="card" style={hidden ? { display: "none" } : {}}>
        <div className="card-body">
          <Table
            striped
            bordered
            hover
            responsive
            className="mb-3"
            id={hidden && "export__excel"}
          >
            <thead>
              <tr>
                {headerTable.map((item, index) => {
                  return item.title === "checkbox" ? (
                    !hidden && (
                      <th key={index} className="text-center align-middle">
                        <input
                          type="checkbox"
                          checked={checkItemList.every(Boolean)}
                          onChange={() => onChangeCheckAllItem()}
                        />
                      </th>
                    )
                  ) : (
                    <th key={index} className="text-center align-middle">
                      {item.title}
                      <br />
                      {item.chinese}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {orderData?.length ? (
                orderData.map((item, index) => {
                  return (
                    <tr
                      key={index}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {index + recordsPerPage * ((activePage || 1) - 1) + 1}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.code || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.createdDate
                          ? Moment(item.createdDate).format("hh:mm DD/MM/YYYY")
                          : "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.providerName || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.contructionName || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.contactCode || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.status === 1
                          ? "Đã đặt hàng"
                          : item.status === 2
                          ? "Đang vận chuyển"
                          : item.status === 3
                          ? "Đã về cảng"
                          : item.status === 4
                          ? "Hoàn thành"
                          : "--"}
                        <br />
                        {item.status === 1
                          ? "(已订购)"
                          : item.status === 2
                          ? "(正在运输)"
                          : item.status === 3
                          ? "(到达港口)"
                          : item.status === 4
                          ? "(结束)"
                          : "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.deadlineDate
                          ? Moment(item.deadlineDate).format("DD/MM/YYYY")
                          : "--"}
                      </td>
                      {/* <td
                        className="text-right align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.totalMoney || "--"}
                      </td> */}
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.createdBy || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() =>
                          history.push({
                            pathname: `/chi-tiet-don-hang/${item.id}`,
                            state: { isUpdate: true },
                          })
                        }
                      >
                        {item.modifiedBy || "--"}
                        <br />(
                        {item.modifiedDate
                          ? Moment(item.modifiedDate).format("hh:mm DD/MM/YYYY")
                          : "--:--"}
                        )
                        {/* {`${item.modifiedBy || "--"} (${
                          item.modifiedDate
                            ? Moment(item.modifiedDate).format(
                                "hh:mm DD/MM/YYYY"
                              )
                            : "--:--"
                        })`} */}
                      </td>
                      {!hidden && (
                        <td className="text-center align-middle">
                          <input
                            type="checkbox"
                            checked={checkItemList[index]}
                            onChange={() => onChangeCheckItem(index)}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr className="text-center">
                  <td className="p-2" colSpan={11}>
                    <Empty description={<span>{STRING.emptyList}</span>} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <PaginationComponent
            activePage={activePage}
            itemCountPerPage={recordsPerPage}
            totalItemsCount={paging.totalItem}
            action={handleChangePage}
          />
        </div>
      </div>
    );
  };

  const getOrderList = async () => {
    try {
      setIsLoading(true);
      const payload = {
        Code: searchedName.trim(),
        ProviderId: supplierId ? supplierId : -1,
        FromDate: fromDate,
        ToDate: toDate,
        Page: activePage,
        Status: searchedStatus ? searchedStatus : -1,
      };
      const res = await orderList(payload);
      setPaging({
        ...paging,
        totalItem: res?.data?.totalItem,
        totalPage: res?.data?.totalPage,
      });
      setOrderData(res?.data?.list);
      let isCheckedItems = Array(res?.data?.list.length).fill(false);
      setCheckItemList(isCheckedItems);
      setIsLoading(false);
    } catch (error) {}
  };

  const getSupplierList = async () => {
    try {
      setIsLoading(true);
      let res = await supplierFullList();
      res.data.forEach((supplier, index) => {
        res.data[index].value = supplier.id;
        res.data[index].label = supplier.name;
      });
      setSupplierData(res.data);
      setIsLoading(false);
    } catch (error) {}
  };

  const onKeyUp = (e) => {
    if (e.keyCode === 13) {
      let text = e.target.value;
      if (!text) {
        return;
      }

      text = text.trim();
      if (!text) {
        return;
      }
      getOrderList();
    }
  };

  const handleChangePage = (page) => {
    setActivePage(page);
  };

  const clearSearching = async () => {
    try {
      setSearchedName("");
      setSupplierId(undefined);
      setFromDate(null);
      setToDate(null);
      setSearchedStatus();
      setIsLoading(true);
      const res = await orderList({
        code: "",
        providerId: -1,
        fromDate: "",
        toDate: "",
        page: 1,
        status: -1,
      });
      setOrderData(res?.data?.list);
      setPaging({
        ...paging,
        totalItem: res?.data?.totalItem,
        totalPage: res?.data?.totalPage,
      });
      let isCheckedItems = Array(res?.data?.list.length).fill(false);
      setCheckItemList(isCheckedItems);
      setIsLoading(false);
    } catch (error) {}
  };

  const countNumberOfElementIsChecked = (arrCheck) => {
    return arrCheck.filter((item) => item).length;
  };

  const onChangeCheckAllItem = () => {
    let checkedAllItems = [...checkItemList];
    checkedAllItems.fill(!checkedAllItems.every(Boolean));
    setCheckItemList(checkedAllItems);
  };

  const onChangeCheckItem = (index) => {
    let checkedItems = [...checkItemList];
    checkedItems[index] = !checkItemList[index];
    setCheckItemList(checkedItems);
  };

  const onDeleteItem = async () => {
    const idItemArr = [];
    checkItemList.forEach((item, index) => {
      if (item) {
        idItemArr.push(orderData[index].id);
      }
    });
    try {
      setIsLoading(true);
      let formData = new FormData();
      formData.append("listId", idItemArr.join());
      // const payload = {
      //   listId: idItemArr.join(),
      // };
      await deleteOrder(formData);
      setConfirmModal(false);
      notifySuccess(STRING.success);
      getOrderList();
    } catch (error) {
      setConfirmModal(false);
      notifyFail(STRING.fail);
      getOrderList();
    }
  };

  return (
    <ScreenWrapper
      titleHeader={`${STRING.order}/命令`}
      isLoading={isLoading}
      isError={isError}
      hasButton={true}
    >
      <HeaderButton />
      <>
        <ConfirmModal
          isOpen={confirmModal}
          onHide={() => setConfirmModal(false)}
          title={`${STRING.delete}/抹去 ${countNumberOfElementIsChecked(
            checkItemList
          )} đơn hàng/命令`}
          action={() => onDeleteItem()}
        />
        <FilterField />
        <ButtonGroup />
        <DataTable hidden={false} />
        <DataTable hidden={true} />
      </>
    </ScreenWrapper>
  );
}

OrderListScreen.propTypes = {};

export default OrderListScreen;
