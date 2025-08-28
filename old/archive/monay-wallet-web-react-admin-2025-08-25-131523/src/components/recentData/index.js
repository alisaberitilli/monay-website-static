import React, { Component } from 'react'
import ApiEndPoints from '../../utilities/apiEndPoints'
import logger from '../../utilities/logger'
import APIrequest from '../../services'
import { phoneNumberFormatter } from '../../utilities/common'
import textMessages from '../../utilities/messages'
export default class RecentData extends Component {

  constructor(props) {
    super(props)
    this.state = {
      // recentMerchantsData: [],
      recentUsersData: []
    }
  }

  componentDidMount() {
    this.loadRecentUserData()
  }

  loadRecentUserData = async () => {
    try {
      let queryParams = {
        offset: 0,
        limit: 5,
        userType: this.props.type
      }
      const payload = {
        ...ApiEndPoints.getUser,
        queryParams
      }
      const res = await APIrequest(payload)
      this.setState({
        recentUsersData: res.data.rows
      })
    } catch (error) {
      logger({ 'error:': error })
    }
  };


  render() {

    const { path, title, type } = this.props
    const { recentUsersData } = this.state

    return (
      <>
        <div className="common-table mb-md-0 mb-3">
          <div className="page-title-row pt-3 pr-3 pl-3 ">
            <div className="left-side">
              <h1 className="page-title text-capitalize">
                {title}
              </h1>
            </div>
            <div className="right-side font-sm">
              <a href={path}><i className="fa fa-file-excel-o" aria-hidden="true"></i>View All</a>
            </div>
          </div>
          <div className="table-responsive">
            {(type === 'user') ?
              <table className="table">
                <thead>
                  <tr>
                    <th className="w_70">{this.props.t('common.sNo')}</th>
                    <th><span>{this.props.t('common.name')}</span></th>
                    <th><span>{this.props.t('common.phoneNumber')}</span></th>
                  </tr>
                </thead>
                <tbody id="airlineList">
                  {!recentUsersData.length ?
                    <tr>
                      <td colSpan='3' className="text-center">{textMessages.noDataFound}</td></tr> :
                    recentUsersData && recentUsersData.map((item, index) => {
                      return (
                        <tr key={`user${index}`}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="info">
                              <div className="userImg">
                                <img src={item.profilePictureUrl} className="rounded-circle" alt="user img" />
                              </div>
                              {(item.firstName || item.email) ?
                                <div className="details">
                                  <span className="font-sm text-capitalize userName">{`${item.firstName} ${item.lastName}`}</span>
                                  <span>{item.email}</span>
                                </div>
                                :
                                <div>-</div>
                              }
                            </div>
                          </td>
                          <td>{phoneNumberFormatter(null, item)}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
              :
              <table className="table">
                <thead>
                  <tr>
                    <th className="w_70">{this.props.t('common.sNo')}</th>
                    <th><span>{this.props.t('common.name')}</span></th>
                    <th><span>{this.props.t('common.phoneNumber')}</span></th>
                    <th><span>{this.props.t('merchant.companyName')}</span></th>
                  </tr>
                </thead>
                <tbody id="airlineList">
                  {!recentUsersData.length ?
                    <tr>
                      <td colSpan='4' className="text-center">{textMessages.noDataFound}</td></tr> :
                    recentUsersData && recentUsersData.map((item, index) => {
                      return (
                        <tr key={`merchant${index}`}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="info">
                              <div className="userImg">
                                <img src={item.profilePictureUrl} className="rounded-circle" alt="user img" />
                              </div>
                              {(item.firstName || item.email) ?
                                <div className="details">
                                  <span className="font-sm text-capitalize userName">{`${item.firstName} ${item.lastName}`}</span>
                                  <span>{item.email}</span>
                                </div>
                                :
                                <div>-</div>
                              }
                            </div>
                          </td>
                          <td>{phoneNumberFormatter(null, item)}</td>
                          <td>{item.companyName}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            }
          </div>
        </div>
      </>
    )
  }
}

