//
//  KYCDocumentUploadVC.swift
//  Monay
//
//  Created by Govind Prasad on 20/02/21.
//  Copyright © 2021 Codiant. All rights reserved.
//

import UIKit
import QuickLook
import MobileCoreServices

class KYCDocumentUploadVC: UIViewController {
  
  // MARK: - IBOutlet properties
  
  @IBOutlet weak var documentTableView: UITableView!
  @IBOutlet weak var submitButton: UIButton!

  // MARK: - Instance properties
  
  let kycDocumentUploadVM = KYCDocumentUploadVM()
  var callback: ((UIImage, Data, String, String, String) -> Void)?
  var fileUrl: NSURL?
  
  // MARK: - View Controller Life Cycle Methods
  
  override func viewDidLoad() {
    super.viewDidLoad()
    initialSetup()
  }
  
  // MARK: - Private Helper Methods
  
  private func initialSetup() {
    configureTableView()
    prepareDataSource()
    callAccountMeAPI()
  }
  
  private func configureTableView() {
    documentTableView.register(
      UINib(nibName: UploadDocumentHeaderCell.reuseIdentifier, bundle: nil),
      forCellReuseIdentifier: UploadDocumentHeaderCell.reuseIdentifier)
    documentTableView.estimatedRowHeight = 360
    documentTableView.rowHeight = UITableView.automaticDimension

    if #available(iOS 15.0, *) {
      documentTableView.sectionHeaderTopPadding = 0
    } else {
      // Fallback on earlier versions
    }
  }
  
  private func prepareDataSource() {
  }
  
  private func chooseMediaSource() {
    let alert = UIAlertController(title: nil, message: LocalizedKey.chooseMediaSource.value, preferredStyle: .actionSheet)
    alert.addAction(UIAlertAction(title: LocalizedKey.camera.value, style: .default, handler: { (_) in
      self.presentImagePickerController(sourceType: .camera)
    }))
    
    alert.addAction(UIAlertAction(title: LocalizedKey.gallery.value, style: .default, handler: { (_) in
      self.presentImagePickerController(sourceType: .photoLibrary)
    }))
    
    alert.addAction(UIAlertAction(title: LocalizedKey.document.value, style: .default, handler: { (_) in
      self.openDocument()
    }))
    
    alert.addAction(UIAlertAction(title: LocalizedKey.cancel.value, style: .cancel))
    
    self.present(alert)
    
  }
  
  private func presentImagePickerController(sourceType: UIImagePickerController.SourceType) {
    let imagePickerController = UIImagePickerController()
    imagePickerController.sourceType = sourceType
    imagePickerController.allowsEditing = true
    imagePickerController.delegate = self
    imagePickerController.modalPresentationStyle = .overCurrentContext
    self.present(imagePickerController)
  }
  
  private func openDocument() {
    let types: [String] = [kUTTypePDF as String]
    let importMenu = UIDocumentPickerViewController(documentTypes: types, in: .import)
    
    importMenu.delegate = self
    importMenu.modalPresentationStyle = .custom
    self.present(importMenu, animated: true, completion: nil)
  }
  
  // MARK: - IBAction methods
  
  @IBAction func submitButtonAction(_ sender: Any) {
    let validationResponse = kycDocumentUploadVM.isValidText()
    
    if !validationResponse.0 {
      showAlertWith(message: validationResponse.1)
      return
    }
    
    HudView.show()
    
    self.callUploadMediaAPI(
      kycDocumentUploadVM.identificationFrontData ?? Data(),
      mediaType: kycDocumentUploadVM.identificationFrontMediaType,
      ext: kycDocumentUploadVM.identificationFrontExtension) { [weak self] (basePath) in
        
        guard let `self` = self else {
          return
        }
        
        self.kycDocumentUploadVM.identificationFrontDocument = basePath
        
        if self.kycDocumentUploadVM.identificationImageCount == 2, self.kycDocumentUploadVM.identificationBackDocument != "" {
          self.callUploadMediaAPI(
            self.kycDocumentUploadVM.identificationBackData ?? Data(),
            mediaType: self.kycDocumentUploadVM.identificationBackMediaType,
            ext: self.kycDocumentUploadVM.identificationBackExtension) { [weak self] (basepath) in
              
              guard let `self` = self else {
                return
              }
              
              self.kycDocumentUploadVM.identificationBackDocument = basepath
              
              self.callUploadMediaAPI(
                self.kycDocumentUploadVM.addressProofFrontData ?? Data(),
                mediaType: self.kycDocumentUploadVM.addressFrontMediaType,
                ext: self.kycDocumentUploadVM.addressProofFrontExtension) { [weak self] (basepath) in
                  
                  guard let `self` = self else {
                    return
                  }
                  
                  self.kycDocumentUploadVM.addressProofFrontDocument = basepath
                  
                  if self.kycDocumentUploadVM.addressProofImageCount == 2, self.kycDocumentUploadVM.addressProofBackDocument != "" {
                    self.callUploadMediaAPI(
                      self.kycDocumentUploadVM.addressProofBackData ?? Data(),
                      mediaType: self.kycDocumentUploadVM.addressBackMediaType,
                      ext: self.kycDocumentUploadVM.addressProofBackExtension) { [weak self] (basepath) in
                        
                        guard let `self` = self else {
                          return
                        }
                        
                        self.kycDocumentUploadVM.addressProofBackDocument = basepath
                        self.callUpdateKYCAPI()
                      }
                  } else {
                    self.callUpdateKYCAPI()
                  }
                }

            }
        } else {
          self.callUploadMediaAPI(
            self.kycDocumentUploadVM.addressProofFrontData ?? Data(),
            mediaType: self.kycDocumentUploadVM.addressFrontMediaType,
            ext: self.kycDocumentUploadVM.addressProofFrontExtension) { [weak self] (basepath) in
              
              guard let `self` = self else {
                return
              }
              
              self.kycDocumentUploadVM.addressProofFrontDocument = basepath
              
              if self.kycDocumentUploadVM.addressProofImageCount == 2, self.kycDocumentUploadVM.addressProofBackDocument != "" {
                self.callUploadMediaAPI(
                  self.kycDocumentUploadVM.addressProofBackData ?? Data(),
                  mediaType: self.kycDocumentUploadVM.addressBackMediaType,
                  ext: self.kycDocumentUploadVM.addressProofBackExtension) { [weak self] (basepath) in
                    
                    guard let `self` = self else {
                      return
                    }
                    
                    self.kycDocumentUploadVM.addressProofBackDocument = basepath
                    self.callUpdateKYCAPI()
                  }
              } else {
                self.callUpdateKYCAPI()
              }
            }
        }
      }
  }
}

