import { Col, Input, Row, Radio, Empty } from "antd";
import Button from "components/Button";
import PaginationComponent from "components/PaginationComponent";
import ScreenWrapper from "components/ScreenWrapper";
import React, { useState, useEffect, useRef } from "react";
import { Table } from "react-bootstrap";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { FastField, Form, Formik } from "formik";
import * as Yup from "yup";
import { setLocale } from "yup";
import { STRING } from "constants/Constant";
import InputField from "components/InputField";
import SelectField from "components/SelectField";
import {
  supplierList,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "network/SupplierApi";
import Moment from "moment";
import RadioField from "components/RadioField";
import DatePickerField from "components/DatePickerField";
import { notifyFail, notifySuccess } from "utils/notify";
import ConfirmModal from "components/ConfirmModal";

const headerTable = [
  { title: STRING.numericalOrder, chinese: "数值顺序" },
  { title: STRING.supplierCode, chinese: "供应商代码" },
  { title: STRING.supplierName, chinese: "供应商名称" },
  { title: STRING.phoneNumber, chinese: "电话号码" },
  { title: STRING.email, chinese: "" },
  { title: STRING.representative, chinese: "代表人" },
  // { title: "Mã số thuế", chinese: '稅號' },
  { title: STRING.contactAddress, chinese: "聯絡地址" },
  { title: STRING.creator, chinese: "创作者" },
  { title: STRING.updatePerson, chinese: "更新的人" },
  { title: "checkbox", chinese: "" },
];

const recordsPerPage = 20;

const radioOptions = [
  { value: 1, label: "ISO" },
  { value: 2, label: "Khác/其他" },
];

function SupplierListScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shouldAddItem, setShouldAddItem] = useState(true);
  const [supplierData, setSupplierData] = useState([]);
  const [checkItemList, setCheckItemList] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [searchedName, setSearchedName] = useState("");
  const [paging, setPaging] = useState({
    totalItem: 0,
    totalPage: 0,
  });
  const inputRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const [chosenIndex, setChosenIndex] = useState(0);

  // useEffect(() => {
  //   getSupplierList();
  // }, []);

  useEffect(() => {
    getSupplierList();
  }, [activePage]);

  useEffect(() => inputRef?.current?.focus(), [searchedName]);

  const toggle = () => {
    setIsModalVisible(!isModalVisible);
  };

  const HeaderButton = () => {
    return (
      <>
        <Button
          className="btn btn-danger mr-2"
          onClick={() => {
            if (countNumberOfElementIsChecked(checkItemList) < 1) {
              notifyFail("Vui lòng chọn ít nhất 1 tài khoản để xóa!");
              return;
            }
            setConfirmModal(true);
          }}
        >
          {`${STRING.delete}/抹去`}
        </Button>
        <Button
          className="btn btn-primary"
          onClick={() => {
            setShouldAddItem(true);
            setIsModalVisible(true);
          }}
        >
          {`${STRING.addNew}/添新`}
        </Button>
      </>
    );
  };

  const FilterField = () => {
    return (
      <Row className="mb-4" gutter={16} justify="space-between">
        <Col span={10}>
          <Input
            placeholder="Tên, số điện thoại nhà cung cấp/供应商名称，电话号码"
            style={{ width: "100%" }}
            value={searchedName}
            onKeyUp={onKeyUp}
            ref={inputRef}
            onChange={(e) => setSearchedName(e.target.value)}
          />
        </Col>
      </Row>
    );
  };

  const ButtonGroup = () => {
    return (
      <div className="text-right mb-4">
        <Button
          className="btn btn-success mr-2"
          onClick={() => getSupplierList()}
        >
          {`${STRING.search}/搜索`}
        </Button>
        <Button
          className="btn btn-secondary"
          onClick={() => {
            clearSearching();
          }}
        >
          {`${STRING.deleteSearching}/删除搜寻`}
        </Button>
        {/* <Button
          className="btn btn-warning"
          onClick={() => {
            const counter = countNumberOfElementIsChecked(checkItemList);
            if (counter < 1) {
              notifyFail("Vui lòng chọn 1 nhà cung cấp để sửa!");
              return;
            }
            if (counter > 1) {
              notifyFail("Chỉ được sửa 1 nhà cung cấp!");
              return;
            }
            setShouldAddItem(false);
            setIsModalVisible(true);
          }}
        >
          {STRING.edit}
        </Button> */}
      </div>
    );
  };

  const ModalAddEdit = () => {
    // let index = checkItemList.findIndex((item) => item === true);
    let value = supplierData ? supplierData[chosenIndex] : null;

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

    const chosenValues = {
      supplierCode: value?.code || "",
      supplierName: value?.name || "",
      email: value?.email || "",
      tax: value?.tax || "",
      phoneNumber: value?.phoneNumber || "",
      dateOfCompanyRegistration: value?.registrationDate
        ? Moment(value?.registrationDate).format("DD/MM/YYYY")
        : "",
      productCertification:
        value?.certificateProduct === -1 ? 0 : value?.certificateProduct,
      fax: value?.fax || "",
      representative: value?.representative || "",
      contactPerson: value?.contact || "",
      contactPersonPhone: value?.contactPhoneNumber || "",
      officeAddress: value?.officeAddress || "",
      contactAddress: value?.address || "",
      productType: value?.productType || "",
      constructType: value?.contructionType || "",
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
      fax: Yup.string().max(15),
      // .required("Fax không được để trống!"),
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
        .matches(vnf_regex, "Nhập sai định dạng"),
      // .required("Số điện thoại liên hệ không được để trống!"),
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

    const validationSchemaToEdit = Yup.object().shape({
      supplierCode: Yup.string().required(
        "Mã nhà cung cấp không được để trống!"
      ),
      supplierName: Yup.string().required(
        "Tên nhà cung cấp không được để trống!"
      ),
      email: Yup.string().email("Sai định dạng mail (Vd: @gmail.com)"),
      // .required("Email không được để trống!"),
      tax: Yup.string().required("Mã số thuế không được để trống!"),
      phoneNumber: Yup.string()
        .matches(vnf_regex, "Sai định dạng số điện thoại Viêt Nam")
        .min(10)
        .required("Số điện thoại nhà cung cấp không được để trống!"),
      // productCertification: Yup.number().required(
      //   "Chứng nhận sản phẩm không được để trống"
      // ),
      fax: Yup.string().max(15),
      // .required("Fax không được để trống!"),
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
        .matches(vnf_regex, "Sai định dạng số điện thoại Viêt Nam")
        .min(10),
      // .required("Số điện thoại liên hệ không được để trống!"),
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
          initialValues={shouldAddItem ? initialValues : chosenValues}
          onSubmit={async (values) => {
            try {
              // setIsLoading(true);
              if (shouldAddItem) {
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
              } else {
                const payload = {
                  id: value.id,
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
                await updateSupplier(payload);
              }
              notifySuccess(STRING.success);
              getSupplierList();
              setIsModalVisible(false);
            } catch (error) {
              // setIsLoading(false);
              // getSupplierList();
              // setIsModalVisible(false);
              notifyFail(STRING.fail);
            }
          }}
          validationSchema={
            shouldAddItem ? validationSchemaToAdd : validationSchemaToEdit
          }
        >
          {(formikProps) => {
            return (
              <Modal isOpen={isModalVisible} size="xl" toggle={toggle} centered>
                <Form>
                  <ModalHeader toggle={toggle}>
                    {shouldAddItem
                      ? "Thêm nhà cung cấp/添加供应商"
                      : "Sửa nhà cung cấp/维修供应商"}
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
                              <span>供应商代码</span>
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
                              <span>{STRING.supplierName}</span>
                              <span style={{ color: "red" }}> *</span>
                              <br />
                              <span>供应商名称</span>
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
                              <span>公司登記日期</span>
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
                              <span>接触</span>
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
                              <span>联系人的电话号码</span>
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
                      {`${STRING.save}/救`}
                    </Button>
                    <Button className="btn btn-secondary" onClick={toggle}>
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

  const DataTable = () => {
    return (
      <div className="card">
        <div className="card-body">
          <Table striped bordered hover responsive className="mb-3">
            <thead>
              <tr>
                {headerTable.map((item, index) => {
                  return item.title === "checkbox" ? (
                    <th key={index} className="text-center align-middle">
                      <input
                        type="checkbox"
                        checked={checkItemList.every(Boolean)}
                        onChange={() => onChangeCheckAllItem()}
                      />
                    </th>
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
              {supplierData?.length ? (
                supplierData.map((item, index) => {
                  return (
                    <tr key={index} style={{ cursor: "pointer" }}>
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {index + recordsPerPage * ((activePage || 1) - 1) + 1}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {item.code || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {item.name || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {item.phoneNumber || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {item.email || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {item.representative || "--"}
                      </td>
                      {/* <td className="text-center align-middle">
                        {item.tax || "--"}
                      </td> */}
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {item.address || "--"}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {item.createdBy || "--"}
                        <br />(
                        {item.createdDate
                          ? Moment(item.createdDate).format("hh:mm DD/MM/YYYY")
                          : "--:--"}
                        )
                        {/* {`${item.createdBy || "--"} (${
                          item.createdDate
                            ? Moment(item.createdDate).format(
                                "hh:mm DD/MM/YYYY"
                              )
                            : "--:--"
                        })`} */}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
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
                      <td className="text-center align-middle">
                        <input
                          type="checkbox"
                          checked={checkItemList[index]}
                          onChange={() => onChangeCheckItem(index)}
                        />
                      </td>
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

  const getSupplierList = async () => {
    try {
      setIsLoading(true);
      const res = await supplierList({
        str: searchedName.trim(),
        page: activePage,
      });
      setPaging({
        ...paging,
        totalItem: res?.data?.totalItem,
        totalPage: res?.data?.totalPage,
      });
      setSupplierData(res?.data?.list);
      let isCheckedItems = Array(res?.data?.list.length).fill(false);
      setCheckItemList(isCheckedItems);
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
      getSupplierList();
    }
  };

  const handleChangePage = (page) => {
    setActivePage(page);
  };

  const clearSearching = async () => {
    try {
      setIsLoading(true);
      setSearchedName("");
      const res = await supplierList({
        str: "",
        page: 1,
      });
      setSupplierData(res?.data?.list);
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
        idItemArr.push(supplierData[index].id);
      }
    });
    try {
      setIsLoading(true);
      let formData = new FormData();
      formData.append("listId", idItemArr.join());
      // const payload = {
      //   listId: idItemArr.join(),
      // };
      await deleteSupplier(formData);
      setConfirmModal(false);
      notifySuccess(STRING.success);
      getSupplierList();
    } catch (error) {
      setConfirmModal(false);
      notifyFail(STRING.fail);
      getSupplierList();
    }
  };

  return (
    <ScreenWrapper
      titleHeader={`${STRING.supplier}/供应商`}
      isLoading={isLoading}
      isError={isError}
      hasButton={true}
    >
      <HeaderButton />
      <>
        <ModalAddEdit />
        <ConfirmModal
          isOpen={confirmModal}
          onHide={() => setConfirmModal(false)}
          title={`${STRING.delete}/抹去 ${countNumberOfElementIsChecked(
            checkItemList
          )} nhà cung cấp/供应商`}
          action={() => onDeleteItem()}
        />
        <FilterField />
        <ButtonGroup />
        <DataTable />
      </>
    </ScreenWrapper>
  );
}

SupplierListScreen.propTypes = {};

export default SupplierListScreen;
