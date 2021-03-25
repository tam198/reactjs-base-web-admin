import { Col, Input, Row, Select, Empty, notification } from "antd";
import Button from "components/Button";
import PaginationComponent from "components/PaginationComponent";
import ScreenWrapper from "components/ScreenWrapper";
import React, { useState, useEffect, useRef } from "react";
import { Table } from "react-bootstrap";
import ConfirmModal from "components/ConfirmModal";
import InputField from "components/InputField";
import SelectField from "components/SelectField";
import { STRING } from "constants/Constant";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { FastField, Form, Formik } from "formik";
import * as Yup from "yup";
import { setLocale } from "yup";
import {
  createUser,
  updateUser,
  deleteUser,
  userList,
  userDetail,
  resetPassword,
} from "network/AccountApi";
import { notifySuccess, notifyFail } from "utils/notify";
import Moment from "moment";

const { Option } = Select;

const headerTable = [
  { title: STRING.numericalOrder, chinese: "数值顺序" },
  { title: STRING.fullName, chinese: "全名" },
  { title: STRING.phoneNumber, chinese: "电话号码" },
  { title: STRING.email, chinese: "" },
  { title: STRING.status, chinese: "状态" },
  { title: STRING.createdDate, chinese: "创建日期" },
  { title: STRING.lastUpdatedDate, chinese: "最后更新日期" },
  { title: "checkbox", chinese: "" },
];

const statusList = [
  {
    value: 1,
    label: `${STRING.active}/活跃`,
  },
  {
    value: 2,
    label: `${STRING.inactive}/停止工作`,
  },
];

const recordsPerPage = 20;

function AccountListScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalResetPass, setIsModalResetPass] = useState(false);
  const [shouldAddItem, setShouldAddItem] = useState(true);
  const [userData, setUserData] = useState([]);
  const [checkItemList, setCheckItemList] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [searchedName, setSearchedName] = useState("");
  const [searchedStatus, setSearchedStatus] = useState();
  const [paging, setPaging] = useState({
    totalItem: 0,
    totalPage: 0,
  });
  const [confirmModal, setConfirmModal] = useState(false);
  const inputRef = useRef(null);

  const [chosenIndex, setChosenIndex] = useState(0);

  // useEffect(() => {
  //   getUserList();
  // }, []);

  useEffect(() => {
    getUserList();
  }, [activePage, searchedStatus]);

  // useEffect(() => {
  //   getUserList();
  // }, [searchedStatus]);

  useEffect(() => inputRef?.current?.focus(), [searchedName]);

  const toggle = () => {
    setIsModalVisible(!isModalVisible);
  };

  const toggleResetPass = () => {
    setIsModalResetPass(!isModalResetPass);
  };

  const HeaderButton = () => {
    return (
      <>
        <Button
          className="btn btn-link mr-2"
          onClick={() => {
            const counter = countNumberOfElementIsChecked(checkItemList);
            if (counter < 1) {
              notifyFail("Vui lòng chọn 1 tài khoản để reset mật khẩu!");
              return;
            }
            if (counter > 1) {
              notifyFail("Chỉ được reset mật khẩu 1 tài khoản!");
              return;
            }
            onResetPassword();
          }}
        >
          <u>Reset Password</u>
        </Button>
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
          {STRING.delete}/抹去
        </Button>
        <Button
          className="btn btn-primary"
          onClick={() => {
            setShouldAddItem(true);
            setIsModalVisible(true);
          }}
        >
          {STRING.addNew}/添新
        </Button>
      </>
    );
  };

  const FilterField = () => {
    return (
      <Row className="mb-4" gutter={16} justify="space-start">
        <Col span={8}>
          <Input
            placeholder="Tên, số điện thoại/姓名，电话号码"
            style={{ width: "100%" }}
            onKeyUp={onKeyUp}
            value={searchedName}
            ref={inputRef}
            onChange={(e) => setSearchedName(e.target.value)}
          />
        </Col>
        <Col span={8}>
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
            <Option value="1">{STRING.active}/活跃</Option>
            <Option value="2">{STRING.inactive}/停止工作</Option>
          </Select>
        </Col>
      </Row>
    );
  };

  const ButtonGroup = () => {
    return (
      <div className="text-right mb-4">
        <Button
          className="btn btn-success mr-2"
          onClick={() => {
            if (!searchedName && !searchedStatus) {
              notifyFail("Vui lòng điền thông tin tìm kiếm!");
              return;
            }
            getUserList();
          }}
        >
          {STRING.search}/搜索
        </Button>
        <Button className="btn btn-secondary" onClick={() => clearSearching()}>
          {STRING.deleteSearching}/删除搜寻
        </Button>
        {/* <Button
          className="btn btn-warning"
          onClick={() => {
            const counter = countNumberOfElementIsChecked(checkItemList);
            if (counter < 1) {
              notifyFail("Vui lòng chọn 1 tài khoản để sửa!");
              return;
            }
            if (counter > 1) {
              notifyFail("Chỉ được sửa 1 tài khoản!");
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
              {userData?.length ? (
                userData.map((item, index) => {
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
                        {item.username}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {item.phone || "--"}
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
                        style={
                          item.status === 1
                            ? { color: "green" }
                            : item.status === 2
                            ? { color: "orange" }
                            : { color: "red" }
                        }
                        onClick={() => {
                          setChosenIndex(index);
                          setShouldAddItem(false);
                          setIsModalVisible(true);
                        }}
                      >
                        {item.status === 1
                          ? STRING.active
                          : item.status === 2
                          ? STRING.inactive
                          : STRING.deleted}
                        <br />
                        {item.status === 1
                          ? "活跃"
                          : item.status === 2
                          ? "停止工作"
                          : STRING.deleted}
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
                  <td className="p-2" colSpan={8}>
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

  const ModalAddEdit = () => {
    // let index = checkItemList.findIndex((item) => item === true);
    let value = userData ? userData[chosenIndex] : null;

    const initialValues = {
      employeeName: "",
      phoneNumber: "",
      employeeMail: "",
      employeePassword: "",
      confirmPassword: "",
    };

    const chosenValues = {
      employeeName: value?.username,
      phoneNumber: value?.phone,
      employeeMail: value?.email,
      status: value?.status,
    };

    setLocale({
      string: {
        min: "Trường này phải có ít nhất ${min} kí tự!",
        max: "Trường này không được quá ${max} kí tự!",
      },
    });
    const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    const validationSchemaToAdd = Yup.object().shape({
      employeeName: Yup.string().required("Tên không được để trống!"),
      phoneNumber: Yup.string()
        .matches(vnf_regex, "Sai định dạng số điện thoại Viêt Nam")
        .min(10)
        .required("Số điện thoại không được để trống!"),
      employeeMail: Yup.string()
        .email("Sai định dạng mail (Vd: @gmail.com)")
        .required("Email không được để trống!"),
      employeePassword: Yup.string()
        .required("Mật khẩu không được để trống")
        .min(8)
        .max(25),
      confirmPassword: Yup.string()
        .required("Mật khẩu xác nhận không được để trống!")
        // .min(8)
        // .max(25)
        .when("employeePassword", {
          is: (val) => (val && val.length > 0 ? true : false),
          then: Yup.string().oneOf(
            [Yup.ref("employeePassword")],
            "Mật khẩu xác nhận chưa đúng!"
          ),
        }),
    });

    const validationSchemaToEdit = Yup.object().shape({
      employeeName: Yup.string().required("Tên không được để trống!"),
      phoneNumber: Yup.string()
        .matches(vnf_regex, "Sai định dạng số điện thoại Viêt Nam")
        .min(10)
        .required("Số điện thoại không được để trống!"),
      employeeMail: Yup.string()
        .email("Sai định dạng mail (Vd: @gmail.com)")
        .required("Email không được để trống!"),
      status: Yup.number().required("Trạng thái chưa được chọn!").nullable(),
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
                  userName: values.employeeName,
                  phoneNumber: values.phoneNumber,
                  email: values.employeeMail,
                  password: values.employeePassword,
                  confirmPassword: values.confirmPassword,
                };
                await createUser(payload);
              } else {
                const payload = {
                  id: value.id,
                  username: values.employeeName,
                  phoneNumber: values.phoneNumber,
                  email: values.employeeMail,
                  isActive: values.status,
                };
                await updateUser(payload);
              }
              getUserList();
              notifySuccess(STRING.success);
              toggle();
            } catch (error) {
              // notifyFail(STRING.fail);
              // setIsModalVisible(false);
              // getUserList();
            }
          }}
          validationSchema={
            shouldAddItem ? validationSchemaToAdd : validationSchemaToEdit
          }
        >
          {(formikProps) => {
            return (
              <Modal isOpen={isModalVisible} toggle={toggle} centered>
                <Form>
                  <ModalHeader toggle={toggle}>
                    {shouldAddItem
                      ? "Thêm tài khoản/更多帐户"
                      : "Sửa tài khoản/编辑帐户"}
                  </ModalHeader>
                  <ModalBody>
                    <FastField
                      component={InputField}
                      name="employeeName"
                      label="Tên nhân viên/员工姓名"
                      placeholder="Tên nhân viên"
                      type="text"
                      required={true}
                    />

                    <FastField
                      component={InputField}
                      name="phoneNumber"
                      label="Số điện thoại/电话号码"
                      placeholder="Số điện thoại"
                      type="tel"
                      required={true}
                    />

                    <FastField
                      component={InputField}
                      name="employeeMail"
                      label="Email"
                      placeholder="Email"
                      type="text"
                      required={true}
                    />

                    {shouldAddItem ? (
                      <>
                        <FastField
                          component={InputField}
                          name="employeePassword"
                          label="Mật khẩu/密码"
                          placeholder="Mật khẩu"
                          type="password"
                          required={true}
                        />

                        <FastField
                          component={InputField}
                          name="confirmPassword"
                          label="Xác nhận mật khẩu/确认密码"
                          placeholder="Xác nhận mật khẩu"
                          type="password"
                          required={true}
                        />
                      </>
                    ) : (
                      <FastField
                        name="status"
                        component={SelectField}
                        label="Trạng thái/状态"
                        placeholder="Trạng thái"
                        options={statusList}
                        required={true}
                      />
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button type="submit" className="btn btn-primary">
                      {STRING.save}/救
                    </Button>
                    <Button className="btn btn-secondary" onClick={toggle}>
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

  // const ModalResetPass = () => {
  //   let index = checkItemList.findIndex((item) => item === true);
  //   let value = userList[index];

  //   const initialValues = {
  //     oldPassword: "",
  //     newPassword: "",
  //     confirmPassword: "",
  //   };

  //   const validationSchema = Yup.object().shape({
  //     oldPassword: Yup.string().required("Mật khẩu cũ không được để trống!"),
  //     newPassword: Yup.string().required("Mật khẩu mới không được để trống!"),
  //     confirmPassword: Yup.string()
  //       .required("Mật khẩu xác nhận không được để trống!")
  //       .when("password", {
  //         is: (val) => (val && val.length > 0 ? true : false),
  //         then: Yup.string().oneOf(
  //           [Yup.ref("password")],
  //           "Mật khẩu xác nhận chưa đúng!"
  //         ),
  //       }),
  //   });

  //   return (
  //     <div>
  //       <Formik
  //         initialValues={initialValues}
  //         onSubmit={(values) => {
  //           try {
  //           } catch (error) {
  //             notifyFail(STRING.fail);
  //           }
  //         }}
  //         validationSchema={validationSchema}
  //       >
  //         {(formikProps) => {
  //           return (
  //             <Modal
  //               isOpen={isModalResetPass}
  //               toggle={toggleResetPass}
  //               centered
  //             >
  //               <Form>
  //                 <ModalHeader toggle={toggleResetPass}>
  //                   {STRING.changePassword}
  //                 </ModalHeader>
  //                 <ModalBody>
  //                   <FastField
  //                     component={InputField}
  //                     name="oldPassword"
  //                     label="Mật khẩu cũ"
  //                     placeholder="Mật khẩu cũ"
  //                     type="password"
  //                   />

  //                   <FastField
  //                     component={InputField}
  //                     name="newPassword"
  //                     label="Mật khẩu mới"
  //                     placeholder="Mật khẩu mới"
  //                     type="password"
  //                   />

  //                   <FastField
  //                     component={InputField}
  //                     name="confirmPassword"
  //                     label="Xác nhận mật khẩu"
  //                     placeholder="Xác nhận mật khẩu"
  //                     type="password"
  //                   />
  //                 </ModalBody>
  //                 <ModalFooter>
  //                   <Button
  //                     className="btn btn-secondary"
  //                     onClick={toggleResetPass}
  //                   >
  //                     {STRING.cancel}
  //                   </Button>
  //                   <Button type="submit" className="btn btn-primary">
  //                     {STRING.save}
  //                   </Button>
  //                 </ModalFooter>
  //               </Form>
  //             </Modal>
  //           );
  //         }}
  //       </Formik>
  //     </div>
  //   );
  // };

  const getUserList = async () => {
    try {
      setIsLoading(true);
      const payload = {
        nameOrPhone: searchedName.trim(),
        role: -1,
        isActive: searchedStatus ? searchedStatus : -1,
        page: activePage,
      };
      const res = await userList(payload);
      setPaging({
        ...paging,
        totalItem: res?.data?.totalItem,
        totalPage: res?.data?.totalPage,
      });
      setUserData(res?.data?.list);
      let isCheckedItems = Array(res?.data?.list.length).fill(false);
      setCheckItemList(isCheckedItems);
      setIsLoading(false);
    } catch (error) {
      notifyFail(STRING.fail);
    }
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
      getUserList();
    }
  };

  const handleChangePage = (page) => {
    setActivePage(page);
  };

  const clearSearching = async () => {
    try {
      setIsLoading(true);
      setSearchedName("");
      setSearchedStatus();
      const res = await userList({
        nameOrPhone: "",
        role: -1,
        isActive: -1,
        page: 1,
      });
      setUserData(res?.data?.list);
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
        idItemArr.push(userData[index].id);
      }
    });
    try {
      // setIsLoading(true);
      let formData = new FormData();
      formData.append("listId", idItemArr.join());
      // const payload = {
      //   listId: idItemArr.join(),
      // };
      await deleteUser(formData);
      setConfirmModal(false);
      notifySuccess(STRING.success);
      getUserList();
    } catch (error) {
      // setConfirmModal(false);
      // notifyFail(STRING.fail);
      // getUserList();
    }
  };

  const onResetPassword = async () => {
    let index = checkItemList.findIndex((item) => item === true);
    let value = userData[index];
    try {
      setIsLoading(true);
      let formData = new FormData();
      formData.append("Id", value.id);
      await resetPassword(formData);
      notifySuccess("Mật khẩu đã được đưa về mặc định là số điện thoại!");
      getUserList();
    } catch (error) {}
  };

  return (
    <ScreenWrapper
      titleHeader={`${STRING.account}/帐户`}
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
          )} tài khoản/帐户`}
          action={() => onDeleteItem()}
        />
        {/* <ModalResetPass /> */}
        <FilterField />
        <ButtonGroup />
        <DataTable />
      </>
    </ScreenWrapper>
  );
}

AccountListScreen.propTypes = {};

export default AccountListScreen;
