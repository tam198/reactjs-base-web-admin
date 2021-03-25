import { Col, Input, Row } from "antd";
import Button from "components/Button";
import ScreenWrapper from "components/ScreenWrapper";
import React, { useState, useEffect, useRef } from "react";
import { STRING } from "constants/Constant";
import { createConfig, configDetail } from "network/ConfigApi";
import { notifySuccess, notifyFail } from "utils/notify";
import { FastField, Formik, Form } from "formik";
import InputField from "components/InputField";
import * as Yup from "yup";

function ConfigScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [orderCode, setOrderCode] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    getOrderCode();
  }, []);

  // useEffect(() => inputRef?.current?.focus(), [orderCode]);

  const ConfigBody = () => {
    const initialValues = {
      code: orderCode,
    };
    const orderCode_regex = /^[A-Z]+[A-ZA-Z0-9]*$/g;
    // const vnf_regex = /^[A-ZA-Z0-9] | [A-ZA-Z]*$/g;
    const validationSchema = Yup.object().shape({
      code: Yup.string()
        .matches(
          orderCode_regex,
          "Mã đơn hàng phải viết hoa, không có ký tự đặc biệt và không full số!"
        )
        .required("Mã đơn hàng không được để trống!"),
    });

    return (
      <div className="card">
        <div className="card-body d-flex flex-column">
          <label>{STRING.orderCode}/代码顺序</label>
          <Formik
            initialValues={initialValues}
            onSubmit={(orderCode) => {
              createOrderCode(orderCode.code);
            }}
            validationSchema={validationSchema}
          >
            {(formikProps) => {
              return (
                <Form>
                  <Row gutter={16}>
                    <Col span={8}>
                      <FastField
                        component={InputField}
                        placeholder={STRING.orderCode}
                        name="code"
                      />
                    </Col>
                    <Col span={8}>
                      <Button
                        type="submit"
                        color="primary"
                        className="btn btn-success"
                        // onClick={() => createOrderCode()}
                      >
                        {STRING.save}/救
                      </Button>
                    </Col>
                  </Row>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    );
  };

  const getOrderCode = async () => {
    try {
      setIsLoading(true);
      const res = await configDetail();
      setOrderCode(res?.data?.code);
      setIsLoading(false);
    } catch (error) {}
  };

  const createOrderCode = async (orderCode) => {
    try {
      await createConfig({
        code: orderCode.trim(),
      });
      notifySuccess(STRING.success);
      const loading = setTimeout(() => getOrderCode(), 600);
      return () => clearTimeout(loading);
    } catch (error) {}
  };

  return (
    <ScreenWrapper
      titleHeader={`${STRING.config}/配置`}
      isLoading={isLoading}
      isError={isError}
    >
      <ConfigBody />
    </ScreenWrapper>
  );
}

ConfigScreen.propTypes = {};

export default ConfigScreen;