// MARK: - Table view datasource methods

extension KYCDocumentUploadVC: UITableViewDataSource {
  func numberOfSections(in tableView: UITableView) -> Int {
    return kycDocumentUploadVM.dataSource.count
  }
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    let type = kycDocumentUploadVM.dataSource[section].type
    
    switch type {
    case .title:
      return kycDocumentUploadVM.dataSource[section].options.count
    case .image:
      return 1
    }
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell { // swiftlint:disable:this function_body_length
    let type = kycDocumentUploadVM.dataSource[indexPath.section].type
    
    switch type {
    case .title:
      
      guard let uploadDocumentCell = tableView.dequeueReusableCell(
        withIdentifier: UploadDocumentCell.reuseIdentifier) as? UploadDocumentCell else {
        return UITableViewCell()
      }
      
      let idName = kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].name
      uploadDocumentCell.set(idName, isSelected: kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].isSelected)
      
      uploadDocumentCell.callback = { [weak self] (uploadDocumentCell, idName) in
        
        guard let `self` = self else {
          return
        }
        
        guard let indexPath = self.documentTableView.indexPath(for: uploadDocumentCell)  else {
          return
        }
        
        if self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.pending.value || self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.rejected.value.lowercased() {
          
          if self.kycDocumentUploadVM.dataSource[indexPath.section].idType == .idProof {
            self.kycDocumentUploadVM.identification = idName
          } else {
            self.kycDocumentUploadVM.addressProof = idName
          }
          
          for index in 0..<self.kycDocumentUploadVM.dataSource[indexPath.section].options.count {
            self.kycDocumentUploadVM.dataSource[indexPath.section].options[index].isSelected = false
            self.kycDocumentUploadVM.dataSource[indexPath.section].options[index].isFrontImagePicked = false
            self.kycDocumentUploadVM.dataSource[indexPath.section].options[index].isBackImagePicked = false
            self.kycDocumentUploadVM.dataSource[indexPath.section].options[index].pickedFrontImage = nil
            self.kycDocumentUploadVM.dataSource[indexPath.section].options[index].pickedBackImage = nil
          }
          for index in 0..<self.kycDocumentUploadVM.dataSource[indexPath.section + 1].options.count {
            self.kycDocumentUploadVM.dataSource[indexPath.section + 1].options[index].isSelected = false
            self.kycDocumentUploadVM.dataSource[indexPath.section + 1].options[index].isFrontImagePicked = false
            self.kycDocumentUploadVM.dataSource[indexPath.section + 1].options[index].isBackImagePicked = false
            self.kycDocumentUploadVM.dataSource[indexPath.section + 1].options[index].pickedFrontImage = nil
            self.kycDocumentUploadVM.dataSource[indexPath.section + 1].options[index].pickedBackImage = nil
          }
          
          self.kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].isSelected = true
          self.kycDocumentUploadVM.dataSource[indexPath.section + 1].options[indexPath.row].isSelected = true
          let imageCount = self.kycDocumentUploadVM.dataSource[indexPath.section + 1].options[indexPath.row].uploadImageCount ?? 0
          
          switch indexPath.section {
          case 0:
            self.kycDocumentUploadVM.identificationImageCount = imageCount
            self.kycDocumentUploadVM.identificationFrontDocument = ""
            self.kycDocumentUploadVM.identificationBackDocument = ""
            self.kycDocumentUploadVM.identificationFrontMediaType = ""
            self.kycDocumentUploadVM.identificationBackMediaType = ""
            self.kycDocumentUploadVM.identificationFrontExtension = ""
            self.kycDocumentUploadVM.identificationBackExtension = ""
            self.kycDocumentUploadVM.identificationFrontData = nil
            self.kycDocumentUploadVM.identificationBackData = nil
            
          case 2:
            self.kycDocumentUploadVM.addressProofImageCount = imageCount
            self.kycDocumentUploadVM.addressProofFrontDocument = ""
            self.kycDocumentUploadVM.addressProofBackDocument = ""
            self.kycDocumentUploadVM.addressFrontMediaType = ""
            self.kycDocumentUploadVM.addressBackMediaType = ""
            self.kycDocumentUploadVM.addressProofFrontExtension = ""
            self.kycDocumentUploadVM.addressProofBackExtension = ""
            self.kycDocumentUploadVM.addressProofFrontData = nil
            self.kycDocumentUploadVM.addressProofBackData = nil
            
          default: break
          }
          
          self.documentTableView.reloadData()
        }
        
      }
      
      return uploadDocumentCell
      
    case .image:
      guard let documentCell = tableView.dequeueReusableCell(
        withIdentifier: DocumentCell.reuseIdentifier) as? DocumentCell else {
        return UITableViewCell()
      }
      
      let idType = kycDocumentUploadVM.dataSource[indexPath.section].idType
      let frontDocument = idType == .idProof ? kycDocumentUploadVM.identificationFrontDocument : kycDocumentUploadVM.addressProofFrontDocument
      let backDocument = idType == .idProof ? kycDocumentUploadVM.identificationBackDocument : kycDocumentUploadVM.addressProofBackDocument
      
      if indexPath.section == 1 {
        documentCell.documentBottomMainView.isHidden = kycDocumentUploadVM.dataSource[indexPath.section].options[0].uploadImageCount == 1
      }
      
      let index = kycDocumentUploadVM.dataSource[indexPath.section].options.indices.filter({kycDocumentUploadVM.dataSource[indexPath.section].options[$0].isSelected == true})
      
      if index.count > 0 {
        documentCell.documentBottomMainView.isHidden = kycDocumentUploadVM.dataSource[indexPath.section].options[index[0]].uploadImageCount == 1
      }
      
      if kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].isFrontImagePicked {
        documentCell.documentImageParentView.isHidden = true
        documentCell.documentView.isHidden = false
        if let pickedImage = kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].pickedFrontImage {
          documentCell.documentImageView.image = pickedImage
        }
      } else {
        documentCell.documentImageParentView.isHidden = false
        documentCell.documentView.isHidden = true
      }
      
      if kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].isBackImagePicked {
        documentCell.documentBottomBackgroundDashLineView.isHidden = true
        documentCell.documentBottomView.isHidden = false
        if let pickedImage = kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].pickedBackImage {
          documentCell.documentBottomImageView.image = pickedImage
        }
      } else {
        documentCell.documentBottomBackgroundDashLineView.isHidden = false
        documentCell.documentBottomView.isHidden = true
      }
      
      if let documentUrl = URL(string: frontDocument) {
        
        let pdfPlaceHolderImage = UIImage(named: LocalizedKey.pdfImage.value)
        
        if self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.approved.value ||
            self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.uploaded.value {
          documentCell.documentView.isHidden = false
          frontDocument.contains(LocalizedKey.pdf.value) ? documentCell.documentImageView.image = pdfPlaceHolderImage : documentCell.documentImageView.setImage(with: documentUrl)
          documentCell.documentPreviewButton.isHidden = true
          documentCell.documentDeleteButton.isHidden = true
          documentCell.documentImageView.isUserInteractionEnabled = false
        }
      }
      
      if let documentUrl = URL(string: backDocument) {
        
        let pdfPlaceHolderImage = UIImage(named: LocalizedKey.pdfImage.value)
        
        if self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.approved.value ||
            self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.uploaded.value {
          documentCell.documentBottomView.isHidden = false
          backDocument.contains(LocalizedKey.pdf.value) ? documentCell.documentBottomImageView.image = pdfPlaceHolderImage : documentCell.documentBottomImageView.setImage(with: documentUrl)
          documentCell.documentBottomPreviewButton.isHidden = true
          documentCell.documentBottomDeleteButton.isHidden = true
          documentCell.documentBottomImageView.isUserInteractionEnabled = false
        }
      }
      
      if self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.uploaded.value ||
          self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.approved.value {
        documentCell.documentBottomMainView.isHidden = backDocument == "" || backDocument.contains("null")
      }
      
      documentCell.callback = { [weak self] itemCell in
        
        guard let `self` = self else {
          return
        }
        
        if let indexPath = self.documentTableView.indexPath(for: itemCell) {
          self.callback = { [weak self] (image, data, ext, mediaType, imageURL) in
            
            guard let `self` = self else {
              return
            }
            
            self.kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].isFrontImagePicked = true
            let pdfPlaceHolderImage = UIImage(named: LocalizedKey.pdfImage.value)
            self.kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].pickedFrontImage = ext == LocalizedKey.pdf.value ? pdfPlaceHolderImage : image
            
            documentCell.documentImageParentView.isHidden = true
            documentCell.documentView.isHidden = false
            documentCell.documentPreviewButton.isHidden = ext != LocalizedKey.pdf.value
            documentCell.documentImageView.image = ext == LocalizedKey.pdf.value ? pdfPlaceHolderImage : image
            
            let idType = self.kycDocumentUploadVM.dataSource[indexPath.section].idType
            if idType == .idProof {
              self.kycDocumentUploadVM.identificationFrontDocument = imageURL
              self.kycDocumentUploadVM.identificationFrontData = data
              self.kycDocumentUploadVM.identificationFrontExtension = ext
              self.kycDocumentUploadVM.identificationFrontMediaType = mediaType
            } else {
              self.kycDocumentUploadVM.addressProofFrontDocument = imageURL
              self.kycDocumentUploadVM.addressProofFrontData = data
              self.kycDocumentUploadVM.addressProofFrontExtension = ext
              self.kycDocumentUploadVM.addressFrontMediaType = mediaType
            }
          }
          
          if idType == .idProof, self.kycDocumentUploadVM.identification.isEmpty {
            return self.showAlertWith(message: LocalizedKey.messageSelectIdentificationType.value)
          }
          
          if idType == .addressProof, self.kycDocumentUploadVM.addressProof.isEmpty {
            return self.showAlertWith(message: LocalizedKey.messageSelectAddressProofType.value)
          }
          
          self.chooseMediaSource()
        }
      }
      
      documentCell.callbackBottomSelectDoc = { [weak self] itemCell in
        
        guard let `self` = self else {
          return
        }
        
        if let indexPath = self.documentTableView.indexPath(for: itemCell) {
          self.callback = { [weak self] (image, data, ext, mediaType, imageURL) in
            
            guard let `self` = self else {
              return
            }
            
            self.kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].isBackImagePicked = true
            let pdfPlaceHolderImage = UIImage(named: LocalizedKey.pdfImage.value)
            self.kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].pickedBackImage = ext == LocalizedKey.pdf.value ? pdfPlaceHolderImage : image
            
            documentCell.documentBottomBackgroundDashLineView.isHidden = true
            documentCell.documentBottomView.isHidden = false
            documentCell.documentBottomPreviewButton.isHidden = ext != LocalizedKey.pdf.value
            documentCell.documentBottomImageView.image = ext == LocalizedKey.pdf.value ? pdfPlaceHolderImage : image
            
            let idType = self.kycDocumentUploadVM.dataSource[indexPath.section].idType
            if idType == .idProof {
              self.kycDocumentUploadVM.identificationBackDocument = imageURL
              self.kycDocumentUploadVM.identificationBackData = data
              self.kycDocumentUploadVM.identificationBackExtension = ext
              self.kycDocumentUploadVM.identificationBackMediaType = mediaType
            } else {
              self.kycDocumentUploadVM.addressProofBackDocument = imageURL
              self.kycDocumentUploadVM.addressProofBackData = data
              self.kycDocumentUploadVM.addressProofBackExtension = ext
              self.kycDocumentUploadVM.addressBackMediaType = mediaType
            }
          }
          
          if idType == .idProof, self.kycDocumentUploadVM.identification.isEmpty {
            return self.showAlertWith(message: LocalizedKey.messageSelectIdentificationType.value)
          }
          
          if idType == .addressProof, self.kycDocumentUploadVM.addressProof.isEmpty {
            return self.showAlertWith(message: LocalizedKey.messageSelectAddressProofType.value)
          }
          
          self.chooseMediaSource()
        }
      }
      
      documentCell.callbackDelete = { [weak self] itemCell in
        
        guard let `self` = self else {
          return
        }
        
        if let indexPath = self.documentTableView.indexPath(for: itemCell) {
          
          self.kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].isFrontImagePicked = false
          self.kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].pickedFrontImage = nil
          
          documentCell.documentImageParentView.isHidden = false
          documentCell.documentView.isHidden = true
          documentCell.documentImageView.image = UIImage()
          let idType = self.kycDocumentUploadVM.dataSource[indexPath.section].idType
          
          if idType == .idProof {
            self.kycDocumentUploadVM.identificationFrontDocument = ""
          } else {
            self.kycDocumentUploadVM.addressProofFrontDocument = ""
          }
          
        }
      }
      
      documentCell.callbackBottomDelete = { [weak self] itemCell in
        
        guard let `self` = self else {
          return
        }
        
        if let indexPath = self.documentTableView.indexPath(for: itemCell) {
          
          self.kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].isBackImagePicked = false
          self.kycDocumentUploadVM.dataSource[indexPath.section].options[indexPath.row].pickedBackImage = nil
          
          documentCell.documentBottomBackgroundDashLineView.isHidden = false
          documentCell.documentBottomView.isHidden = true
          documentCell.documentBottomImageView.image = UIImage()
          let idType = self.kycDocumentUploadVM.dataSource[indexPath.section].idType
          
          if idType == .idProof {
            self.kycDocumentUploadVM.identificationBackDocument = ""
          } else {
            self.kycDocumentUploadVM.addressProofBackDocument = ""
          }
          
        }
      }
      
      documentCell.callbackPreview = { [weak self] itemCell in
        
        guard let `self` = self else {
          return
        }
        
        if let indexPath = self.documentTableView.indexPath(for: itemCell) {
          let idType = self.kycDocumentUploadVM.dataSource[indexPath.section].idType
          
          if let url = idType == .idProof ? URL(string: self.kycDocumentUploadVM.identificationFrontDocument) : URL(string: self.kycDocumentUploadVM.addressProofFrontDocument) {
            self.fileUrl = url as NSURL
            let previewController = QLPreviewController()
            previewController.dataSource = self
            self.present(previewController)
          }
        }
      }
      
      documentCell.callbackBottomPreview = { [weak self] itemCell in
        
        guard let `self` = self else {
          return
        }
        
        if let indexPath = self.documentTableView.indexPath(for: itemCell) {
          let idType = self.kycDocumentUploadVM.dataSource[indexPath.section].idType
          
          if let url = idType == .idProof ? URL(string: self.kycDocumentUploadVM.identificationBackDocument) : URL(string: self.kycDocumentUploadVM.addressProofBackDocument) {
            self.fileUrl = url as NSURL
            let previewController = QLPreviewController()
            previewController.dataSource = self
            self.present(previewController)
          }
        }
      }
      
      return documentCell
    }
  }
  
}

