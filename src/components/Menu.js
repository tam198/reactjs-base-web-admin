import React, { Component } from "react";
import { NavLink, Link, useRouteMatch } from "react-router-dom";
import MockData from "constants/MockData.json";
import MenuItem from "./MenuItem.js";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { FastField, Form, Formik } from "formik";
import * as Yup from "yup";
import InputField from "components/InputField";
import SelectField from "components/SelectField";
import { STRING } from "constants/Constant";
import { notifySuccess, notifyFail } from "utils/notify";
import Button from "components/Button";

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      isModalResetPass: false,
    };
  }

  toggleResetPass() {
    this.setState({
      ...this.state,
      isModalResetPass: !this.state.isModalResetPass,
    });
  }

  componentDidMount() {
    this.setState({
      ...this.state,
      userName: localStorage.getItem("userName"),
    });
  }

  ModalResetPass() {
    const initialValues = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    const validationSchema = Yup.object().shape({
      oldPassword: Yup.string().required("Mật khẩu cũ không được để trống!"),
      newPassword: Yup.string().required("Mật khẩu mới không được để trống!"),
      confirmPassword: Yup.string()
        .required("Mật khẩu xác nhận không được để trống!")
        .when("password", {
          is: (val) => (val && val.length > 0 ? true : false),
          then: Yup.string().oneOf(
            [Yup.ref("password")],
            "Mật khẩu xác nhận chưa đúng!"
          ),
        }),
    });

    return (
      <div>
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            try {
              console.log(values, "values reset");
            } catch (error) {
              notifyFail(STRING.fail);
            }
          }}
          validationSchema={validationSchema}
        >
          {(formikProps) => {
            return (
              <Modal
                isOpen={this.state.isModalResetPass}
                toggle={this.toggleResetPass}
                centered
              >
                <Form>
                  <ModalHeader toggle={this.toggleResetPass}>
                    {STRING.changePassword}
                  </ModalHeader>
                  <ModalBody>
                    <FastField
                      component={InputField}
                      name="oldPassword"
                      label="Mật khẩu cũ"
                      placeholder="Mật khẩu cũ"
                      type="password"
                    />

                    <FastField
                      component={InputField}
                      name="newPassword"
                      label="Mật khẩu mới"
                      placeholder="Mật khẩu mới"
                      type="password"
                    />

                    <FastField
                      component={InputField}
                      name="confirmPassword"
                      label="Xác nhận mật khẩu"
                      placeholder="Xác nhận mật khẩu"
                      type="password"
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      className="btn btn-secondary"
                      onClick={this.toggleResetPass}
                    >
                      {STRING.cancel}
                    </Button>
                    <Button type="submit" className="btn btn-primary">
                      {STRING.save}
                    </Button>
                  </ModalFooter>
                </Form>
              </Modal>
            );
          }}
        </Formik>
      </div>
    );
  }
  render() {
    return (
      <div>
        {this.ModalResetPass()}
        <aside className="main-sidebar sidebar-light-lightblue elevation-4 me-sidebar">
          {/* Brand Logo */}
          <a className="brand-link">
            <img
              src="/images/system/iconWebAdmin.jpg"
              alt="App-logo"
              className="brand-image img-circle elevation-3"
            />
            <span className="brand-text font-weight-light">
              <b>Quản lý đơn hàng</b>
            </span>
          </a>
          {/* Sidebar */}
          <div className="sidebar">
            {/* <div className="user-panel mt-3 pb-3 mb-3 d-flex justify-content-center">
              <div className="image">
                <img
                  src="dist/img/user2-160x160.jpg"
                  // src="/images/system/img_avatar.jpg"
                  className="img-circle elevation-2"
                  alt="User Image"
                />
              </div>
              <div className="info">
                <a href="#" className="d-block">
                  {localStorage.getItem("userName")}
                </a>
              </div>
            </div> */}
            {/* Sidebar Menu */}
            <nav className="mt-2">
              {/* <ul
                className="nav nav-pills nav-sidebar flex-column nav-flat"
                data-widget="treeview"
                role="menu"
                data-accordion="false"
              > */}
              <MenuItem data={MockData.menus} />
              {/* <li className="nav-header">MISCELLANEOUS</li>

                <li className="nav-item">
                  <a href="https://adminlte.io/docs/3.0" className="nav-link">
                    <i className="nav-icon fas fa-file" />
                    <p>Documentation</p>
                  </a>
                </li>
              </ul> */}
            </nav>
            {/* /.sidebar-menu */}
          </div>
          {/* /.sidebar */}
        </aside>
      </div>
    );
  }
}
export default Menu;
