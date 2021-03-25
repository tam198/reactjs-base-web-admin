import React from "react";
import PropTypes from "prop-types";
import { FormGroup, Label, Input } from "reactstrap";
import { Radio } from "antd";

RadioField.propTypes = {};

RadioField.defaultProps = {};

function RadioField(props) {
  const { field, label, placeholder, disabled, type, form, options } = props;
  const { name, value } = field;
  const { errors, touched } = form;
  const showError = errors[name] && touched[name];

  const selectedOption = value
    ? options.find((option) => option.value === value).value
    : options.find((option) => option.value === value);

  const handleSelectedOptionChange = (selectedOption) => {
    const selectedValue = selectedOption.target.value
      ? selectedOption.target.value
      : selectedOption;

    const changeEvent = {
      target: {
        name: name,
        value: selectedValue,
      },
    };
    field.onChange(changeEvent);
  };

  return (
    <FormGroup>
      {label && <Label for={name}>{label}</Label>}
      <Radio.Group
        id={name}
        {...field}
        onChange={handleSelectedOptionChange}
        value={selectedOption}
      >
        {options.length &&
          options.map((item, index) => {
            return (
              <Radio key={index} value={item.value}>
                {item.label}
              </Radio>
            );
          })}
      </Radio.Group>
      {/* <Input
        id={name}
        {...field}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        autocomplete={
          name === "username" || name === "password" ? "off" : "new-password"
        }
      /> */}
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

export default RadioField;
