import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FormGroup, Label, Row, Col } from "reactstrap";
import { DatePicker, Space } from "antd";
import Moment from "moment";
import { ConsoleSqlOutlined } from "@ant-design/icons";

SubDatePickerField.propTypes = {};

SubDatePickerField.defaultProps = {};

function SubDatePickerField(props) {
  const [dateValue, setDateValue] = useState("");
  const { field, label, placeholder, disabled, form } = props;
  const { name, value } = field;

  const formattedDate = Moment(value, "DD/MM/YYYY");

  const { errors, touched, setFieldValue } = form;
  const showError = errors[name] && touched[name];

  // useEffect(() => {
  //   if (value) {
  //     setDateValue(Moment(value).format("DD/MM/YYYY"))
  //   }
  // }, []);

  const onChangeDate = (date, dateString) => {
    const selectedValue = dateString ? dateString : "";
    setFieldValue(name, selectedValue);
    // const changeEvent = {
    //   target: {
    //     name: name,
    //     value: selectedValue,
    //   },
    // };
    // field.onChange(changeEvent);
  };

  return (
    <FormGroup>
      {label && <Label for={name}>{label}</Label>}
      <DatePicker
        // defaultValue={
        //   value ? Moment(value).format("DD/MM/YYYY").toString() : Moment('20/12/2021', "DD/MM/YYYY")
        // }
        defaultValue={value ? Moment(value, "DD/MM/YYYY") : null}
        id={name}
        // {...field}
        name={name}
        style={{ width: "100%" }}
        format="DD/MM/YYYY"
        // disabledDate={(d) => !d || d.isAfter(Moment())}
        onChange={onChangeDate}
        placeholder={placeholder}
      />
      {showError && (
        <p
          style={{
            color: "red",
          }}
        >
          {errors[name]}
        </p>
      )}
    </FormGroup>
  );
}

export default SubDatePickerField;
