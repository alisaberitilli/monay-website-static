import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import BreadCrumb from '../../components/breadCrumb'
import { Form, Input, Button, Select } from 'antd'
import MetaTags from '../../utilities/metaTags'
import config from '../../config'
import logger from '../../utilities/logger'
import validation from '../../utilities/validation'
import ApiEndPoints from '../../utilities/apiEndPoints'
import APIrequest from '../../services'
import textMessages from '../../utilities/messages'
import modalNotification from '../../utilities/notifications'
import { LoadingSpinner, GlobalLoader } from '../../components/common'
import {
  checkUserPermission
} from '../../utilities/common'
import { connect } from 'react-redux'

class Settings extends PureComponent {
  formRefSMS = React.createRef();
  formRefEmail = React.createRef();
  formRefKyc = React.createRef();
  formRefCountry = React.createRef();

  constructor(props) {
    super(props)

    this.state = {
      countryList: [],
      isSpin: false,
      isAlert: false,
      errMsg: '',
      settingsData: {},
      isLoading: true,
      isDisabled: false
    }
  }

  componentDidMount() {
    this.loadSettingsData()
    this.loadCountryList()
    this.setIsDisabled()
  }

  setIsDisabled = async () => {
    if (!checkUserPermission(this.props.userData, 'settings')) {
      this.setState({
        isDisabled: true
      })
    }
  }
  loadCountryList = async () => {
    const payload = {
      ...ApiEndPoints.getCountryList
    }
    const res = await APIrequest(payload)
    this.setState({
      countryList: res.data,
      isLoading: false
    });
  }
  loadSettingsData = async () => {
    try {
      const payload = {
        ...ApiEndPoints.getSettingsData
      }
      const res = await APIrequest(payload)
      this.setState({
        settingsData: res.data,
        isLoading: false
      }, () => {
        let settingsData = this.state.settingsData;
        this.formRefSMS.current.setFieldsValue({
          twilio_account_sid: settingsData && settingsData.twilio_account_sid,
          twilio_auth_token: settingsData && settingsData.twilio_auth_token,
          twilio_from_number: settingsData && settingsData.twilio_from_number,
          setting_type: 'sms_setting'
        })
        this.formRefEmail.current.setFieldsValue({
          smtp_username: settingsData && settingsData.smtp_username,
          smtp_password: settingsData && settingsData.smtp_password,
          smtp_host: settingsData && settingsData.smtp_host,
          smtp_port: settingsData && settingsData.smtp_port,
          smtp_email_from_email: settingsData && settingsData.smtp_email_from_email,
          smtp_email_from_name: settingsData && settingsData.smtp_email_from_name,
          setting_type: 'email_setting'
        })
        this.formRefKyc.current.setFieldsValue({
          non_kyc_user_transaction_limit: settingsData && settingsData.non_kyc_user_transaction_limit,
          kyc_user_transaction_limit: settingsData && settingsData.kyc_user_transaction_limit,
          transaction_limit_days: settingsData && settingsData.transaction_limit_days,
          setting_type: 'kyc_setting'
        })
        this.formRefCountry.current.setFieldsValue({
          country_phone_code: settingsData && settingsData.country_phone_code,
          currency_abbr: settingsData && settingsData.currency_abbr
        })
      })

    } catch (error) {
      logger({ 'error:': error });
    }
  };

  onChangePhoneCode = async (value) => {
    const { countryList } = this.state
    let country = countryList.filter(function (e) {
      return e.countryCallingCode === value;
    });
    if (country.length > 0) {
      this.formRefCountry.current.setFieldsValue({
        country_phone_code: country[0].countryCallingCode,
        currency_abbr: country[0].currencyCode
      })
    }
  }
  onChangeCurrency = async (value) => {
    const { countryList } = this.state
    let country = countryList.filter(function (e) {
      return e.currencyCode === value;
    });
    if (country.length > 0) {
      this.formRefCountry.current.setFieldsValue({
        country_phone_code: country[0].countryCallingCode,
        currency_abbr: country[0].currencyCode
      })
    }
  }
  onFinish = async (values) => {
    this.setState({ isSpin: true })
    try {
      const payload = {
        ...ApiEndPoints.updateSettings,
        bodyData: values
      }
      const res = await APIrequest(payload)
      this.setState({ isSpin: false })
      modalNotification({
        type: 'success',
        message: 'success',
        description: res.message || textMessages.profileSuccessfully
      })
    } catch (error) {
      this.setState({
        isAlert: true,
        isSpin: false,
        errMsg: error.message
      })
      logger({ 'error:': error })
    }
  }


