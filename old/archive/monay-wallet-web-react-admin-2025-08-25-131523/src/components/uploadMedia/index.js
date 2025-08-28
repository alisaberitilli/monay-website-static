import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Dragger from 'antd/lib/upload/Dragger'
import { InboxOutlined } from '@ant-design/icons'
import {
  getSessionStorageToken,
  acceptImageFiles,
  fileSizeLimitCheck
} from '../../utilities/common'
import { Alert, Upload } from 'antd'
import textMessages from '../../utilities/messages'
import logger from '../../utilities/logger'

let errorMessage = ''

class UploadMedia extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      previewFileList: [],
      errorMessageState: ''
    }
  }

  componentDidMount() {
    this.updatePreviewFileList()
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(prevProps.media) !== JSON.stringify(this.props.media)) {
      this.updatePreviewFileList()
    }
  }

  updatePreviewFileList = () => {
    errorMessage = ''
    this.updateErrorMessageState(errorMessage)
    const media = this.props.media || []
    const previewFileList = []

    for (let index = 0; index < media.length; index++) {
      const element = media[index]
      if (element) {
        previewFileList.push({
          uid: element,
          name: element.split('/').pop(),
          status: 'done',
          url: element,
          thumbUrl: element
        })
      }
    }

    this.setState({
      previewFileList
    })
  }

  updateErrorMessageState = (msg = '') => {
    this.setState({
      errorMessageState: msg
    })
  }

  handleBeforeUpload = (file, fileList, accept, mediaType) => {
    return new Promise((resolve, reject) => {
      let returnResolve = true
      errorMessage = ''
      this.updateErrorMessageState(errorMessage)
      const fileExtensionsAllowed = accept
        .split(',')
        .map((d) => d.replace('.', '').trim())

      for (let index = 0; index < fileList.length; index++) {
        const element = fileList[index]

        const fileExt = element.name.split('.').pop().toLowerCase()

        if (!fileExtensionsAllowed.includes(fileExt)) {
          element.status = 'error'
          errorMessage = textMessages.filesAllowed(fileExtensionsAllowed.join('/'))
          this.updateErrorMessageState(errorMessage)
          reject(errorMessage)
          returnResolve = false
        }

        const checkFileSize = fileSizeLimitCheck(file.size, mediaType)
        if (!checkFileSize.success) {
          element.status = 'error'
          errorMessage = textMessages.fileSizeLimit(checkFileSize.limit)
          this.updateErrorMessageState(errorMessage)
          reject(errorMessage)
          returnResolve = false
        }

        if (index === (fileList.length - 1)) {
          resolve(returnResolve)
        }
      }
    })
  }

  handleChange = async (info) => {
    const { onFileUploaded, multiple } = this.props

    let previewFileList = [...info.fileList]

    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    if (!(multiple || false)) {
      previewFileList = previewFileList.slice(-1)
    }

    // 2. Read from response and show file link
    previewFileList = previewFileList.map(file => {
      if (file.response && file.response.success) {
        // PureComponent will show file.url as link
        file.url = file.response.data.baseUrl
      }
      return file
    })

    this.setState({ previewFileList })

    const pathsArr = []

    for (let index = 0; index < info.fileList.length; index++) {
      const uploadFile = info.fileList[index]
      if (uploadFile.status !== 'uploading') {
        logger({ file: info.file, filelist: info.fileList })
      }
      if (uploadFile.status === 'done') {
        if ('response' in uploadFile) {
          if (uploadFile.response.success) {
            errorMessage = ''
            this.updateErrorMessageState(errorMessage)
            pathsArr.push(uploadFile.response.data.basePath)
          } else {
            errorMessage = uploadFile.response.message || textMessages.fileUploadFail(uploadFile.name)
            this.updateErrorMessageState(errorMessage)
          }
        }
      }
      if (uploadFile.status === 'error' && !('event' in info)) {
        onFileUploaded('')
      }
    }

    if (pathsArr.length > 0) {
      if (multiple) {
        onFileUploaded(pathsArr)
      } else {
        onFileUploaded(pathsArr[0])
      }
    }
  }

  render() {
    const { actionURL, onFileRemoved, multiple, mediaType = 'image', customListType, showWithoutDragger } = this.props
    const { previewFileList, errorMessageState } = this.state
    const apiToken = getSessionStorageToken()

    let accept = acceptImageFiles
    let listType = 'picture'

    if (customListType) {
      listType = customListType
    }

    const uploadMediaProps = {
      name: 'file',
      accept: accept,
      multiple: multiple || false,
      listType: listType,
      action: actionURL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `Bearer ${apiToken}`
      },
      progress: {
        strokeColor: {
          '0%': '#bedbff',
          '100%': '#1572e8'
        },
        strokeWidth: 3,
        format: percent => `${parseFloat(percent.toFixed(2))}%`
      },
      beforeUpload: (file, fileList) => this.handleBeforeUpload(file, fileList, accept, mediaType),
      onChange: this.handleChange,
      onRemove: (file) => {
        errorMessage = ''
        this.updateErrorMessageState(errorMessage)
        if (multiple) {
          onFileRemoved(file)
        } else {
          onFileRemoved()
        }
      }
    }

    const uploadButton = (
      <div className="upload-custom-text">
        <i className="icon-photo_camera"></i>
      </div>
    );

    if (showWithoutDragger) {
      return <Upload
        {...uploadMediaProps}
        fileList={[...previewFileList]}
      >
        {uploadButton}
      </Upload>
    }

    return (
      <>
        <Dragger
          {...uploadMediaProps}
          fileList={[...previewFileList]}
        >
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>
            Click or drag file to this area to upload
          </p>
          <p className='ant-upload-text'>
            <strong className="theme-color">
              {`Only ${accept} files are allowed`}
            </strong>
          </p>
        </Dragger>
        {
          errorMessageState && <Alert
            message={errorMessageState}
            className='mt-2 mb-2'
            type='error'
          />
        }
      </>
    )
  }
}

UploadMedia.propTypes = {
  actionURL: PropTypes.string.isRequired,
  onFileRemoved: PropTypes.func,
  onFileUploaded: PropTypes.func,
  media: PropTypes.array,
  multiple: PropTypes.bool,
  showWithoutDragger: PropTypes.bool,
  mediaType: PropTypes.string,
  customListType: PropTypes.string
}

export default UploadMedia
