import React from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Button } from 'antd'
import PropTypes from 'prop-types'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'

export default function KycForm({
    isSpin,
    onFinish,
    closeModal,
    onFinishFailed,
    submitButtonText
}) {
    const { t } = useTranslation()
    return (
        <Form
            name='replyMessage'
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
        >
            {/* <div className='form-group'>
                <Form.Item
                    name='status'
                    rules={validation.kycMessage.status}
                    hidden
                >
                    <Select placeholder={t('common.kycStatus')} >
                        <Select.Option value=''>{t('common.allKycStatus')}</Select.Option>
                        <Select.Option value='approved'>{t('common.approved')}</Select.Option>
                        <Select.Option value='rejected' Selected>{t('common.rejected')}</Select.Option>
                    </Select>
                </Form.Item>
            </div> */}
            <div className="modal-body field-padd">
                <div className='form-group text-left'>
                    <label>{t('common.reason')}</label>
                    <Form.Item
                        name='reason'
                        rules={validation.kycMessage.reason}
                    >
                        <Input.TextArea
                            rows={7}
                            className='form-control'
                            placeholder={t('common.reason')}
                        />
                    </Form.Item>
                </div>
            <div className='btn-row text-center'>
                <Form.Item>
                    <Button disabled={isSpin} htmlType='submit' className='btn btn-danger width-120 ripple-effect text-uppercase mr-2'>
                        {isSpin ? <LoadingSpinner /> : submitButtonText}
                    </Button>
                    <Button
                        htmlType='button'
                        className='btn btn-light ripple-effect-dark text-uppercase'
                        onClick={() => {
                            closeModal()
                        }}
                    >
                        {t('common.back')}
                    </Button>
                </Form.Item>
            </div>
            </div>
        </Form>
    )
}

KycForm.propTypes = {
    data: PropTypes.object.isRequired,
    isSpin: PropTypes.bool.isRequired,
    onFinish: PropTypes.func.isRequired,
    onFinishFailed: PropTypes.func.isRequired,
    submitButtonText: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired
}
