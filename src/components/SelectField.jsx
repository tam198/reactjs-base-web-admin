import PropTypes from "prop-types";
import React from "react";
import Select from "react-select";
import { FormGroup, Label, Row, Col } from "reactstrap";

SelectField.propTypes = {
  field: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,

  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  options: PropTypes.array,
};

SelectField.defaultProps = {
  label: "",
  placeholder: "",
  disabled: false,
  options: [],
};

function SelectField(props) {
  const {
    field,
    options,
    label,
    placeholder,
    disabled,
    form,
    required,
  } = props;
  const { name, value } = field;
  const selectedOption = options.find((option) => option.value === value);

  const handleSelectedOptionChange = (selectedOption) => {
    const selectedValue = selectedOption
      ? selectedOption.value
      : selectedOption;

    const changeEvent = {
      target: {
        name: name,
        value: selectedValue,
      },
    };
    field.onChange(changeEvent);
  };
  const { errors, touched } = form;
  const showError = errors[name] && touched[name];

  return (
    <FormGroup>
      {label && (
        <Label for={name}>
          {label} {required && <span style={{ color: "red" }}> *</span>}
        </Label>
      )}
      <Select
        id={name}
        {...field}
        value={selectedOption}
        onChange={handleSelectedOptionChange}
        placeholder={placeholder}
        isDisabled={disabled}
        options={options}
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

export default SelectField;
