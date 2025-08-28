import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import ApiEndPoints from '../../utilities/apiEndPoints'
import APIrequest from '../../services'
import logger from '../../utilities/logger'
import { LoadingSpinner } from '../common'
import KycForm from '../forms/kycForm'
import modalNotification from '../../utilities/notifications'
import { useCallback } from 'react'


export default function ShowKyc(props) {

    const { t } = useTranslation()

    const [isSpin, setIsSpin] = useState(true)
    const [kycData, setKycData] = useState({});

    const getKycDocuments = useCallback(async () => {
        setIsSpin(true)
        try {
            const payload = {
                ...ApiEndPoints.getKycDocuments(props.data.userId)
            }
            const res = await APIrequest(payload);
            setKycData(res);
            setIsSpin(false);
        } catch (error) {
            setIsSpin(false)
            logger({ 'error:': error })
        }
    }, [props.data.userId])

    useEffect(() => {
        if (props.show) {
            getKycDocuments();
        }
    }, [
        props.show, getKycDocuments
    ]);

    if (!props.show) {
        return <></>
    }

    const onFinish = async values => {

        setIsSpin(true)
        try {
            const payload = {
                ...ApiEndPoints.updateKycStatusUser(props.data.userId),
                bodyData: {
                    status: 'rejected',
                    reason: values.reason,
                }
            }
            const res = await APIrequest(payload)
            modalNotification({
                type: 'success',
                message: 'Success',
                description: res.message || 'You replied to message successful!'
            })
            setIsSpin(false)
            props.reloadList();
            props.onHide();
        } catch (error) {
            setIsSpin(false)
            logger({ 'error:': error })
        }
    }

    const onFinishFailed = errorInfo => {
        logger({ 'Failed:': errorInfo })
    }

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size='sm'
            aria-labelledby='contained-modal-title-vcenter'
            className='modal-dialog-scrollable'
            centered
            id='qrmodal'
        >
            <Modal.Header className="text-center justify-content-center">
                <Modal.Title id='contained-modal-title-vcenter'>
                    {/* <h2 className='modal-title font-libre-bold w-100 text-capitalize'>{props.data.title}</h2> */}
                    <h2 className='modal-title font-libre-bold w-100 text-capitalize'>{t('common.rejectReason')}</h2>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className='text-center p-0'>
                {
                    isSpin ? <LoadingSpinner /> : <div>
                        {/* {kycData.data.UserKycs ? <div>
                            <div><a target="_blank" rel="noopener noreferrer" href={kycData.data.UserKycs[0].idProofImageUrl}>{kycData.data.UserKycs[0].idProofName}</a></div>
                            <br />
                            <div><a target="_blank" rel="noopener noreferrer" href={kycData.data.UserKycs[0].idProofImageUrl}>{kycData.data.UserKycs[0].addressProofName}</a></div>
                            <br />
                        </div> : ''
                        } */}
                        {
                            props.data.kycStatus === 'uploaded' ? <KycForm
                                data={kycData}
                                isSpin={isSpin}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                submitButtonText={t('common.reject')}
                                closeModal={() => props.onHide()}
                            /> : <div className='btn-row text-center mt-3'>
                                    <Button
                                        htmlType='button'
                                        className='btn btn-light ripple-effect-dark text-uppercase'
                                        onClick={() => {
                                            props.onHide()
                                        }}
                                    >
                                        {t('common.back')}
                                    </Button>
                                </div>
                        }

                    </div>

                }
            </Modal.Body>
        </Modal>
    )
}

ShowKyc.propTypes = {
    data: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
}
