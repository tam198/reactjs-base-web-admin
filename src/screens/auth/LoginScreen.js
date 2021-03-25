import React, { Component } from "react";
import { NavLink, Link, useRouteMatch } from "react-router-dom";
import InputField from "components/InputField";
import { Input, Button } from "reactstrap";
import Card from "components/Card";
import { FastField, Formik, Form } from "formik";
import * as Yup from "yup";
import { accountApi } from "network/AccountApi";
import Cookie from "js-cookie";
import { setLocale } from "yup";
import { notifyFail } from "utils/notify";

class LoginScreen extends Component {
  state = {
    isLoading: true,
  };

  _login = async (values) => {
    try {
      const payload = {
        PhoneNumber: values.username,
        Password: values.password,
      };
      const res = await accountApi.login(payload);

      Cookie.set("SESSION_ID", res.data.token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
      });

      localStorage.setItem("userName", res.data.username);
      localStorage.setItem("userId", res.data.id);
      this.props.history.push("/don-hang");
    } catch (error) {
      // notifyFail("Không có kết nối internet");
    }
  };

  render() {
    const initialValues = {
      username: "", // admin
      password: "", // admin
    };
    setLocale({
      string: {
        min: "Mật khẩu phải có ít nhất ${min} kí tự!",
      },
    });
    const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    const validationSchema = Yup.object().shape({
      username: Yup.string()
        .matches(vnf_regex, "Sai định dạng số điện thoại Viêt Nam")
        .required("Tài khoản không được để trống"),
      password: Yup.string().min(8).required("Nhập mật khẩu"),
    });
    return (
      <div className="login-page">
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            this._login(values);
            // this.props.history.push("/overview");
          }}
          validationSchema={validationSchema}
        >
          {(formikProps) => {
            const { values, errors, touched } = formikProps;
            return (
              <Form className="login-box">
                <Card headerTitle="Đăng nhập/登录" background={true}>
                  <FastField
                    component={InputField}
                    name="username"
                    label="Tài khoản/帐户"
                    placeholder="Số điện thoại"
                    required={true}
                  />
                  <FastField
                    component={InputField}
                    name="password"
                    label="Mật khẩu/密码"
                    placeholder="Mật khẩu"
                    type="password"
                    required={true}
                  />
                  <div className="d-flex justify-content-center">
                    <Button
                      type="submit"
                      color="primary"
                      style={{ minWidth: "150px" }}
                    >
                      Đăng nhập/登录
                    </Button>
                  </div>
                </Card>
              </Form>
            );
          }}
        </Formik>
      </div>
    );
  }
}

export default LoginScreen;