extension KYCDocumentUploadVC: QLPreviewControllerDataSource, QLPreviewControllerDelegate {
  func numberOfPreviewItems(in controller: QLPreviewController) -> Int {
    return 1
  }
  
  func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
    return self.fileUrl!
  }
}

// MARK: - Table view delegate methods

extension KYCDocumentUploadVC: UITableViewDelegate {
  func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
    guard let cell = tableView.dequeueReusableCell(withIdentifier: UploadDocumentHeaderCell.reuseIdentifier) as? UploadDocumentHeaderCell else { return UITableViewCell() }
    cell.configure(kycDocumentUploadVM.dataSource[section].headerTitle)
    return cell
  }
  
  func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
    let data = kycDocumentUploadVM.dataSource[section].headerTitle
    return data == "" ? 0 : 50
  }
}

// MARK: - UIImagePickerControllerDelegate

extension KYCDocumentUploadVC: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
  func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
    
    if let pickedImage = info[UIImagePickerController.InfoKey.editedImage] as? UIImage {
      
      if let imageData = pickedImage.jpegData(compressionQuality: 1.0) {
        let imageURL = info[.imageURL] as? URL
        
        let imageSize = Double(imageData.count) / 1024.0 / 1024.0
        let validationResponse = self.kycDocumentUploadVM.isValidFileSize(size: imageSize)
        
        if validationResponse.0 {
          self.callback?(pickedImage, imageData, imageURL?.pathExtension ?? LocalizedKey.jpeg.value, LocalizedKey.image.value, "\(String(describing: imageURL))")
        } else {
          showAlertWith(message: validationResponse.1)
        }
      }
    }
    
    picker.dismiss(animated: true, completion: nil)
  }
  
  func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
    picker.dismiss(animated: true, completion: nil)
  }
}

