import React, { Component } from "react";
import Cookie from "js-cookie";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { FastField, Form, Formik } from "formik";
import * as Yup from "yup";
import InputField from "components/InputField";
import SelectField from "components/SelectField";
import { STRING } from "constants/Constant";
import { notifySuccess, notifyFail } from "utils/notify";
import Button from "components/Button";
import { setLocale } from "yup";
import { changePassword } from "network/AccountApi";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalResetPass: false,
    };
    this.toggleResetPass = this.toggleResetPass.bind(this);
  }

  toggleResetPass() {
    this.setState({
      ...this.state,
      isModalResetPass: !this.state.isModalResetPass,
    });
  }

  ModalResetPass() {
    const initialValues = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    setLocale({
      string: {
        min: "Mật khẩu phải có ít nhất ${min} kí tự!",
      },
    });

    const validationSchema = Yup.object().shape({
      oldPassword: Yup.string().required("Mật khẩu cũ không được để trống!"),
      newPassword: Yup.string()
        .min(8)
        .required("Mật khẩu mới không được để trống!"),
      confirmPassword: Yup.string()
        .required("Mật khẩu xác nhận không được để trống!")
        .when("newPassword", {
          is: (val) => (val && val.length > 0 ? true : false),
          then: Yup.string().oneOf(
            [Yup.ref("newPassword")],
            "Mật khẩu xác nhận chưa đúng!"
          ),
        }),
    });

    return (
      <div>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => {
            try {
              let formData = new FormData();
              formData.append("ID", localStorage.getItem("userId"));
              formData.append("Password", values.oldPassword);
              formData.append("ConfirmPassword", values.newPassword);
              await changePassword(formData);
              notifySuccess(STRING.success);
              this.setState({
                ...this.state,
                isModalResetPass: false,
              });
            } catch (error) {}
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
                    <br />
                    更改密码
                  </ModalHeader>
                  <ModalBody>
                    <FastField
                      component={InputField}
                      name="oldPassword"
                      label="Mật khẩu cũ/旧密码"
                      placeholder="Mật khẩu cũ"
                      type="password"
                      required={true}
                    />

                    <FastField
                      component={InputField}
                      name="newPassword"
                      label="Mật khẩu mới/新密码"
                      placeholder="Mật khẩu mới"
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
                  </ModalBody>
                  <ModalFooter>
                    <Button type="submit" className="btn btn-primary">
                      {STRING.save}/救
                    </Button>
                    <Button
                      className="btn btn-secondary"
                      onClick={this.toggleResetPass}
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
  }
  render() {
    return (
      <div>
        {this.ModalResetPass()}
        <nav className="main-header navbar navbar-expand navbar-white navbar-light">
          {/* Left navbar links */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                className="nav-link"
                data-widget="pushmenu"
                href="#"
                role="button"
              >
                <i className="fas fa-bars" />
              </a>
            </li>
            {/* <li className="nav-item d-none d-sm-inline-block">
              <a className="nav-link">Home</a>
            </li> */}
          </ul>
          {/* SEARCH FORM */}
          {/* <form className="form-inline ml-3">
            <div className="input-group input-group-sm">
              <input
                className="form-control form-control-navbar"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <div className="input-group-append">
                <button className="btn btn-navbar" type="submit">
                  <i className="fas fa-search" />
                </button>
              </div>
            </div>
          </form> */}
          {/* Right navbar links */}
          <ul className="navbar-nav ml-auto">
            {/* <li className="nav-item dropdown">
              <a className="nav-link" data-toggle="dropdown" href="#">
                <i className="far fa-comments" />
                <span className="badge badge-danger navbar-badge">3</span>
              </a>
              <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                <a href="#" className="dropdown-item">
                  <div className="media">
                    <img
                      src="dist/img/user1-128x128.jpg"
                      alt="User Avatar"
                      className="img-size-50 mr-3 img-circle"
                    />
                    <div className="media-body">
                      <h3 className="dropdown-item-title">
                        Brad Diesel
                        <span className="float-right text-sm text-danger">
                          <i className="fas fa-star" />
                        </span>
                      </h3>
                      <p className="text-sm">Call me whenever you can...</p>
                      <p className="text-sm text-muted">
                        <i className="far fa-clock mr-1" /> 4 Hours Ago
                      </p>
                    </div>
                  </div>
                </a>
                <div className="dropdown-divider" />
                <a href="#" className="dropdown-item">
                  <div className="media">
                    <img
                      src="dist/img/user8-128x128.jpg"
                      alt="User Avatar"
                      className="img-size-50 img-circle mr-3"
                    />
                    <div className="media-body">
                      <h3 className="dropdown-item-title">
                        John Pierce
                        <span className="float-right text-sm text-muted">
                          <i className="fas fa-star" />
                        </span>
                      </h3>
                      <p className="text-sm">I got your message bro</p>
                      <p className="text-sm text-muted">
                        <i className="far fa-clock mr-1" /> 4 Hours Ago
                      </p>
                    </div>
                  </div>
                </a>
                <div className="dropdown-divider" />
                <a href="#" className="dropdown-item">
                  <div className="media">
                    <img
                      src="dist/img/user3-128x128.jpg"
                      alt="User Avatar"
                      className="img-size-50 img-circle mr-3"
                    />
                    <div className="media-body">
                      <h3 className="dropdown-item-title">
                        Nora Silvester
                        <span className="float-right text-sm text-warning">
                          <i className="fas fa-star" />
                        </span>
                      </h3>
                      <p className="text-sm">The subject goes here</p>
                      <p className="text-sm text-muted">
                        <i className="far fa-clock mr-1" /> 4 Hours Ago
                      </p>
                    </div>
                  </div>
                </a>
                <div className="dropdown-divider" />
                <a href="#" className="dropdown-item dropdown-footer">
                  See All Messages
                </a>
              </div>
            </li> */}
            {/* <li className="nav-item dropdown">
              <a className="nav-link" data-toggle="dropdown" href="#">
                <i className="far fa-bell" />
                <span className="badge badge-warning navbar-badge">15</span>
              </a>
              <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                <span className="dropdown-item dropdown-header">
                  15 Notifications
                </span>
                <div className="dropdown-divider" />
                <a href="#" className="dropdown-item">
                  <i className="fas fa-envelope mr-2" /> 4 new messages
                  <span className="float-right text-muted text-sm">3 mins</span>
                </a>
                <div className="dropdown-divider" />
                <a href="#" className="dropdown-item">
                  <i className="fas fa-users mr-2" /> 8 friend requests
                  <span className="float-right text-muted text-sm">
                    12 hours
                  </span>
                </a>
                <div className="dropdown-divider" />
                <a href="#" className="dropdown-item">
                  <i className="fas fa-file mr-2" /> 3 new reports
                  <span className="float-right text-muted text-sm">2 days</span>
                </a>
                <div className="dropdown-divider" />
                <a href="#" className="dropdown-item dropdown-footer">
                  See All Notifications
                </a>
              </div>
            </li> */}
            <li className="nav-item dropdown d-flex align-items-center">
              <label>{localStorage.getItem("userName")}</label>
              <>
                <div data-toggle="dropdown">
                  {/* <img src={avatar} alt="avatar" className="img--avatar mx-4" /> */}
                  <a className="nav-link " href="thong-bao">
                    <i
                      className="far fa-user icon--bell"
                      style={{ fontSize: 16 }}
                    ></i>
                  </a>
                </div>
                <div
                  className="dropdown-menu dropdown-menu-lg dropdown-menu-right m-2"
                  style={{ minWidth: 250 }}
                >
                  <a
                    className="dropdown-item cursor menu-hover"
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      // this.setShowModal(true);
                    }}
                  >
                    <div
                      className="dropdown--admin__item row"
                      onClick={this.toggleResetPass}
                    >
                      <i className="fas fa-key ml-3 mr-2 header--menu__icon" />
                      <p className="me-txt-admin-drop">Đổi mật khẩu/更改密码</p>
                    </div>
                  </a>
                  <a
                    className="dropdown-item cursor menu-hover"
                    href="dang-nhap"
                    onClick={() => {
                      Cookie.remove("SESSION_ID");
                      localStorage.clear();
                      window.location.href = "/dang-nhap";
                    }}
                  >
                    <div className="dropdown--admin__item row">
                      <i className="fas fa-sign-out-alt ml-3 mr-2 header--menu__icon" />
                      <p className="me-txt-admin-drop">Đăng xuất/登出</p>
                    </div>
                  </a>
                </div>
              </>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

export default Header;
