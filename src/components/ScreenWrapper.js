import React, { Component } from "react";
import Loading from "./Loading";
import ScreenError from "./ScreenError";

export default class ScreenWrapper extends Component {
  render() {
    const {
      titleHeader,
      isLoading,
      isError,
      isEmpty,
      back,
      renderHeader,
      renderFooter,
      paging,
      hasButton,
      detail,
      context,
    } = this.props;

    // {activePage, action, totalItemsCount, itemCountPerPage }

    if (isLoading)
      return (
        <div className="content-wrapper">
          <Loading />
        </div>
      );

    if (isError) {
      return <ScreenError />;
    }

    return (
      <div className="content-wrapper">
        {titleHeader && (
          <div className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  {!detail ? (
                    <h1 className="m-0 text-dark">{titleHeader}</h1>
                  ) : (
                    <h1
                      className="header header--detail"
                      style={{ cursor: "pointer" }}
                      onClick={() => context.history.goBack(-1)}
                    >
                      <i class="fas fa-chevron-left"></i>
                      {titleHeader}
                    </h1>
                  )}
                </div>
                <div className="col-sm-6 text-right">
                  {this.props.hasButton && this.props.children[0]}
                </div>
              </div>
            </div>
          </div>
        )}
        <section className="content pb-5">
          <div className="container-fluid">
            {this.props.hasButton
              ? this.props.children[1]
              : this.props.children}
          </div>
        </section>
      </div>
    );
  }
}
