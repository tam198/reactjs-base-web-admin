import React, { Component } from "react";

class Card extends Component {
  render() {
    const { headerTitle, background } = this.props;
    return (
      <div className={`card ${background && "card-primary"}`}>
        {headerTitle && (
          <div className="card-header">
            <h3 className="card-title">{headerTitle}</h3>
          </div>
        )}
        <div className="card-body">{this.props.children}</div>
      </div>
    );
  }
}
export default Card;
