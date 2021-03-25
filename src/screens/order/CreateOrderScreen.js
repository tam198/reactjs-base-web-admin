import {
  PlusCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { setLocale } from "yup";
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
import RadioField from "components/RadioField";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { FastField, Form, Formik } from "formik";
import * as Yup from "yup";
import {
  supplierFullList,
  createOrder,
  uploadDocument,
  deleteDocument,
  orderDetail,
  updateOrder,
  getMoneyUnit,
} from "network/OrderApi";
import SelectField from "components/SelectField";
import DatePickerField from "components/DatePickerField";
import SubDatePickerField from "components/SubDatePickerField";

const { Option } = Select;
const { TextArea } = Input;

const headerTable = [
  { title: STRING.numericalOrder, chinese: "顺序" },
  { title: STRING.paymentClause, chinese: "付款方式" },
  { title: `% ${STRING.payment}`, chinese: "付款率" },
  { title: `${STRING.paymentDate} (Ngày)`, chinese: "付款期間" },
  { title: "Action" },
];

const radioOptions = [
  { value: 1, label: "ISO" },
  { value: 2, label: "Khác/其他" },
];

const orderStatus = [
  { value: 1, label: `${STRING.ordered}/已訂購` },
  { value: 2, label: `${STRING.transporting}/運輸中` },
  { value: 3, label: `${STRING.returnedToPort}/已到港口` },
  { value: 4, label: `${STRING.complete}/完成` },
];

const paymentClauseList = [
  { value: 1, label: "Khoản tạm ứng/預付款" },
  { value: 2, label: "Khoản trước giao hàng/出貨前" },
  { value: 3, label: "Khoản sau giao hàng/出貨后" },
];

const formatNumber = (n) => {
  if (!n) return;
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatPureNumber = (n) => {
  if (!n) return;
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, "");
};

function CreateOrderScreen(props) {
  const state = props.location.state;
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

  const [moneyUnit, setMoneyUnit] = useState([]);

  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);

  const history = useHistory();

  useEffect(() => {
    getSupplierList();
    getMoneyType();
    if (state.isUpdate) {
      getOrderDetail(id);
    }
  }, []);

  const toggleAddSupplier = () => {
    setIsModalAddSupplierVisible(!isModalAddSupplierVisible);
  };

  const toggleEditPaymentMethod = () => {
    setIsModalEditPaymentMethod(!isModalEditPaymentMethod);
  };

  const HeaderButton = () => {
    return (
      <>
        <Button
          className="btn btn-secondary mr-2"
          onClick={() => history.goBack()}
        >
          {STRING.cancel}/取消
        </Button>
        <Button
          className="btn btn-success"
          // onClick={() => history.push(ROUTER.ORDER)}
          onClick={() =>
            !state.isUpdate ? addNewOrder() : updateChosenOrder()
          }
        >
          {STRING.save}/救
        </Button>
      </>
    );
  };

  const ModalAddEdit = () => {
    const initialValues = {
      supplierCode: "",
      supplierName: "",
      email: "",
      tax: "",
      phoneNumber: "",
      productCertification: "",
      fax: "",
      dateOfCompanyRegistration: "",
      representative: "",
      contactPerson: "",
      contactPersonPhone: "",
      officeAddress: "",
      contactAddress: "",
      productType: "",
      constructType: "",
    };
    const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    const tax_regex = /(([0-9])\b)/g;
    setLocale({
      string: {
        min: "Trường này phải có ít nhất ${min} kí tự!",
        max: "Trường này nhiều nhất là ${max} kí tự!",
      },
      number: {
        min: "Trường này phải có ít nhất ${min} kí tự!",
        max: "Trường này nhiều nhất là ${max} kí tự!",
      },
    });
    const validationSchemaToAdd = Yup.object().shape({
      supplierCode: Yup.string()
        .max(15)
        .required("Mã nhà cung cấp không được để trống!"),
      supplierName: Yup.string().required(
        "Tên nhà cung cấp không được để trống!"
      ),
      email: Yup.string().email("Sai định dạng mail (Vd: @gmail.com)"),
      // .required("Email không được để trống!"),
      tax: Yup.string()
        .max(15)
        .matches(tax_regex, "Mã số thuế chỉ được nhập số")
        .required("Mã số thuế không được để trống!"),
      phoneNumber: Yup.string()
        .min(10)
        .matches(vnf_regex, "Nhập sai định dạng")
        .required("Số điện thoại nhà cung cấp không được để trống!"),
      // productCertification: Yup.number().required(
      //   "Chứng nhận sản phẩm không được để trống"
      // ),
      fax: Yup.string().max(15).required("Fax không được để trống!"),
      // dateOfCompanyRegistration: Yup.string().required(
      //   "Ngày đăng ký công ty chưa được chọn!"
      // ),
      // representative: Yup.string().required(
      //   "Người đại diện không được để trống!"
      // ),
      // contactPerson: Yup.string().required(
      //   "Người liên hệ không được để trống!"
      // ),
      contactPersonPhone: Yup.string()
        .min(10)
        .matches(vnf_regex, "Nhập sai định dạng")
        .required("Số điện thoại liên hệ không được để trống!"),
      // officeAddress: Yup.string().required(
      //   "Địa chỉ trụ sở không được để trống!"
      // ),
      // contactAddress: Yup.string().required(
      //   "Địa chỉ liên hệ không được để trống!"
      // ),
      productType: Yup.string().required("Loại sản phẩm không được để trống!"),
      constructType: Yup.string().required(
        "Loại công trình không được để trống!"
      ),
    });

    return (
      <div>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => {
            try {
              // setIsLoading(true);
              const payload = {
                code: values.supplierCode,
                name: values.supplierName,
                tax: values.tax,
                phoneNumber: values.phoneNumber,
                email: values.email,
                contact: values.contactPerson,
                contactPhoneNumber: values.contactPersonPhone,
                address: values.contactAddress,
                officeAddress: values.officeAddress,
                fax: values.fax,
                registrationDate: values.dateOfCompanyRegistration,
                contructionType: values.constructType,
                productType: values.productType,
                representative: values.representative,
                certificateProduct:
                  values.productCertification === ""
                    ? -1
                    : values.productCertification,
              };
              await createSupplier(payload);
              notifySuccess(STRING.success);
              getSupplierList();
              setIsModalAddSupplierVisible(false);
            } catch (error) {
              // setIsLoading(false);
              // getSupplierList();
              // setIsModalAddSupplierVisible(true);
              // notifyFail(STRING.fail);
            }
          }}
          validationSchema={validationSchemaToAdd}
        >
          {(formikProps) => {
            return (
              <Modal
                isOpen={isModalAddSupplierVisible}
                size="xl"
                toggle={toggleAddSupplier}
                centered
              >
                <Form>
                  <ModalHeader toggle={toggleAddSupplier}>
                    Thêm nhà cung cấp/添加供应商
                  </ModalHeader>
                  <ModalBody>
                    <Row gutter={[32, 16]}>
                      <Col className="gutter-row" span={12}>
                        {/* ------------------Mã nhà cung cấp--------------------- */}
                        <div className="mb-4">
                          <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                              <span>{STRING.supplierCode}</span>
                              <span style={{ color: "red" }}> *</span>
                              <br />
                              <span>供應商代碼</span>
                            </Col>
                            <Col className="gutter-row" span={16}>
                              <FastField
                                component={InputField}
                                name="supplierCode"
                                // label={STRING.supplierCode}
                                placeholder={STRING.supplierCode}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Tên nhà cung cấp--------------------- */}
                        <div className="mb-4">
                          <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                              <span>
                                {STRING.supplierName} (Tiếng Trung/Anh)
                              </span>
                              <span style={{ color: "red" }}> *</span>
                              <br />
                              <span>供應商名稱 (中文/英文)</span>
                            </Col>
                            <Col className="gutter-row" span={16}>
                              <FastField
                                component={InputField}
                                name="supplierName"
                                // label={STRING.supplierName}
                                placeholder={STRING.supplierName}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Mã số thuế--------------------- */}
                        <div className="mb-4">
                          <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                              <span>{STRING.tax}</span>
                              <span style={{ color: "red" }}> *</span>
                              <br />
                              <span>稅號</span>
                            </Col>
                            <Col className="gutter-row" span={16}>
                              <FastField
                                component={InputField}
                                name="tax"
                                // label={STRING.tax}
                                placeholder={STRING.tax}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Số điện thoại--------------------- */}
                        <div className="mb-4">
                          <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                              <span>{STRING.phoneNumber}</span>
                              <span style={{ color: "red" }}> *</span>
                              <br />
                              <span>電話</span>
                            </Col>
                            <Col className="gutter-row" span={16}>
                              <FastField
                                component={InputField}
                                name="phoneNumber"
                                // label={STRING.phoneNumber}
                                placeholder={STRING.phoneNumber}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Chứng nhận sản phẩm--------------------- */}
                        <div className="mb-4">
                          <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                              <span>{STRING.productCertification}</span>
                              <br />
                              <span>產品認證</span>
                            </Col>
                            <Col className="gutter-row" span={16}>
                              <FastField
                                component={RadioField}
                                name="productCertification"
                                // label={STRING.productCertification}
                                options={radioOptions}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Fax--------------------- */}
                        <div className="mb-4">
                          <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                              <span>Fax</span>
                              <br />
                              <span>傳真</span>
                            </Col>
                            <Col className="gutter-row" span={16}>
                              <FastField
                                component={InputField}
                                name="fax"
                                // label="Fax"
                                placeholder="Fax"
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Ngày đăng ký công ty--------------------- */}
                        <div className="mb-4">
                          <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                              <span>{STRING.dateOfCompanyRegistration}</span>
                              <br />
                              <span>公司設立日期</span>
                            </Col>
                            <Col className="gutter-row" span={16}>
                              <FastField
                                component={DatePickerField}
                                name="dateOfCompanyRegistration"
                                // label={STRING.dateOfCompanyRegistration}
                                placeholder={STRING.dateOfCompanyRegistration}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Email--------------------- */}
                        <div className="mb-4">
                          <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                              <span>{STRING.email}</span>
                            </Col>
                            <Col className="gutter-row" span={16}>
                              <FastField
                                component={InputField}
                                name="email"
                                // label={STRING.email}
                                placeholder={STRING.email}
                              />
                            </Col>
                          </Row>
                        </div>
                      </Col>
                      <Col className="gutter-row" span={12}>
                        {/* ------------------Người đại diện--------------------- */}
                        <div className="mb-4">
                          <Row>
                            <Col span={6}>
                              <span>{STRING.representative}</span>
                              <br />
                              <span>代表人</span>
                            </Col>
                            <Col span={18}>
                              <FastField
                                component={InputField}
                                name="representative"
                                // label={STRING.representative}
                                placeholder={STRING.representative}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Người liên hệ--------------------- */}
                        <div className="mb-4">
                          <Row>
                            <Col span={6}>
                              <span>{STRING.contactPerson}</span>
                              <br />
                              <span>聯絡人</span>
                            </Col>
                            <Col span={18}>
                              <FastField
                                component={InputField}
                                name="contactPerson"
                                // label={STRING.contactPerson}
                                placeholder={STRING.contactPerson}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Số điện thoại người liên hệ--------------------- */}
                        <div className="mb-4">
                          <Row>
                            <Col span={6}>
                              <span>{STRING.contactPersonPhone}</span>
                              <br />
                              <span>聯絡人的電話號碼</span>
                            </Col>
                            <Col span={18}>
                              <FastField
                                component={InputField}
                                name="contactPersonPhone"
                                // label={STRING.contactPersonPhone}
                                placeholder={STRING.contactPersonPhone}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Địa chỉ trụ sở--------------------- */}
                        <div className="mb-4">
                          <Row>
                            <Col span={6}>
                              <span>{STRING.officeAddress}</span>
                              <br />
                              <span>設立地址</span>
                            </Col>
                            <Col span={18}>
                              <FastField
                                component={InputField}
                                name="officeAddress"
                                // label={STRING.officeAddress}
                                placeholder={STRING.officeAddress}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Địa chỉ liên hệ--------------------- */}
                        <div className="mb-4">
                          <Row>
                            <Col span={6}>
                              <span>{STRING.contactAddress}</span>
                              <br />
                              <span>聯絡地址</span>
                            </Col>
                            <Col span={18}>
                              <FastField
                                component={InputField}
                                name="contactAddress"
                                // label={STRING.contactAddress}
                                placeholder={STRING.contactAddress}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Loại sản phẩm--------------------- */}
                        <div className="mb-4">
                          <Row>
                            <Col span={6}>
                              <span>{STRING.productType}</span>
                              <span style={{ color: "red" }}> *</span>
                              <br />
                              <span>產品類別</span>
                            </Col>
                            <Col span={18}>
                              <FastField
                                component={InputField}
                                name="productType"
                                // label={STRING.productType}
                                placeholder={STRING.productType}
                              />
                            </Col>
                          </Row>
                        </div>
                        {/* ------------------Loại công trình--------------------- */}
                        <div className="mb-4">
                          <Row>
                            <Col span={6}>
                              <span>{STRING.constructType}</span>
                              <span style={{ color: "red" }}> *</span>
                              <br />
                              <span>工程類別</span>
                            </Col>
                            <Col span={18}>
                              <FastField
                                component={InputField}
                                name="constructType"
                                // label={STRING.constructType}
                                placeholder={STRING.constructType}
                              />
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </ModalBody>
                  <ModalFooter>
                    <Button type="submit" className="btn btn-primary">
                      {`${STRING.save}/存`}
                    </Button>
                    <Button
                      className="btn btn-secondary"
                      onClick={toggleAddSupplier}
                    >
                      {`${STRING.cancel}/取消`}
                    </Button>
                  </ModalFooter>
                </Form>
              </Modal>
            );
          }}
        </Formik>
      </div>
    );
  };

  const ModalEditPayment = () => {
    let value = paymentMethodList[selectedPaymentIndex];

    const chosenValues = {
      paymentClause: value?.paymentClause,
      paymentPercent: value?.paymentPercent,
      createdDate: value?.createdDate,
    };

    const validationSchema = Yup.object().shape({
      paymentClause: Yup.number().required("Khoản thanh toán chưa được chọn!"),
      paymentPercent: Yup.number()
        .required("% Số thanh toán không được để trống!")
        .min(1)
        .max(100),
      createdDate: Yup.string().required(
        "Ngày thanh toán không được để trống!"
      ),
    });

    return (
      <div>
        <Formik
          initialValues={chosenValues}
          onSubmit={(values) => {
            if (values.paymentClause !== chosenValues.paymentClause) {
              if (
                paymentMethodList.findIndex(
                  (item) => item.paymentClause === 1
                ) >= 0 &&
                values.paymentClause === 1
              ) {
                notifyFail("Phương thức thanh toán đã có khoản tạm ứng!");
                return;
              }

              if (
                paymentMethodList.findIndex(
                  (item) => item.paymentClause === 2
                ) >= 0 &&
                values.paymentClause === 2
              ) {
                notifyFail(
                  "Phương thức thanh toán đã có khoản trước giao hàng!"
                );
                return;
              }

              if (
                paymentMethodList.findIndex(
                  (item) => item.paymentClause === 3
                ) >= 0 &&
                values.paymentClause === 3
              ) {
                notifyFail("Phương thức thanh toán đã có khoản sau giao hàng!");
                return;
              }
            }

            let newArr = [...paymentMethodList];
            newArr = [
              ...newArr.slice(0, selectedPaymentIndex),
              {
                ...values,
              },
              ...newArr.slice(selectedPaymentIndex + 1, newArr.length),
            ];
            setIsModalEditPaymentMethod(false);
            setPaymentMethodList(newArr);
            notifySuccess(STRING.success);
          }}
          validationSchema={validationSchema}
        >
          {(formikProps) => {
            return (
              <Modal
                isOpen={isModalEditPaymentMethod}
                toggle={toggleEditPaymentMethod}
                centered
              >
                <Form>
                  <ModalHeader toggle={toggleEditPaymentMethod}>
                    Sửa phương thức thanh toán
                    <br />
                    修改付款方式
                  </ModalHeader>
                  <ModalBody>
                    <FastField
                      component={SelectField}
                      name="paymentClause"
                      label="Khoản thanh toán/付款"
                      placeholder="Khoản thanh toán"
                      options={paymentClauseList}
                    />

                    <FastField
                      component={InputField}
                      name="paymentPercent"
                      label="% Thanh toán/付款号码"
                      placeholder="% Thanh toán"
                      type="number"
                    />

                    <FastField
                      component={SubDatePickerField}
                      name="createdDate"
                      label="Ngày thanh toán/付款日期"
                      placeholder="Ngày thanh toán"
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button type="submit" className="btn btn-primary">
                      {STRING.save}/救
                    </Button>
                    <Button
                      className="btn btn-secondary"
                      onClick={toggleEditPaymentMethod}
                    >
                      {STRING.cancel}/取消
                    </Button>
                  </ModalFooter>
                </Form>
              </Modal>
            );
          }}
        </Formik>
      </div>
    );
  };

  const PaymentMethodTable = () => {
    return (
      <Table striped bordered hover className="mb-3">
        <thead>
          <tr>
            {headerTable.map((item, index) => {
              return item.title === "Action" ? (
                <th key={index} className="text-center align-middle"></th>
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
                  <td className="text-center align-middle">
                    <div className="d-flex justify-content-around">
                      <EditOutlined onClick={() => onEditPayment(index)} />
                      <DeleteOutlined onClick={() => onDeletePayment(index)} />
                    </div>
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
        dueDate: Moment(res.data.deadlineDate, "DD/MM/YYYY")._i,
        isImport: res.data.isImport == 1 ? true : false,
        productType: res.data.productType,
        constructionType: res.data.contructionType,
        purchaseContent: res.data.description,
        status: res.data.status,
        orderCode: res.data.code,
      });

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

  const getMoneyType = async () => {
    try {
      const res = await getMoneyUnit();
      res.data.forEach((item) => {
        delete item.order;
        delete item.isActive;
        delete item.createdDate;
      });
      setMoneyUnit(res.data);
    } catch (error) {
      notifyFail(STRING.fail);
    }
  };

  const onAddPayment = () => {
    let paymentArr = [...paymentMethodList];
    if (paymentMethodList.length === 3) {
      notifyFail("Chỉ có tối đa 3 phương thức thanh toán!");
      return;
    }
    if (!paymentMethod.paymentClause) {
      notifyFail("Khoản thanh toán chưa được chọn!");
      return;
    }
    if (!paymentMethod.paymentPercent) {
      notifyFail("Phần trăm thanh toán không được để trống!");
      return;
    }
    if (paymentMethod.paymentPercent > 100) {
      notifyFail("Phần trăm thanh toán không được vượt quá 100%!");
      return;
    }
    if (paymentMethod.paymentPercent <= 0) {
      notifyFail("Phần trăm thanh toán phải lớn hơn 0%!");
      return;
    }
    if (!paymentMethod.createdDate) {
      notifyFail("Ngày thanh toán thanh toán chưa được chọn!");
      return;
    }
    if (
      paymentMethodList.findIndex((item) => item.paymentClause === 1) >= 0 &&
      paymentMethod.paymentClause === 1
    ) {
      notifyFail("Phương thức thanh toán đã có khoản tạm ứng!");
      return;
    }
    if (
      paymentMethodList.findIndex((item) => item.paymentClause === 2) >= 0 &&
      paymentMethod.paymentClause === 2
    ) {
      notifyFail("Phương thức thanh toán đã có khoản trước giao hàng!");
      return;
    }
    if (
      paymentMethodList.findIndex((item) => item.paymentClause === 3) >= 0 &&
      paymentMethod.paymentClause === 3
    ) {
      notifyFail("Phương thức thanh toán đã có khoản sau giao hàng!");
      return;
    }

    paymentArr.push(paymentMethod);
    setPaymentMethodList(paymentArr);
    setPaymentMethod({
      paymentClause: undefined,
      paymentPercent: "",
      createdDate: "",
    });
  };

  const onEditPayment = (index) => {
    setSelectedPaymentIndex(index);
    setIsModalEditPaymentMethod(true);
  };

  const onDeletePayment = (index) => {
    let paymentArr = [...paymentMethodList];
    paymentArr.splice(index, 1);
    setPaymentMethodList(paymentArr);
  };

  const handleMultiFile = async (value) => {
    if (value.fileList.length > listFileUpload.length) {
      try {
        let lengthArr = value.fileList.length;
        let formData = new FormData();

        formData.append("Name", "");
        formData.append("Path", "http://qldh.winds.vn:6886/api");
        formData.append("OrderId", "");
        formData.append("File", value.fileList[lengthArr - 1].originFileObj);
        const res = await uploadDocument(formData);

        let newListFileUpload = [...listFileUpload];

        newListFileUpload.push({
          uid: value.fileList[lengthArr - 1].uid,
          name: res.data.fileName.split("/")[
            res.data.fileName.split("/").length - 1
          ],
          status: "done",
          url: `http://qldh.winds.vn:6886${res.data.fileName}`,
          path: res.data.fileName,
        });

        setListFileUpload(newListFileUpload);
      } catch (error) {
        console.log(error);
      }
    } else {
      let newListFileUpload = JSON.parse(JSON.stringify(listFileUpload));
      let listElmUploaded = newListFileUpload.map(
        (fileUpload) => fileUpload.uid
      );
      for (let index = 0; index < listElmUploaded.length; index++) {
        let currentIndexIsDeleted = value.fileList.findIndex(
          (item) => listElmUploaded[index] === item.uid
        );

        if (currentIndexIsDeleted === -1) {
          newListFileUpload.splice(index, 1);
          break;
        }
      }
      setListFileUpload(newListFileUpload);
    }
  };

  const addNewOrder = async () => {
    try {
      if (!orderObject.supplierId) {
        notifyFail("Nhà cung cấp chưa được chọn!");
        document.getElementById("supplierId").focus();
        return;
      }
      if (!orderObject.constructionName) {
        notifyFail("Tên công trình không được để trống!");
        document.getElementById("constructionName").focus();
        return;
      }
      // if (!orderObject.taxMoney) {
      //   notifyFail("Số tiền trước thuế không được để trống!");
      //   document.getElementById("taxMoney").focus();
      //   return;
      // }
      // if (!orderObject.moneyUnit) {
      //   notifyFail("Đơn vị tiền chưa được chọn!");
      //   document.getElementById("moneyUnit").focus();
      //   return;
      // }
      // if (!orderObject.dueWarranty) {
      //   notifyFail("Thời hạn bảo hành không được để trống!");
      //   document.getElementById("dueWarranty").focus();
      //   return;
      // }
      // if (!orderObject.finePerDay) {
      //   notifyFail("Quá hạn phạt mỗi ngày không được để trống!");
      //   document.getElementById("finePerDay").focus();
      //   return;
      // }
      // if (!listFileUpload.length) {
      //   notifyFail("Vui lòng chọn ít nhất 1 file!");
      //   return;
      // }
      if (!orderObject.contractCode) {
        notifyFail("Mã hợp đồng không được để trống!");
        document.getElementById("contractCode").focus();
        return;
      }
      // if (!orderObject.dueDate) {
      //   notifyFail("Thời hạn hoàn công chưa được chọn!");
      //   document.getElementById("dueDate").focus();
      //   return;
      // }
      if (!orderObject.productType) {
        notifyFail("Loại sản phẩm không được để trống!");
        document.getElementById("productType").focus();
        return;
      }
      if (!orderObject.constructionType) {
        notifyFail("Loại công trình không được để trống!");
        document.getElementById("constructionType").focus();
        return;
      }
      if (!orderObject.purchaseContent) {
        notifyFail("Nội dung mua hàng không được để trống!");
        document.getElementById("purchaseContent").focus();
        return;
      }
      // if (!paymentMethodList.length) {
      //   notifyFail("Chưa có phương thức thanh toán!");
      //   return;
      // }
      // if (paymentMethodList.findIndex((item) => item.paymentClause === 1) < 0) {
      //   notifyFail("Phương thức thanh toán chưa có khoản tạm ứng!");
      //   return;
      // }
      // if (paymentMethodList.findIndex((item) => item.paymentClause === 2) < 0) {
      //   notifyFail("Phương thức thanh toán chưa có khoản trước giao hàng!");
      //   return;
      // }
      // if (paymentMethodList.findIndex((item) => item.paymentClause === 3) < 0) {
      //   notifyFail("Phương thức thanh toán chưa có khoản sau giao hàng!");
      //   return;
      // }

      const payload = {
        contructionName: orderObject.constructionName,
        contructionType: orderObject.constructionType,
        productType: orderObject.productType,
        amountBeforeTax: formatPureNumber(orderObject.taxMoney),
        contactNumber: "0974747474",
        deadlineDate: orderObject.dueDate
          ? Moment(orderObject.dueDate).format("DD/MM/YYYY")
          : "",
        outOfDate: orderObject.finePerDay
          ? parseInt(orderObject.finePerDay)
          : null,
        warrantyPeriod: parseInt(orderObject.dueWarranty),
        contactCode: orderObject.contractCode,
        isImport: orderObject.isImport ? 1 : 0,
        description: orderObject.purchaseContent,
        status: 1,
        moneyTypeID: parseInt(orderObject.moneyUnit),
        providerID: parseInt(orderObject.supplierId),
        path: listFileUpload.map((item) => item.path).join(","),
        payment1: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 1)
            ? parseInt(
                paymentMethodList.find((item) => item.paymentClause === 1)
                  .paymentPercent
              )
            : null
          : null,
        paymentDate1: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 1)
            ? paymentMethodList.find((item) => item.paymentClause === 1)
                .createdDate
            : ""
          : "",
        payment2: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 2)
            ? parseInt(
                paymentMethodList.find((item) => item.paymentClause === 2)
                  .paymentPercent
              )
            : null
          : null,
        paymentDate2: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 2)
            ? paymentMethodList.find((item) => item.paymentClause === 2)
                .createdDate
            : ""
          : "",
        payment3: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 3)
            ? parseInt(
                paymentMethodList.find((item) => item.paymentClause === 3)
                  .paymentPercent
              )
            : null
          : null,
        paymentDate3: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 3)
            ? paymentMethodList.find((item) => item.paymentClause === 3)
                .createdDate
            : ""
          : "",
      };

      await createOrder(payload);
      notifySuccess(STRING.success);
      history.push(ROUTER.ORDER);
    } catch (error) {
      notifyFail(STRING.fail);
    }
  };

  // CALL API SỬA ĐƠN HÀNG
  const updateChosenOrder = async () => {
    try {
      if (!orderObject.supplierId) {
        notifyFail("Nhà cung cấp chưa được chọn!");
        document.getElementById("supplierId").focus();
        return;
      }
      if (!orderObject.constructionName) {
        notifyFail("Tên công trình không được để trống!");
        document.getElementById("constructionName").focus();
        return;
      }
      // if (!orderObject.taxMoney) {
      //   notifyFail("Số tiền trước thuế không được để trống!");
      //   document.getElementById("taxMoney").focus();
      //   return;
      // }
      // if (!orderObject.moneyUnit) {
      //   notifyFail("Đơn vị tiền chưa được chọn!");
      //   document.getElementById("moneyUnit").focus();
      //   return;
      // }
      // if (!orderObject.dueWarranty) {
      //   notifyFail("Thời hạn bảo hành không được để trống!");
      //   document.getElementById("dueWarranty").focus();
      //   return;
      // }
      // if (!orderObject.finePerDay) {
      //   notifyFail("Quá hạn phạt mỗi ngày không được để trống!");
      //   document.getElementById("finePerDay").focus();
      //   return;
      // }
      // if (!listFileUpload.length) {
      //   notifyFail("Vui lòng chọn ít nhất 1 file!");
      //   return;
      // }
      // if (!orderObject.status) {
      //   notifyFail("Trạng thái đơn hàng chưa được chọn!");
      //   document.getElementById("contractCode").focus();
      //   return;
      // }
      if (!orderObject.contractCode) {
        notifyFail("Mã hợp đồng không được để trống!");
        document.getElementById("contractCode").focus();
        return;
      }
      // if (!orderObject.dueDate) {
      //   notifyFail("Thời hạn hoàn công chưa được chọn!");
      //   document.getElementById("dueDate").focus();
      //   return;
      // }
      if (!orderObject.productType) {
        notifyFail("Loại sản phẩm không được để trống!");
        document.getElementById("productType").focus();
        return;
      }
      if (!orderObject.constructionType) {
        notifyFail("Loại công trình không được để trống!");
        document.getElementById("constructionType").focus();
        return;
      }
      if (!orderObject.purchaseContent) {
        notifyFail("Nội dung mua hàng không được để trống!");
        document.getElementById("purchaseContent").focus();
        return;
      }
      // if (!paymentMethodList.length) {
      //   notifyFail("Chưa có phương thức thanh toán!");
      //   return;
      // }
      // if (paymentMethodList.findIndex((item) => item.paymentClause === 1) < 0) {
      //   notifyFail("Phương thức thanh toán chưa có khoản tạm ứng!");
      //   return;
      // }
      // if (paymentMethodList.findIndex((item) => item.paymentClause === 2) < 0) {
      //   notifyFail("Phương thức thanh toán chưa có khoản trước giao hàng!");
      //   return;
      // }
      // if (paymentMethodList.findIndex((item) => item.paymentClause === 3) < 0) {
      //   notifyFail("Phương thức thanh toán chưa có khoản sau giao hàng!");
      //   return;
      // }

      const payloadToUpdate = {
        ID: parseInt(id),
        contructionName: orderObject.constructionName,
        contructionType: orderObject.constructionType,
        productType: orderObject.productType,
        amountBeforeTax: formatPureNumber(orderObject.taxMoney),
        contactNumber: "0974747474",
        deadlineDate: orderObject.dueDate
          ? Moment(orderObject.dueDate).format("DD/MM/YYYY")
          : "",
        outOfDate: orderObject.finePerDay
          ? parseInt(orderObject.finePerDay)
          : null,
        warrantyPeriod: parseInt(orderObject.dueWarranty),
        contactCode: orderObject.contractCode,
        isImport: orderObject.isImport ? 1 : 0,
        description: orderObject.purchaseContent,
        status: orderObject.status,
        moneyTypeID: parseInt(orderObject.moneyUnit),
        providerID: parseInt(orderObject.supplierId),
        path: listFileUpload.map((item) => item.path).join(","),
        payment1: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 1)
            ? parseInt(
                paymentMethodList.find((item) => item.paymentClause === 1)
                  .paymentPercent
              )
            : null
          : null,
        paymentDate1: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 1)
            ? paymentMethodList.find((item) => item.paymentClause === 1)
                .createdDate
            : ""
          : "",
        payment2: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 2)
            ? parseInt(
                paymentMethodList.find((item) => item.paymentClause === 2)
                  .paymentPercent
              )
            : null
          : null,
        paymentDate2: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 2)
            ? paymentMethodList.find((item) => item.paymentClause === 2)
                .createdDate
            : ""
          : "",
        payment3: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 3)
            ? parseInt(
                paymentMethodList.find((item) => item.paymentClause === 3)
                  .paymentPercent
              )
            : null
          : null,
        paymentDate3: paymentMethodList.length
          ? paymentMethodList.find((item) => item.paymentClause === 3)
            ? paymentMethodList.find((item) => item.paymentClause === 3)
                .createdDate
            : ""
          : "",
      };
      await updateOrder(payloadToUpdate);
      notifySuccess(STRING.success);
      history.push(ROUTER.ORDER);
    } catch (error) {
      notifyFail(STRING.fail);
    }
  };

  return (
    <ScreenWrapper
      titleHeader={
        !state.isUpdate
          ? `${STRING.createOrder}/创建订单`
          : `${STRING.editOrder}/正确的顺序`
      }
      isLoading={isLoading}
      isError={isError}
      hasButton={true}
      detail={true}
      context={props}
    >
      <HeaderButton />
      <div className="card">
        <ModalAddEdit />
        <ModalEditPayment />
        <div className="card-body">
          <Divider orientation="left">
            <h5>{STRING.orderInfo}/訂單信息</h5>
          </Divider>
          <Row gutter={[24, 16]}>
            <Col className="gutter-row" span={12}>
              {
                // ------------------Mã đơn hàng---------------------
                state.isUpdate && (
                  <div className="mb-4">
                    <Row gutter={16}>
                      <Col className="gutter-row" span={10}>
                        <span>{STRING.orderCode}</span>
                        <br />
                        <span>訂單編號</span>
                      </Col>
                      <Col className="gutter-row" span={14}>
                        <label>{orderObject.orderCode || "--"}</label>
                      </Col>
                    </Row>
                  </div>
                )
              }
              {/* ------------------Nhà cung cấp--------------------- */}
              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.supplier}</span>
                    <span style={{ color: "red" }}> *</span>
                    <br />
                    <span>供應商</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <Select
                      placeholder={STRING.supplier}
                      style={{ width: "80%" }}
                      id="supplierId"
                      value={orderObject.supplierId}
                      onChange={(value) =>
                        setOrderObject({ ...orderObject, supplierId: value })
                      }
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
                    <PlusCircleOutlined
                      style={{ fontSize: "28px", padding: "0 0 0 10px" }}
                      onClick={() => setIsModalAddSupplierVisible(true)}
                    />
                  </Col>
                </Row>
              </div>
              {/* ------------------Tên công trình--------------------- */}
              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.constructionName}</span>
                    <span style={{ color: "red" }}> *</span>
                    <br />
                    <span>工程名稱</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <Input
                      placeholder={STRING.constructionName}
                      value={orderObject.constructionName}
                      id="constructionName"
                      onChange={(e) =>
                        setOrderObject({
                          ...orderObject,
                          constructionName: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
              </div>
              {/* ------------------Số tiền trước thuế--------------------- */}
              <div className="mb-4">
                <Row gutter={16}>
                  <Col className="gutter-row" span={10}>
                    <span>{STRING.taxMoney}</span>
                    <br />
                    <span>稅前金額</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <div className="d-flex justify-content-between">
                      <Input
                        placeholder={STRING.taxMoney}
                        // type="number"
                        id="taxMoney"
                        value={formatNumber(orderObject.taxMoney)}
                        onChange={(e) =>
                          setOrderObject({
                            ...orderObject,
                            taxMoney: e.target.value,
                          })
                        }
                      />
                      <Select
                        placeholder={STRING.moneyUnit}
                        style={{ minWidth: "120px" }}
                        value={orderObject.moneyUnit}
                        id="moneyUnit"
                        onChange={(value) => {
                          setOrderObject({ ...orderObject, moneyUnit: value });
                        }}
                        allowClear
                        autoClearSearchValue
                      >
                        {moneyUnit.length &&
                          moneyUnit.map((item, index) => {
                            return (
                              <Option key={index} value={item.id}>
                                {item.name}
                              </Option>
                            );
                          })}
                        {/* <Option value={1}>{STRING.vnd}</Option> */}
                        {/* <Option value="2">$</Option>
                        <Option value="3">￥</Option> */}
                      </Select>
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
                    <span>保固期間</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <div className="d-flex justify-content-between">
                      <Input
                        placeholder={STRING.warrantyPeriod}
                        type="number"
                        value={orderObject.dueWarranty}
                        id="dueWarranty"
                        suffix="Năm/年"
                        onChange={(e) =>
                          setOrderObject({
                            ...orderObject,
                            dueWarranty: e.target.value,
                          })
                        }
                      />
                      {/* <span style={{ fontSize: "16px", marginLeft: "10px" }}>
                        {STRING.year}
                      </span> */}
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
                    <span>逾期罰款每日</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <div className="d-flex justify-content-between">
                      <Input
                        placeholder={STRING.percentFinePerDay}
                        type="number"
                        value={orderObject.finePerDay}
                        suffix="%"
                        id="finePerDay"
                        onChange={(e) =>
                          setOrderObject({
                            ...orderObject,
                            finePerDay: e.target.value,
                          })
                        }
                      />
                      {/* <span style={{ fontSize: "16px", marginLeft: "10px" }}>
                        %
                      </span> */}
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
                    <span>附件檔案</span>
                  </Col>
                  <Col className="gutter-row" span={14}>
                    <Upload
                      {...props}
                      onChange={handleMultiFile}
                      fileList={listFileUpload}
                    >
                      <ButtonAntd icon={<UploadOutlined />}>
                        Đăng file/附件檔案
                      </ButtonAntd>
                    </Upload>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col className="gutter-row" span={12}>
              {
                // ------------------Trạng thái đơn hàng---------------------
                state.isUpdate && (
                  <div className="mb-4">
                    <Row>
                      <Col span={8}>
                        <span>{STRING.status}</span>
                        <br />
                        <span>訂單狀態</span>
                      </Col>
                      <Col span={16}>
                        <Select
                          placeholder={STRING.supplier}
                          style={{ width: "100%" }}
                          value={orderObject.status}
                          id="status"
                          onChange={(value) =>
                            setOrderObject({ ...orderObject, status: value })
                          }
                          // allowClear
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
                    </Row>
                  </div>
                )
              }
              {/* ------------------Mã hợp đồng--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.contractCode}</span>
                    <span style={{ color: "red" }}> *</span>
                    <br />
                    <span>合約編號</span>
                  </Col>
                  <Col span={16}>
                    <Input
                      placeholder={STRING.contractCode}
                      value={orderObject.contractCode}
                      id="contractCode"
                      onChange={(e) =>
                        setOrderObject({
                          ...orderObject,
                          contractCode: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
              </div>
              {/* ------------------Thời hạn hoàn công--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{`${STRING.dueDate} (Giao hàng)`}</span>
                    <br />
                    <span>完工（交貨）期限</span>
                  </Col>
                  <Col span={16}>
                    <DatePicker
                      placeholder={STRING.pickDate}
                      style={{ width: "100%" }}
                      // defaultValue={
                      //   orderObject.dueDate &&
                      //   // Moment(orderObject.dueDate).format("DD/MM/YYYY")
                      //   Moment(orderObject.dueDate).format("DD/MM/YYYY")
                      // }
                      id="dueDate"
                      value={
                        // state.isUpdate
                        //   ? orderObject.dueDate
                        //     ? Moment(orderObject.dueDate._i, "DD/MM/YYYY")
                        //     : ""
                        //   :
                        orderObject.dueDate ? Moment(orderObject.dueDate) : ""
                      }
                      // format="DD/MM/YYYY"
                      format=""
                      onChange={(date, dateString) => {
                        setOrderObject({
                          ...orderObject,
                          dueDate: dateString,
                        });
                      }}
                    />
                  </Col>
                </Row>
              </div>
              {/* ------------------Nhập khẩu--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.import}</span>
                    <br />
                    <span>進口</span>
                  </Col>
                  <Col span={16}>
                    <Checkbox
                      checked={orderObject.isImport}
                      onChange={(e) =>
                        setOrderObject({
                          ...orderObject,
                          isImport: e.target.checked,
                        })
                      }
                    />
                  </Col>
                </Row>
              </div>
              {/* ------------------Loại sản phẩm--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.productType}</span>
                    <span style={{ color: "red" }}> *</span>
                    <br />
                    <span>產品類別</span>
                  </Col>
                  <Col span={16}>
                    <Input
                      placeholder={STRING.productType}
                      value={orderObject.productType}
                      id="productType"
                      onChange={(e) =>
                        setOrderObject({
                          ...orderObject,
                          productType: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
              </div>
              {/* ------------------Loại công trình--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.constructType}</span>
                    <span style={{ color: "red" }}> *</span>
                    <br />
                    <span>工程類別</span>
                  </Col>
                  <Col span={16}>
                    <Input
                      placeholder={STRING.constructType}
                      value={orderObject.constructionType}
                      id="constructionType"
                      onChange={(e) =>
                        setOrderObject({
                          ...orderObject,
                          constructionType: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
              </div>
              {/* ------------------Nội dung mua hàng--------------------- */}
              <div className="mb-4">
                <Row>
                  <Col span={8}>
                    <span>{STRING.purchaseContent}</span>
                    <span style={{ color: "red" }}> *</span>
                    <br />
                    <span>購買內容</span>
                  </Col>
                  <Col span={16}>
                    <TextArea
                      placeholder={STRING.purchaseContent}
                      value={orderObject.purchaseContent}
                      id="purchaseContent"
                      onChange={(e) =>
                        setOrderObject({
                          ...orderObject,
                          purchaseContent: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          {/* --------------------------Phương thức thanh toán----------------------------------- */}
          <div className="mt-2 mb-4">
            <Row gutter={12}>
              <Col span={5}>
                <div className="align-middle">
                  <label>{STRING.paymentMethod}</label>
                  <br />
                  <label>付款方式</label>
                </div>
              </Col>
              <Col span={6}>
                <div className="align-middle">
                  <Select
                    placeholder={`${STRING.paymentClause}/付款方式`}
                    style={{ width: "100%" }}
                    value={paymentMethod.paymentClause}
                    onChange={(value) =>
                      setPaymentMethod({
                        ...paymentMethod,
                        paymentClause: value,
                      })
                    }
                    allowClear
                    autoClearSearchValue
                  >
                    {paymentClauseList.map((item, index) => {
                      return (
                        <Option
                          key={index}
                          value={item.value}
                          disabled={
                            paymentMethodList.findIndex(
                              (selectItem) =>
                                selectItem.paymentClause === item.value
                            ) < 0
                              ? false
                              : true
                          }
                          // disabled={false}
                        >
                          {item.label}
                        </Option>
                      );
                    })}
                    {/* <Option value={1}>Khoản tạm ứng</Option>
                    <Option value={2}>Khoản trước giao hàng</Option>
                    <Option value={3}>Khoản sau giao hàng</Option> */}
                  </Select>
                </div>
              </Col>
              <Col span={4}>
                <div className="align-middle">
                  <Input
                    prefix="%"
                    placeholder="Số thanh toán/付款率"
                    type="number"
                    min="0"
                    max="100"
                    value={paymentMethod.paymentPercent}
                    onChange={(e) =>
                      setPaymentMethod({
                        ...paymentMethod,
                        paymentPercent: e.target.value,
                      })
                    }
                  />
                </div>
              </Col>
              <Col span={5}>
                <div className="align-middle">
                  <DatePicker
                    placeholder={`${STRING.pickDate}/选择一个日期`}
                    style={{ width: "100%" }}
                    // defaultValue={
                    //   paymentMethod.createdDate
                    //     ? Moment(paymentMethod.createdDate, "DD/MM/YYYY")
                    //     : null
                    // }
                    value={
                      paymentMethod.createdDate
                        ? Moment(paymentMethod.createdDate, "DD/MM/YYYY")
                        : ""
                    }
                    format="DD/MM/YYYY"
                    onChange={(date, dateString) =>
                      setPaymentMethod({
                        ...paymentMethod,
                        createdDate: dateString,
                      })
                    }
                  />
                </div>
              </Col>
              <Col span={4}>
                <div className="align-middle">
                  <Button
                    className="btn btn-primary"
                    onClick={() => onAddPayment()}
                  >
                    {STRING.add}/更多
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
          <PaymentMethodTable />
        </div>
      </div>
    </ScreenWrapper>
  );
}

CreateOrderScreen.propTypes = {};

export default CreateOrderScreen;
