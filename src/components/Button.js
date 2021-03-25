import React from "react";
import PropTypes from "prop-types";

function Button(props) {
  const { className, onClick, children, type } = props;
  return (
    <button type={type} className={className} onClick={onClick}>
      {children}
    </button>
  );
}

Button.propTypes = {};

export default Button;
