import {
  PlusCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Col,
  Divider,
  Input,
  Row,
  Select,
  Upload,
  Button as ButtonAntd,
  Checkbox,
  DatePicker,
  Empty,
} from "antd";
import {
  createUser,
  updateUser,
  deleteUser,
  userList,
  userDetail,
  resetPassword,
} from "network/AccountApi";
import Button from "components/Button";
import ScreenWrapper from "components/ScreenWrapper";
import { ROUTER, STRING } from "constants/Constant";
import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Table } from "react-bootstrap";
import { notifyFail, notifySuccess } from "utils/notify";
import Moment from "moment";
import { createSupplier } from "network/SupplierApi";
import InputField from "components/InputField";
import ConfirmModal from "components/ConfirmModal";
import RadioField from "components/RadioField";
import {
  orderDetail,
  getMoneyUnit,
  supplierFullList,
  deleteOrder,
} from "network/OrderApi";
import SelectField from "components/SelectField";

const headerTable = [
  { title: STRING.numericalOrder, chinese: "数值顺序" },
  { title: STRING.paymentClause, chinese: "付款" },
  { title: `% ${STRING.payment}`, chinese: "付款号码" },
  { title: STRING.paymentDate, chinese: "付款日期" },
];

const formatNumber = (n) => {
  if (!n) return;
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

function OrderDetailScreen(props) {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [listFileUpload, setListFileUpload] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isModalAddSupplierVisible, setIsModalAddSupplierVisible] = useState(
    false
  );
  const [isModalEditPaymentMethod, setIsModalEditPaymentMethod] = useState(
    false
  );
  const [paymentMethod, setPaymentMethod] = useState({
    paymentClause: undefined,
    paymentPercent: "",
    createdDate: "",
  });
  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [supplierData, setSupplierData] = useState([]);

  const [orderObject, setOrderObject] = useState({
    status: undefined,
    supplierId: undefined,
    constructionName: "",
    taxMoney: "",
    moneyUnit: undefined,
    dueWarranty: "",
    finePerDay: "",
    contractCode: "",
    dueDate: "",
    isImport: false,
    productType: "",
    constructionType: "",
    purchaseContent: "",
    orderCode: "",
  });

  const [supplierName, setSupplierName] = useState("");

  const history = useHistory();

  useEffect(() => {
    // getSupplierList();
    // getMoneyType();
    // if (state.isUpdate) {
    getOrderDetail(id);
    // }
  }, []);

  const HeaderButton = () => {
    return (
      <>
        <Button
          className="btn btn-danger mr-2"
          onClick={() => {
            setConfirmModal(true);
          }}
        >
          Xóa/抹去
        </Button>
        <Button
          className="btn btn-primary"
          onClick={() =>
            history.push({
              pathname: `/sua-don-hang/${id}`,
              state: { isUpdate: true },
            })
          }
        >
          Chỉnh sửa/编辑
        </Button>
      </>
    );
  };

  const PaymentMethodTable = () => {
    return (
      <Table striped bordered hover className="mb-3">
        <thead>
          <tr>
            {headerTable.map((item, index) => {
              return (
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
          {paymentMethodList.length ? (
            paymentMethodList.map((item, index) => {
              return (
                <tr key={index}>
                  <td className="text-center align-middle">{index + 1}</td>
                  <td className="text-center align-middle">
                    {item.paymentClause == 1
                      ? "Khoản tạm ứng/預付款"
                      : item.paymentClause == 2
                      ? "Khoản trước giao hàng/出貨前"
                      : item.paymentClause == 3
                      ? "Khoản sau giao hàng/出貨后"
                      : "--"}
                  </td>
                  <td className="text-center align-middle">
                    {`${item.paymentPercent} %`}
                  </td>
                  <td className="text-center align-middle">
                    {item.createdDate}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="text-center">
              <td className="p-2" colSpan={5}>
                <Empty description={<span>{STRING.emptyList}</span>} />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  };

  const getOrderDetail = async (orderId) => {
    try {
      setIsLoading(true);
      const res = await orderDetail({ Id: orderId });
      const baseUrl = "http://qldh.winds.vn:6886";
      const fileArr = res.data.path.split(",");

      let newListFileList =
        fileArr.length && fileArr[0]
          ? fileArr?.map((file, index) => ({
              uid: index,
              name: file.split("/")[file.split("/").length - 1],
              status: "done",
              url: `${baseUrl}${file}`,
              path: file,
            }))
          : [];

      setListFileUpload(newListFileList);

      setOrderObject({
        ...orderObject,
        supplierId: res.data.providerID,
        constructionName: res.data.contructionName,
        taxMoney: res.data.amountBeforeTax,
        moneyUnit: res.data.moneyTypeID,
        dueWarranty: res.data.warrantyPeriod,
        finePerDay: res.data.outOfDate,
        contractCode: res.data.contactCode,
        dueDate: Moment(res.data.deadlineDate).format("DD/MM/YYYY"),
        isImport: res.data.isImport == 1 ? true : false,
        productType: res.data.productType,
        constructionType: res.data.contructionType,
        purchaseContent: res.data.description,
        status: res.data.status,

        orderCode: res.data.code,
      });

      let supplierRes = await supplierFullList();
      console.log(res.data.providerID, supplierRes.data, "supplierRes");
      const name = supplierRes.data.filter(
        (ducanh) => ducanh.id === res.data.providerID
      );
      console.log(name[0].name, "ÁDasjbkfehbjefhbedfqujh");
      setSupplierName(name[0].name);

      let newArr = [...res.data.orderPaymentDetails];

      // for (let index = 0; index <= newArr.length; index++) {
      //   if (newArr[index].percent === null) {
      //     newArr.splice(index, 1);
      //   }
      // }
      // newArr.forEach((item, index) => {
      //   if (item.percent == null) {
      //     newArr.splice(index, 1)
      //   }
      // })

      if (newArr.length) {
        newArr.forEach((item, index) => {
          newArr[index].paymentClause = item.paymentType;
          newArr[index].paymentPercent = item.percent;
          newArr[index].createdDate = Moment(item.paymentDate).format(
            "DD/MM/YYYY"
          );

          delete item.paymentType;
          delete item.percent;
          delete item.paymentDate;
        });
      }

      setPaymentMethodList(newArr);

      // arr = [
      //   {paymentClause: 1, paymentPercent: 12, createdDate: "20/12/2021"},
      //   {paymentClause: 2, paymentPercent: 40, createdDate: "20/12/2021"},
      //   {paymentClause: 3, paymentPercent: 42, createdDate: "20/12/2021"}
      // ]

      setIsLoading(false);
    } catch (error) {
      notifyFail(STRING.fail);
    }
  };
  const [checkItemList, setCheckItemList] = useState([]);
  const [userData, setUserData] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);

  const onDeleteItem = async () => {
    try {
      // setIsLoading(true);
      let formData = new FormData();
      formData.append("listId", id.toString());
      // console.log(formData);
      await deleteOrder(formData);
      setConfirmModal(false);
      notifySuccess(STRING.success);
      history.push("/don-hang");
    } catch (error) {
      // setConfirmModal(false);
      // notifyFail(STRING.fail);
      // getUserList();
    }
  };

  console.log();

  return (
    <ScreenWrapper
      titleHeader="Chi tiết đơn hàng/订单详细信息"
      isLoading={isLoading}
      isError={isError}
      hasButton={true}
      detail={true}
      context={props}
    >
      <HeaderButton />
      <div className="card">
        <div className="card-body">
          <Divider orientation="left">
            <h5>{STRING.orderInfo}/信息专线</h5>
          </Divider>
          <Row gutter={[24, 16]}>
            <Col className="gutter-row" span={12}>
              {/* ------------------Mã đơn hàng--------------------- */}

              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.orderCode}</span>
                    <br />
                    <span>代码顺序</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <label>{orderObject.orderCode || "--"}</label>
                  </Col>
                </Row>
              </div>
              {/* ------------------Nhà cung cấp--------------------- */}
              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.supplier}</span>
                    <br />
                    <span>供应商</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <label>{supplierName}</label>
                  </Col>
                </Row>
              </div>
              {/* ------------------Tên công trình--------------------- */}
              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.constructionName}</span>
                    <br />
                    <span>工程名称</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <label>{orderObject.constructionName}</label>
                  </Col>
                </Row>
              </div>
              {/* ------------------Số tiền trước thuế--------------------- */}
              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.taxMoney}</span>
                    <br />
                    <span>税前金额</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <div className="d-flex justify-content-between">
                      <label>{formatNumber(orderObject.taxMoney)} VNĐ</label>
                    </div>
                  </Col>
                </Row>
              </div>
              {/* ------------------Thời hạn bảo hành--------------------- */}
              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.warrantyPeriod}</span>
                    <br />
                    <span>保修期</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <div className="d-flex justify-content-between">
                      <label>{`${orderObject.dueWarranty} Năm `}</label>
                    </div>
                  </Col>
                </Row>
              </div>
              {/* ------------------Quá hạn phạt mỗi ngày--------------------- */}
              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.percentFinePerDay}</span>
                    <br />
                    <span>每天逾期罚款</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <div className="d-flex justify-content-between">
                      <label>{`${orderObject.finePerDay}%`}</label>
                    </div>
                  </Col>
                </Row>
              </div>
              {/* ------------------Tài liệu--------------------- */}
              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.document}</span>
                    <br />
                    <span>文档</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    {/* <Upload
                      {...props}
                      onChange={handleMultiFile}
                      fileList={listFileUpload}
                    >
                      <ButtonAntd icon={<UploadOutlined />}>
                        Đăng file/发布文件
                      </ButtonAntd>
                    </Upload> */}
                    <label>{orderObject.document}</label>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col className="gutter-row" span={12}>
              {/* ------------------Trạng thái đơn hàng--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.status}</span>
                    <br />
                    <span>订单状态</span>
                  </Col>
                  <Col span={16}>
                    <label>
                      {orderObject.status === 1
                        ? "Đã đặt hàng"
                        : orderObject.status === 2
                        ? "Đang vận chuyển"
                        : orderObject.status === 3
                        ? "Đã về cảng"
                        : orderObject.status === 4
                        ? "Hoàn thành"
                        : ""}
                    </label>
                  </Col>
                </Row>
              </div>
              {/* ------------------Mã hợp đồng--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.contractCode}</span>
                    <br />
                    <span>合同编号</span>
                  </Col>
                  <Col span={16}>
                    <label>{orderObject.contractCode}</label>
                  </Col>
                </Row>
              </div>
              {/* ------------------Thời hạn hoàn công--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.dueDate}</span>
                    <br />
                    <span>完成期限</span>
                  </Col>
                  <Col span={16}>
                    <label>{orderObject.dueDate}</label>
                  </Col>
                </Row>
              </div>
              {/* ------------------Nhập khẩu--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.import}</span>
                    <br />
                    <span>进口</span>
                  </Col>
                  <Col span={16}>
                    <Checkbox checked={orderObject.isImport} disabled />
                  </Col>
                </Row>
              </div>
              {/* ------------------Loại sản phẩm--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.productType}</span>
                    <br />
                    <span>產品類別</span>
                  </Col>
                  <Col span={16}>
                    <label>{orderObject.productType}</label>
                  </Col>
                </Row>
              </div>
              {/* ------------------Loại công trình--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.constructType}</span>
                    <br />
                    <span>工程類別</span>
                  </Col>
                  <Col span={16}>
                    <label>{orderObject.constructionType}</label>
                  </Col>
                </Row>
              </div>
              {/* ------------------Nội dung mua hàng--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.purchaseContent}</span>
                    <br />
                    <span>购买内容</span>
                  </Col>
                  <Col span={16}>
                    <label>{orderObject.purchaseContent}</label>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          {/* --------------------------Phương thức thanh toán----------------------------------- */}
          {/* <div className="mt-2 mb-4">
            
          </div> */}
          <ConfirmModal
            isOpen={confirmModal}
            onHide={() => setConfirmModal(false)}
            title={`${STRING.delete}/抹去 
              đơn hàng/命令 ${orderObject.orderCode}`}
            action={() => onDeleteItem()}
          />
          <PaymentMethodTable />
        </div>
      </div>
    </ScreenWrapper>
  );
}

OrderDetailScreen.propTypes = {};

export default OrderDetailScreen;
