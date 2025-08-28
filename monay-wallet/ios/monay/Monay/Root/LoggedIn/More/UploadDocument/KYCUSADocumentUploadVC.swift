//
//  KYCUSADocumentUploadVC.swift
//  Monay
//
//  Created by Govind Prasad on 20/02/21.
//  Copyright © 2021 Codiant. All rights reserved.
//

import UIKit
import QuickLook
import MobileCoreServices
 
class KYCUSADocumentUploadVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var documentTableView: UITableView!
    
    // MARK: - Instance properties
    
    let kycDocumentUploadVM = KYCUSADocumentUploadVM()
    var dataSource: [DataSource] = []
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
    }
    
    private func prepareDataSource() {

      dataSource = [
            DataSource(
              headerTitle: LocalizedKey.selectPictureIdentificationDoc.value,
              options: [Option(name: LocalizedKey.passport.value), Option(name: LocalizedKey.driverLicense.value), Option(name: LocalizedKey.nationalID.value)],
                type: .title,
                idType: .idProof),
            DataSource(
                headerTitle: "",
                options: [Option(name: "")],
                type: .image,
                idType: .idProof),
            DataSource(
              headerTitle: LocalizedKey.selectProofOfAddress.value,
              options: [Option(name: LocalizedKey.utilityBill.value), Option(name: LocalizedKey.bankStatement.value), Option(name: LocalizedKey.rentalContract.value), Option(name: LocalizedKey.postMarkedMail.value)],
                type: .title,
                idType: .addressProof),
            DataSource(
                headerTitle: "",
                options: [Option(name: "")],
                type: .image,
                idType: .addressProof)
            
        ]
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
            kycDocumentUploadVM.identificationData ?? Data(),
            mediaType: kycDocumentUploadVM.identificationMediaType,
            ext: kycDocumentUploadVM.identificationExtension) { [weak self] (basePath) in
            
            guard let `self` = self else {
                return
            }
            
            self.kycDocumentUploadVM.identificationDocument = basePath
            
            self.callUploadMediaAPI(
                self.kycDocumentUploadVM.addressProofData ?? Data(),
                mediaType: self.kycDocumentUploadVM.addressMediaType,
                ext: self.kycDocumentUploadVM.addressProofExtension) { [weak self] (basepath) in
                
                guard let `self` = self else {
                    return
                }
                
                // HudView.kill()
                self.kycDocumentUploadVM.addressProofDocument = basepath
                self.callUpdateKYCAPI()
            }
            }
    }
}

// MARK: - Table view datasource methods

