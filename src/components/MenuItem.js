import React, { Component } from "react";
import { NavLink, Link, useRouteMatch } from "react-router-dom";

class MenuItem extends Component {
  //

  render() {
    const { data } = this.props;
    // return <h1>this.props.data</h1>;
    return (
      <ul
        className="nav nav-pills nav-sidebar flex-column"
        data-widget="treeview"
        role="menu"
        data-accordion="false"
      >
        {data.map((item, index) => {
          if (item.children != null) {
            return (
              <li className="nav-item has-treeview" key={index}>
                <a href="#" className="nav-link">
                  <i className={`nav-icon ${item.icon}`} />
                  <p
                    style={{
                      marginLeft: "0.2rem",
                    }}
                  >
                    {item.name}
                    <i className="right fas fa-angle-left" />
                  </p>
                </a>
                <ul className="nav nav-treeview">
                  {item.children.map((child) => {
                    return (
                      <li className="nav-item">
                        <NavLink
                          className="nav-link"
                          to={child.path}
                          activeClassName="active"
                        >
                          <i className={`nav-icon ${child.icon}`} />
                          <p
                            style={{
                              marginLeft: "0.2rem",
                            }}
                          >
                            {child.name}
                          </p>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          } else
            return (
              <li className="nav-item" key={index}>
                <NavLink
                  className="nav-link"
                  to={item.path}
                  activeClassName="active"
                >
                  <i className={`nav-icon ${item.icon}`} />
                  <p
                    style={{
                      marginLeft: "0.2rem",
                    }}
                  >
                    {item.name}
                  </p>
                  {item.badge && (
                    <span className="right badge badge-danger">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
        })}
      </ul>
    );
  }
}

export default MenuItem;