// MARK: - UIDocumentPickerDelegate

extension KYCDocumentUploadVC: UIDocumentPickerDelegate {
  public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
    guard let myURL = urls.first else {
      return
    }
    
    var documentType = LocalizedKey.pdf.value
    
    switch myURL.pathExtension {
    case LocalizedKey.pdf.value:
      documentType = LocalizedKey.pdf.value
    case LocalizedKey.jpg.value, LocalizedKey.jpeg.value, LocalizedKey.png.value:
      documentType = LocalizedKey.image.value
    default:
      showAlertWith(message: LocalizedKey.messageDocumentFileMustType.value)
      return
    }
    
    var documentData = Data()
    do {
      try documentData = Data(contentsOf: myURL)
      
      if documentType != LocalizedKey.pdf.value {
        UIImageView().kf.setImage(with: myURL, placeholder: nil, options: nil, progressBlock: nil) { (result) in
          switch result {
          case .success(let value):
            
            let imageSize = Double(documentData.count) / 1024.0 / 1024.0
            let validationResponse = self.kycDocumentUploadVM.isValidFileSize(size: imageSize)
            
            if validationResponse.0 {
              self.callback?(value.image, documentData, myURL.pathExtension, documentType, "\(myURL)")
            } else {
              self.showAlertWith(message: validationResponse.1)
            }
            
          case .failure:
            break
          }
        }
        return
      }
      
      let imageSize = Double(documentData.count) / 1024.0 / 1024.0
      let validationResponse = self.kycDocumentUploadVM.isValidFileSize(size: imageSize)
      
      if validationResponse.0 {
        self.callback?(UIImage(), documentData, myURL.pathExtension, documentType, "\(myURL)")
      } else {
        self.showAlertWith(message: validationResponse.1)
      }
      
    } catch {
      
    }
    
  }
  
  public func documentMenu(_ documentMenu: UIDocumentPickerViewController, didPickDocumentPicker documentPicker: UIDocumentPickerViewController) {
    documentPicker.delegate = self
    present(documentPicker, animated: true, completion: nil)
  }
  
  func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
    dismiss(animated: true, completion: nil)
  }
}