extension KYCUSADocumentUploadVC: UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return dataSource.count
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        let type = dataSource[section].type
        
        switch type {
        case .title:
            return dataSource[section].options.count
        case .image:
            return dataSource[section].options.count
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell { // swiftlint:disable:this function_body_length
        let type = dataSource[indexPath.section].type
        
        switch type {
        case .title:
            
            guard let uploadDocumentCell = tableView.dequeueReusableCell(
                    withIdentifier: UploadDocumentCell.reuseIdentifier) as? UploadDocumentCell else {
                return UITableViewCell()
            }
            
            let idType = dataSource[indexPath.section].idType
            let selectedIdName = idType == .idProof ? kycDocumentUploadVM.identification : kycDocumentUploadVM.addressProof
            let idName = dataSource[indexPath.section].options[indexPath.row].name
            uploadDocumentCell.set(idName, selectedOption: selectedIdName)
            
            uploadDocumentCell.callback = { [weak self] (uploadDocumentCell, idName) in
                
                guard let `self` = self else {
                    return
                }
                
                guard let indexPath = self.documentTableView.indexPath(for: uploadDocumentCell)  else {
                    return
                }
                
              if self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.pending.value || self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.rejected.value.lowercased() {
                    
                    if self.dataSource[indexPath.section].idType == .idProof {
                        self.kycDocumentUploadVM.identification = idName
                    } else {
                        self.kycDocumentUploadVM.addressProof = idName
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
            
            let idType = dataSource[indexPath.section].idType
            let document = idType == .idProof ? kycDocumentUploadVM.identificationDocument : kycDocumentUploadVM.addressProofDocument
            
            if dataSource[indexPath.section].options[indexPath.row].isPickedImage {
                documentCell.documentView.isHidden = false
                if let pickedImage = dataSource[indexPath.section].options[indexPath.row].pickedImage {
                    documentCell.documentImageView.image = pickedImage
                }
            } else {
                documentCell.documentView.isHidden = true
            }
            
            if let documentUrl = URL(string: document) {
                
              let pdfPlaceHolderImage = UIImage(named: LocalizedKey.pdfImage.value)
                
              if self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.approved.value ||
                  self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.uploaded.value {
                    documentCell.documentView.isHidden = false
                document.contains(LocalizedKey.pdf.value) ? documentCell.documentImageView.image = pdfPlaceHolderImage : documentCell.documentImageView.setImage(with: documentUrl)
                    documentCell.documentPreviewButton.isHidden = true
                    documentCell.documentDeleteButton.isHidden = true
                    documentCell.documentImageView.isUserInteractionEnabled = false
                }
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
                        
                        self.dataSource[indexPath.section].options[indexPath.row].isPickedImage = true
                        let pdfPlaceHolderImage = UIImage(named: LocalizedKey.pdfImage.value)
                        self.dataSource[indexPath.section].options[indexPath.row].pickedImage = ext == LocalizedKey.pdf.value ? pdfPlaceHolderImage : image
                        
                        documentCell.documentImageParentView.isHidden = true
                        documentCell.documentView.isHidden = false
                        documentCell.documentPreviewButton.isHidden = ext != LocalizedKey.pdf.value
                        documentCell.documentImageView.image = ext == LocalizedKey.pdf.value ? pdfPlaceHolderImage : image
                        
                        let idType = self.dataSource[indexPath.section].idType
                        if idType == .idProof {
                            self.kycDocumentUploadVM.identificationDocument = imageURL
                            self.kycDocumentUploadVM.identificationData = data
                            self.kycDocumentUploadVM.identificationExtension = ext
                            self.kycDocumentUploadVM.identificationMediaType = mediaType
                        } else {
                            self.kycDocumentUploadVM.addressProofDocument = imageURL
                            self.kycDocumentUploadVM.addressProofData = data
                            self.kycDocumentUploadVM.addressProofExtension = ext
                            self.kycDocumentUploadVM.addressMediaType = mediaType
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
                    
                    self.dataSource[indexPath.section].options[indexPath.row].isPickedImage = false
                    self.dataSource[indexPath.section].options[indexPath.row].pickedImage = nil
                    
                    documentCell.documentImageParentView.isHidden = false
                    documentCell.documentView.isHidden = true
                    documentCell.documentImageView.image = UIImage()
                    let idType = self.dataSource[indexPath.section].idType
                    
                    if idType == .idProof {
                        self.kycDocumentUploadVM.identificationDocument = ""
                    } else {
                        self.kycDocumentUploadVM.addressProofDocument = ""
                    }
                    
                }
            }
            
            documentCell.callbackPreview = { [weak self] itemCell in
                
                guard let `self` = self else {
                    return
                }
                
                if let indexPath = self.documentTableView.indexPath(for: itemCell) {
                    let idType = self.dataSource[indexPath.section].idType
                    
                    if let url = idType == .idProof ? URL(string: self.kycDocumentUploadVM.identificationDocument) : URL(string: self.kycDocumentUploadVM.addressProofDocument) {
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

extension KYCUSADocumentUploadVC: QLPreviewControllerDataSource, QLPreviewControllerDelegate {
    func numberOfPreviewItems(in controller: QLPreviewController) -> Int {
        return 1
    }
    
    func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
        return self.fileUrl!
    }
}

// MARK: - Table view delegate methods

extension KYCUSADocumentUploadVC: UITableViewDelegate {
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
      guard let cell = tableView.dequeueReusableCell(withIdentifier: UploadDocumentHeaderCell.reuseIdentifier) as? UploadDocumentHeaderCell else { return UITableViewCell() }
        cell.configure(dataSource[section].headerTitle)
        return cell
    }
}

// MARK: - UIImagePickerControllerDelegate

extension KYCUSADocumentUploadVC: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
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

extension KYCUSADocumentUploadVC: UIDocumentPickerDelegate {
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

extension KYCUSADocumentUploadVC {
    private func callAccountMeAPI() {
        kycDocumentUploadVM.accountMeAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
                self.documentTableView.reloadDataInMain()
                
              if self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.approved.value ||
                  self.kycDocumentUploadVM.accountMe?.kycStatus == LocalizedKey.uploaded.value {
                    self.documentTableView.tableFooterView = nil
                }
                
            } else {
              if message != "" {
                self.showAlertWith(message: message)
              }
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
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callUpdateKYCAPI() {
        
        let parameters: HTTPParameters = [
            "idProofName": kycDocumentUploadVM.identification,
            "idProofImage": kycDocumentUploadVM.identificationDocument,
            "addressProofName": kycDocumentUploadVM.addressProof,
            "addressProofImage": kycDocumentUploadVM.addressProofDocument
        ]
        
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
