import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import BreadCrumb from '../../components/breadCrumb'
import MetaTags from '../../utilities/metaTags'
import config from '../../config'
import logger from '../../utilities/logger'
import ApiEndPoints from '../../utilities/apiEndPoints'
import { GlobalLoader, LoadingSpinner } from '../../components/common'
import APIrequest from '../../services'
import {
  dateFormatter, phoneNumberFormatter, checkUserPermission
} from '../../utilities/common'
import ShowKyc from '../../components/modals/showKyc'
import { Button } from 'antd'
import modalNotification from '../../utilities/notifications'
import textMessages from '../../utilities/messages'
import { connect } from 'react-redux'
class UserDetails extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      userData: {},
      isLoading: true,
      kycData: {},
      openKycModal: false,
      isSpin: false

    }
  }

  componentDidMount() {
    this.loadUserData(this.props.match.params.userId)
  }

  loadUserData = async (id) => {
    try {
      const payload = {
        ...ApiEndPoints.getUserDetails(id)
      }
      const res = await APIrequest(payload)
      this.setState({
        userData: res.data,
        isLoading: false
      })

    } catch (error) {
      logger({ 'error:': error });
    }
  };

  showHideKYCModal = (data = false) => {
    const { t } = this.props
    let kycData = {}
    let openKycModal = false
    if (data) {
      openKycModal = true
      kycData.title = `${data.firstName} ${data.lastName} : ${t('user.viewKyc')}`
      kycData.userId = data.id;
      kycData.kycStatus = data.kycStatus;
    }
    this.setState({
      kycData,
      openKycModal
    })
  }

  approvedKYCStatus = (async (userData) => {
    this.setState({
      isSpin: true
    })
    try {
      const payload = {
        ...ApiEndPoints.updateKycStatusUser(userData.id),
        bodyData: {
          status: 'approved',
          reason: '',
        }
      }
      const res = await APIrequest(payload)
      modalNotification({
        type: 'success',
        message: 'Success',
        description: res.message || 'You replied to message successful!'
      })
      this.setState({
        isSpin: false
      })
      this.updateKycStatus();
    } catch (error) {
      this.setState({
        isSpin: false
      })
      logger({ 'error:': error })
    }
  })

  checkFileFormate = (file) => {
    return file.split('.').pop();
  }

  updateKycStatus = () => {
    this.loadUserData(this.props.match.params.userId)
  }

  render() {

    const { t } = this.props
    const { userData, isLoading, kycData, openKycModal, isSpin } = this.state

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('user.userDetail')}`}
          description={`${t('user.userDetail')} of ${config.NAME_TITLE}`}
        />
        <main className='main-content admin-dashboard'>
          <div className='container-fluid'>
            <div className='page-title-row'>
              <div className='left-side'>
                <BreadCrumb
                  bredcrumbs={[
                    {
                      name: t('dashboard.title'),
                      path: '/'
                    },
                    {
                      name: (userData.userType === 'user') ? t('user.title') : t('merchant.title'),
                      path: (userData.userType === 'user') ? '/manage-user' : '/manage-merchant'
                    },
                    {
                      name: (userData.userType === 'user') ? t('user.userDetail') : t('merchant.merchantDetail'),
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('user.userDetail')}
                </h2>
              </div>
            </div>
            <div className="view-page">
              <div className="viewBox user bg-white pb-0 custom-tabs">
                <div className="card viewCard">
                  {isLoading ?
                    <GlobalLoader />
                    :
                    <div className="card-aside-wrap d-sm-flex ">
                      <div className="card-aside card-aside-left user-aside toggle-slide toggle-slide-right toggle-break-lg" data-content="userAside" data-toggle-screen="lg" data-toggle-overlay="true" data-toggle-body="true">
                        <div className="card-inner-group">
                          <div className="card-inner">
                            <div className="user-card user-card-s2">
                              <div className="user-avatar lg ">
                                <img src={userData && userData.profilePictureUrl} alt="user_profile_image" />
                              </div>
                              <div className="user-info">
                                <h5 className="font-sm text-capitalize">{userData && userData.firstName} {userData && userData.lastName} </h5>
                                <span className="sub-text">{userData && userData.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="card-inner">
                            <h5 className="font-sm  text-capitalize">{t('common.personalInfo')}</h5>
                            <div className="row">
                              <div className="col-6">
                                <span className="sub-text">{t('common.accountNumber')}</span>
                                <span>{(userData.accountNumber) ? userData.accountNumber : '-'}</span>
                              </div>
                              <div className="col-6">
                                <span className="sub-text">{t('common.phoneNumber')}</span>
                                <span>{userData && phoneNumberFormatter(null, userData)}</span>
                              </div>
                              <div className="col-6">
                                <span className="sub-text">{t('common.status')}</span>
                                <span className="text-success text-capitalize">{userData && userData.status}</span>
                              </div>
                              <div className="col-6">
                                <span className="sub-text">{t('common.emailVerification')}</span>
                                <span className={(userData.isEmailVerified) ? 'text-success text-capitalize' : 'text-danger text-capitalize'}>{(userData.isEmailVerified) ? t('common.emailVerified') : t('common.notVerified')}</span>
                              </div>

                              <div className="col-6">
                                <span className="sub-text">{t('common.allKycStatus')}</span>
                                {(userData.UserKycs.length > 0) ?
                                  <span className={(userData.UserKycs[userData.UserKycs.length - 1].status === 'pending' || userData.UserKycs[userData.UserKycs.length - 1].status === 'rejected') ? 'text-danger text-capitalize' : (userData.UserKycs[userData.UserKycs.length - 1].status === 'approved') ? 'text-success text-capitalize' : 'text-warning text-capitalize'}>{(userData.UserKycs[userData.UserKycs.length - 1].status === 'uploaded') ? t('common.pending') : userData.UserKycs[userData.UserKycs.length - 1].status}</span>
                                  : <span className="text-warning text-capitalize">{t('common.notUploaded')}</span>
                                }
                              </div>
                              <div className="col-6">
                                <span className="sub-text">{t('common.registeredAt')}</span>
                                <span>{dateFormatter(userData && userData.createdAt)}</span>
                              </div>
                              {
                                (userData.companyName) ? <div className="col-6">
                                  <span className="sub-text">{t('merchant.companyName')}</span>
                                  <span>{userData && userData.companyName}</span>
                                </div> : ''
                              }

                              {
                                (userData.taxId) ? <div className="col-6">
                                  <span className="sub-text">{t('merchant.taxId')}</span>
                                  <span>{userData && userData.taxId}</span>
                                </div> : ''
                              }

                              {
                                (userData.chamberOfCommerce) ? <div className="col-6">
                                  <span className="sub-text">{t('merchant.regNo')}</span>
                                  <span>{userData && userData.chamberOfCommerce}</span>
                                </div> : ''
                              }
                            </div>
                          </div>
                          <div className="card-inner qr-code text-center">
                            <h5 className="font-sm text-capitalize">{t('common.qrCode')}</h5>
                            <img src={userData && userData.qrCodeUrl} alt="Qr_image" className="img-fluid" />
                          </div>
                        </div>
                      </div>
                      <div className="card-content w-77">
                        <div className="card-inner kyc-details text-xl-left text-center">
                          <h5 className="font-sm">{t('common.kycDocument')}</h5>
                          {
                            (userData.UserKycs.length > 0) ?
                              <>
                                <div className="row">
                                  <div className="col-xl-4 text-xl-left text-center">
                                    <p className="font-sm text-xl-left text-center">{userData.UserKycs[userData.UserKycs.length - 1] && userData.UserKycs[userData.UserKycs.length - 1].idProofName}</p>
                                    {(this.checkFileFormate(userData.UserKycs[userData.UserKycs.length - 1].idProofImage) === 'pdf') ?
                                      <div className="kyc-doc pdf-doc">
                                        <a href={userData.UserKycs[userData.UserKycs.length - 1].idProofImageUrl} target="_blank" rel="noopener noreferrer">
                                          <div className="middle">
                                            <div className="custom-ico ">
                                              <i className="icon-remove_red_eye"></i>
                                            </div>
                                          </div>
                                          <img src="/assets/images/pdf.svg" alt="pdfImnage" className="img-fluid " />
                                        </a>
                                      </div> : <div className="kyc-doc border-0">
                                        <a data-fancybox="gallery1" href={userData.UserKycs[userData.UserKycs.length - 1].idProofImageUrl}>
                                          <img src={userData.UserKycs[userData.UserKycs.length - 1].idProofImageUrl} alt="kyc" className="img-fluid  img-thumbnail" />
                                          <div className="middle kyc-img">
                                            <div className="custom-ico">
                                              <i className="icon-remove_red_eye"></i>
                                            </div>
                                          </div>
                                        </a>
                                      </div>
                                    }
                                    {userData.UserKycs[userData.UserKycs.length - 1]?.idProofBackImage && ((this.checkFileFormate(userData.UserKycs[userData.UserKycs.length - 1].idProofBackImageUrl) === 'pdf') ?
                                      <div className="kyc-doc pdf-doc">
                                        <a href={userData.UserKycs[userData.UserKycs.length - 1].idProofBackImageUrl} target="_blank" rel="noopener noreferrer">
                                          <div className="middle">
                                            <div className="custom-ico ">
                                              <i className="icon-remove_red_eye"></i>
                                            </div>
                                          </div>
                                          <img src="/assets/images/pdf.svg" alt="pdfImnage" className="img-fluid " />
                                        </a>
                                      </div> : <div className="kyc-doc border-0">
                                        <a data-fancybox="gallery1" href={userData.UserKycs[userData.UserKycs.length - 1].idProofBackImageUrl}>
                                          <img src={userData.UserKycs[userData.UserKycs.length - 1].idProofBackImageUrl} alt="kyc" className="img-fluid  img-thumbnail" />
                                          <div className="middle kyc-img">
                                            <div className="custom-ico">
                                              <i className="icon-remove_red_eye"></i>
                                            </div>
                                          </div>
                                        </a>
                                      </div>
                                    )}

                                  </div>
                                  <div className="col-xl-4 text-lg-left text-center">
                                    <p className="font-sm text-xl-left text-center">{userData.UserKycs[userData.UserKycs.length - 1] && userData.UserKycs[userData.UserKycs.length - 1].addressProofName}</p>
                                    {(this.checkFileFormate(userData.UserKycs[userData.UserKycs.length - 1].addressProofImage) === 'pdf') ?
                                      <div className="kyc-doc pdf-doc">
                                        <a href={userData.UserKycs[userData.UserKycs.length - 1].addressProofImageUrl} target="_blank" rel="noopener noreferrer">
                                          <div className="middle">
                                            <div className="custom-ico ">
                                              <i className="icon-remove_red_eye"></i>
                                            </div>
                                          </div>
                                          <img src="/assets/images/pdf.svg" alt="pdfImnage" className="img-fluid " />
                                        </a>
                                      </div> : <div className="kyc-doc border-0">
                                        <a data-fancybox="gallery1" href={userData.UserKycs[userData.UserKycs.length - 1].addressProofImageUrl}>
                                          <img src={userData.UserKycs[userData.UserKycs.length - 1].addressProofImageUrl} alt="kyc" className="img-fluid  img-thumbnail" />
                                          <div className="middle kyc-img">
                                            <div className="custom-ico">
                                              <i className="icon-remove_red_eye"></i>
                                            </div>
                                          </div>
                                        </a>
                                      </div>
                                    }

                                    {userData.UserKycs[userData.UserKycs.length - 1]?.addressProofBackImage && ((this.checkFileFormate(userData.UserKycs[userData.UserKycs.length - 1].addressProofBackImageUrl) === 'pdf') ?
                                      <div className="kyc-doc pdf-doc">
                                        <a href={userData.UserKycs[userData.UserKycs.length - 1].addressProofBackImageUrl} target="_blank" rel="noopener noreferrer">
                                          <div className="middle">
                                            <div className="custom-ico ">
                                              <i className="icon-remove_red_eye"></i>
                                            </div>
                                          </div>
                                          <img src="/assets/images/pdf.svg" alt="pdfImnage" className="img-fluid " />
                                        </a>
                                      </div> : <div className="kyc-doc border-0">
                                        <a data-fancybox="gallery1" href={userData.UserKycs[userData.UserKycs.length - 1].addressProofBackImageUrl}>
                                          <img src={userData.UserKycs[userData.UserKycs.length - 1].addressProofBackImageUrl} alt="kyc" className="img-fluid  img-thumbnail" />
                                          <div className="middle kyc-img">
                                            <div className="custom-ico">
                                              <i className="icon-remove_red_eye"></i>
                                            </div>
                                          </div>
                                        </a>
                                      </div>
                                    )}

                                  </div>
                                </div>
                                <div className="btn_row text-xl-left text-center mt-xl-4 mt-3">
                                  {
                                    (checkUserPermission(this.props.userData, 'user')
                                      && (userData.kycStatus === 'uploaded')) ?
                                      <>
                                        <Button disabled={isSpin}
                                          className={`btn btn-primary ripple-effect text-uppercase mr-3`}
                                          to=""
                                          onClick={(e) => {
                                            e.preventDefault()
                                            this.approvedKYCStatus(userData)
                                          }}
                                        > {isSpin ? <LoadingSpinner /> : <span>{t('common.approve')}</span>}</Button>
                                        <Button
                                          className={`btn btn-danger ripple-effect-dark text-uppercase`}
                                          to=""
                                          onClick={(e) => {
                                            e.preventDefault()
                                            this.showHideKYCModal(userData)
                                          }}
                                        ><span>{t('common.reject')}</span></Button></>
                                      : ""}

                                </div>
                              </>
                              : <div className='alert alert-danger'>{textMessages.noDataFound}</div>

                          }
                        </div>
                        <div className="card-inner kyc-details text-xl-left text-center">
                          <h5 className="font-sm  text-capitalize">{t('common.reasonForRejection')}</h5>
                          <span>
                            {(userData.UserKycs[userData.UserKycs.length - 1] && userData.UserKycs[userData.UserKycs.length - 1].reason) ?
                              userData.UserKycs[userData.UserKycs.length - 1].reason : <div className='alert alert-danger'>{textMessages.noDataFound}</div>}

                          </span>
                        </div>
                      </div>
                    </div>
                  }
                  <ShowKyc
                    data={kycData}
                    show={openKycModal}
                    reloadList={this.updateKycStatus}
                    onHide={() => this.showHideKYCModal()}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userData: state.auth.userData || ''
  }
}

UserDetails.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(connect(mapStateToProps)(UserDetails))