// MARK: - API Calling

extension KYCDocumentUploadVC {
  private func callAccountMeAPI() {
    kycDocumentUploadVM.accountMeAPI { [weak self] (success, message) in
      
      guard let `self` = self else {
        return
      }
      
      if success {
        
        self.documentTableView.reloadDataInMain()
        if Authorization.shared.userCredentials.countryCode.value != "+1" {
          self.getDocumentAPI()
        }
        
      } else {
        self.showAlertWith(message: message)
      }
    }
  }
  
  private func getDocumentAPI() {
    let parameters: HTTPParameters = [
      "countryCode": Authorization.shared.userCredentials.countryCode.value
    ]
    
    kycDocumentUploadVM.getDocumentAPI(parameters: parameters) { [weak self] (success, message) in
      
      guard let `self` = self else {
        return
      }
      
      if self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.approved.value ||
          self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.uploaded.value {
        self.documentTableView.tableFooterView = nil
        self.documentTableView.contentInset = UIEdgeInsets(top: 0, left: 0, bottom: 80, right: 0)
      } else {
        self.submitButton.isHidden = false
      }

      if success {
        self.documentTableView.reloadDataInMain()
      } else {
        self.showAlertWith(message: message)
      }
      
    }
  }
  
  private func callUploadMediaAPI(
    _ data: Data,
    mediaType: String,
    ext: String,
    completion: @escaping ((String) -> Void)) {
      
      let parameters: HTTPParameters = [
        "mediaFor": "user-kyc",
        "mediaType": mediaType
      ]
      
      kycDocumentUploadVM.uploadMediaAPI(data: data, parameters: parameters, ext: ext, documentType: mediaType) { [weak self] (success, message, basePath) in
        
        guard let `self` = self else {
          return
        }
        
        if success {
          completion(basePath)
        } else {
          HudView.kill()
          self.showAlertWith(message: message)
        }
      }
    }
  
  private func callUpdateKYCAPI() {

    var parameters: HTTPParameters = [
      "idProofName": kycDocumentUploadVM.identification,
      "idProofImage": kycDocumentUploadVM.identificationFrontDocument,
      "addressProofName": kycDocumentUploadVM.addressProof,
      "addressProofImage": kycDocumentUploadVM.addressProofFrontDocument
    ]
    if kycDocumentUploadVM.identificationBackDocument != "" {
      parameters["idProofBackImage"] = kycDocumentUploadVM.identificationBackDocument
    }
    if kycDocumentUploadVM.addressProofBackDocument != "" {
      parameters["addressProofBackImage"] = kycDocumentUploadVM.addressProofBackDocument
    }

    kycDocumentUploadVM.updateKYCAPI(parameters: parameters) { [weak self] (success, message) in
      
      guard let `self` = self else {
        return
      }
      
      if success {
        self.showAlertWith(message: message) {
          self.pop()
        }
      } else {
        self.showAlertWith(message: message)
      }
    }
  }
}