  onCountryFinish = async (values) => {
    this.setState({ isSpin: true })
    try {
      const payload = {
        ...ApiEndPoints.updateCountrySettings,
        bodyData: values
      }
      const res = await APIrequest(payload)
      let settings = this.state.settingsData;
      settings.is_country_setting = 1;

      this.setState({ isSpin: false, settingsData: settings });
      modalNotification({
        type: 'success',
        message: 'success',
        description: res.message || textMessages.profileSuccessfully
      })
    } catch (error) {
      this.setState({
        isAlert: true,
        isSpin: false,
        errMsg: error.message
      })
      logger({ 'error:': error })
    }
  }


  onFinishFailed = (errorInfo) => {
    logger({ 'Failed:': errorInfo })
  };

  render() {
    const { settingsData, isSpin, isLoading, isDisabled, countryList } = this.state
    const { t } = this.props
    const tabpane3 = 'tabpane3'
    const tabpane2 = 'tabpane2'
    const initalValues = {
      twilio_account_sid: settingsData && settingsData.twilio_account_sid,
      twilio_auth_token: settingsData && settingsData.twilio_auth_token,
      twilio_from_number: settingsData && settingsData.twilio_from_number,
      smtp_username: settingsData && settingsData.smtp_username,
      smtp_password: settingsData && settingsData.smtp_password,
      smtp_host: settingsData && settingsData.smtp_host,
      smtp_port: settingsData && settingsData.smtp_port,
      smtp_email_from_email: settingsData && settingsData.smtp_email_from_email,
      smtp_email_from_name: settingsData && settingsData.smtp_email_from_name,
      non_kyc_user_transaction_limit: settingsData && settingsData.non_kyc_user_transaction_limit,
      kyc_user_transaction_limit: settingsData && settingsData.kyc_user_transaction_limit,
      transaction_limit_days: settingsData && settingsData.transaction_limit_days,
      country_phone_code: settingsData && settingsData.country_phone_code,
      currency_abbr: settingsData && settingsData.currency_abbr,
    }

    return (

      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('settings.title')}`}
          description={`${t('settings.title')} of ${config.NAME_TITLE}`}
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
                      name: t('settings.title')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('settings.title')}
                </h2>
              </div>
            </div>
            <div className="view-page">
              <div className="viewBox settingContent bg-white pb-0 custom-tabs">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item">
                    <a className="nav-link active" id="sms-tab" data-toggle="tab" href="#sms" role="tab" aria-controls="sms" aria-selected="true">
                      {t('settings.smsSettings')}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" id="email-tab" data-toggle="tab" href="#email" role="tab" aria-controls="email" aria-selected="false">
                      {t('settings.emailSettings')}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" id="kyc-tab" data-toggle="tab" href="#kyc" role="tab" aria-controls="kyc" aria-selected="false">
                      {t('settings.kycSettings')}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" id="country-tab" data-toggle="tab" href="#country" role="tab" aria-controls="country" aria-selected="false">
                      {t('settings.countrySettings')}
                    </a>
                  </li>
                </ul>
                <div className="detail-wrap mt-2 mt-md-3">
                  <div className="custom-tabs detail-ta bs">
                    <div className="tab-content mt-0">
                      {isLoading ?
                        <GlobalLoader />
                        :
                        <div className="tab-pane fade show active" id="sms" role="tabpanel" aria-labelledby="sms-tab">
                          <Form
                            ref={this.formRefSMS}
                            name='updateSMSSettings'
                            onFinish={this.onFinish}
                            onFinishFailed={this.onFinishFailed}
                            initialValues={initalValues}
                          >
                            <div className="row">
                              <div className="col-sm-3">
                                <div className="form-group">
                                  <label>{t('settings.twilioAccSid')}</label>
                                  <Form.Item name='twilio_account_sid' rules={validation.settings.twilioAccountSid}>
                                    <Input
                                      className='form-control'
                                      placeholder={t('settings.twilioAccSid')}
                                      disabled={isDisabled}
                                    />
                                  </Form.Item>
                                </div>
                              </div>
                              <div className="col-sm-3">
                                <div className="form-group">
                                  <label>{t('settings.authToken')}</label>
                                  <Form.Item name='twilio_auth_token' rules={validation.settings.twilioAuthToken}>
                                    <Input
                                      className='form-control'
                                      placeholder={t('settings.authToken')}
                                      disabled={isDisabled}
                                    />
                                  </Form.Item>
                                </div>
                              </div>
                              <div className="col-sm-3">
                                <div className="form-group">
                                  <label>{t('settings.RegPhoneNumber')}</label>
                                  <Form.Item name='twilio_from_number' rules={validation.settings.twilioFromNumber}>
                                    <Input
                                      className='form-control'
                                      placeholder={t('settings.RegPhoneNumber')}
                                      disabled={isDisabled}
                                    />
                                  </Form.Item>
                                </div>
                              </div>
                              <Form.Item name='setting_type' hidden>
                                <Input
                                  className='form-control'
                                />
                              </Form.Item>
                            </div>
                            <div className="btnRow text-center">
                              {checkUserPermission(this.props.userData, 'settings') ? <Button
                                className="btn btn-primary ripple-effect-dark text-uppercase mb-4" data-dismiss="modal"
                                htmlType='submit'
                                disabled={isSpin}
                              >
                                {isSpin ? <LoadingSpinner /> : t('common.update')}
                              </Button> : ''}
                            </div>
                          </Form>
                        </div>
                      }
                      <div className="tab-pane" id="email" role={tabpane2} aria-labelledby="email-tab">
                        <Form
                          ref={this.formRefEmail}
                          name='updateEmailSettings'
                          onFinish={this.onFinish}
                          onFinishFailed={this.onFinishFailed}
                          initialValues={initalValues}
                        >
                          <div className="row">
                            {/* <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.emailEngine')}</label>
                                <input type="text" className="form-control" placeholder="Email Engine"/>
                                <Form.Item name='name' rules={validation.settings.smtpEmailFromEmail}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.emailEngine')}
                                  />
                                </Form.Item>
                              </div>
                            </div> */}
                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.smtpUsername')}</label>
                                <Form.Item name='smtp_username' rules={validation.settings.smtpUsername}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.smtpUsername')}
                                    disabled={isDisabled}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.smtpPassword')}</label>
                                <Form.Item name='smtp_password' rules={validation.settings.smtpPassword}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.smtpPassword')}
                                    disabled={isDisabled}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.smtpServer')}</label>
                                <Form.Item name='smtp_host' rules={validation.settings.smtpHostd}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.smtpServer')}
                                    disabled={isDisabled}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.smtpPort')}</label>
                                <Form.Item name='smtp_port' rules={validation.settings.smtpPort}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.smtpPort')}
                                    disabled={isDisabled}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                            {/*<div className="col-sm-3">
                               <div className="form-group">
                                <label>{t('settings.smtpSecurity')}</label>
                                <input type="text" className="form-control" placeholder="SMPT Security"/>
                                <Form.Item name='name' rules={validation.profile.twilioAccountSid}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.smtpSecurity')}
                                  />
                                </Form.Item>
                              </div> 
                            </div>*/}
                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.mailFormEmail')}</label>
                                <Form.Item name='smtp_email_from_email' rules={validation.settings.smtpEmailFromEmail}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.mailFormEmail')}
                                    disabled={isDisabled}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.mailFromName')}</label>
                                <Form.Item name='smtp_email_from_name' rules={validation.settings.smtpEmailFromName}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.mailFromName')}
                                    disabled={isDisabled}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                            <Form.Item name='setting_type' hidden>
                              <Input
                                className='form-control'
                              />
                            </Form.Item>
                          </div>
                          <div className="btnRow text-center">
                            {checkUserPermission(this.props.userData, 'settings') ? <Button
                              className="btn btn-primary ripple-effect-dark text-uppercase mb-4" data-dismiss="modal"
                              htmlType='submit'
                              disabled={isSpin}
                            >
                              {isSpin ? <LoadingSpinner /> : t('common.update')}
                            </Button> : ''}
                          </div>
                        </Form>
                      </div>
                      <div className="tab-pane" id="kyc" role={tabpane3} aria-labelledby="kyc-tab">
                        <Form
                          ref={this.formRefKyc}
                          name='updateKycSettings'
                          onFinish={this.onFinish}
                          onFinishFailed={this.onFinishFailed}
                          initialValues={initalValues}
                        >
                          <div className="row">
                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.nonKycUserTransactionLimit')}</label>
                                <Form.Item name='non_kyc_user_transaction_limit' rules={validation.settings.nonKycUserTransactionLimit}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.nonKycUserTransactionLimit')}
                                    disabled={isDisabled}

                                  />
                                </Form.Item>
                              </div>
                            </div>
                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.kycUserTransactionLimit')}</label>
                                <Form.Item name='kyc_user_transaction_limit' rules={validation.settings.kycUserTransactionLimit}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.kycUserTransactionLimit')}
                                    disabled={isDisabled}

                                  />
                                </Form.Item>
                              </div>
                            </div>
                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.transactionLimitDays')}</label>
                                <Form.Item name='transaction_limit_days' rules={validation.settings.transactionLimitDays}>
                                  <Input
                                    className='form-control'
                                    placeholder={t('settings.transactionLimitDays')}
                                    disabled={isDisabled}

                                  />
                                </Form.Item>
                              </div>
                            </div>
                            <Form.Item name='setting_type' hidden>
                              <Input
                                className='form-control'
                              />
                            </Form.Item>
                          </div>
                          <div className="btnRow text-center">
                            {checkUserPermission(this.props.userData, 'settings') ? <Button
                              className="btn btn-primary ripple-effect-dark text-uppercase mb-4" data-dismiss="modal"
                              htmlType='submit'
                              disabled={isSpin}
                            >
                              {isSpin ? <LoadingSpinner /> : t('common.update')}
                            </Button> : ""}
                          </div>
                        </Form>
                      </div>
                      <div className="tab-pane" id="country" role={tabpane3} aria-labelledby="country-tab">
                        <Form
                          ref={this.formRefCountry}
                          name='updateCountrySettings'
                          onFinish={this.onCountryFinish}
                          onFinishFailed={this.onFinishFailed}
                          initialValues={initalValues}
                        >
                          <div className="row">

                            <div className="col-sm-3">
                              <div className="form-group">
                                <label>{t('settings.countryPhoneCode')}</label>
                                <Form.Item
                                  name="country_phone_code"
                                  fieldKey="countryPhoneCode"
                                  rules={validation.settings.country_phone_code}
                                >
                                  <Select disabled={(parseInt(settingsData.is_country_setting)) ? true : false} className='form-control' placeholder={t('settings.countryPhoneCode')} showSearch onChange={this.onChangePhoneCode}>
                                    {
                                      countryList.map(item => {
                                        return <Select.Option key={`phonecode${item.id}`} value={item.countryCallingCode}>{item.countryCallingCode} - ({item.name})</Select.Option>
                                      })
                                    }
                                  </Select>
                                </Form.Item>
                              </div>
                            </div>
                            <div className="col-sm-3">

                              <div className="form-group">
                                <label>{t('settings.currencyAbbreviation')}</label>
                                <Form.Item
                                  name="currency_abbr"
                                  fieldKey="currencyAbbreviation"
                                  rules={validation.settings.currency_abbr}
                                >
                                  <Select disabled={(parseInt(settingsData.is_country_setting)) ? true : false} className='form-control' placeholder={t('settings.currencyAbbreviation')} showSearch onChange={this.onChangeCurrency}>
                                    {
                                      countryList.map(item => {
                                        return <Select.Option key={`currency${item.id}`} value={item.currencyCode}>{item.currencyCode} - ({item.name})</Select.Option>
                                      })
                                    }
                                  </Select>
                                </Form.Item>
                              </div>
                            </div>

                            <Form.Item name='setting_type' hidden>
                              <Input
                                className='form-control'
                              />
                            </Form.Item>
                          </div>
                          <div className="btnRow text-center" style={{ display: (parseInt(settingsData.is_country_setting)) ? 'none' : 'block' }}>
                            {checkUserPermission(this.props.userData, 'settings') ? <Button
                              className="btn btn-primary ripple-effect-dark text-uppercase mb-4" data-dismiss="modal"
                              htmlType='submit'
                              disabled={isSpin}
                            >
                              {isSpin ? <LoadingSpinner /> : t('common.update')}
                            </Button> : ""}
                          </div>
                        </Form>
                      </div>
                    </div>
                  </div>
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

Settings.propTypes = {
  t: PropTypes.func.isRequired
}


export default withTranslation()(connect(mapStateToProps)(Settings))
