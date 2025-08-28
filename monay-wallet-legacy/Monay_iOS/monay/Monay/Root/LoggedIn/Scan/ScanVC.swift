//
//  ScanVC.swift
//  Monay
//
//  Created by WFH on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import AVFoundation

class ScanVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var scanCollectionView: UICollectionView!
    @IBOutlet weak var scannerView: QRScannerView!
    @IBOutlet weak var showMyCodeButton: UIButton!

    var qrData: QRData? = nil {
        didSet {
            
            guard qrData != nil else { return }
            
            let json = self.qrData?.codeString?.getJsonDataDict()
            
          guard let userIdAny = json?[APIKey.userId],
                let userId = userIdAny as? String else {
              showAlertWith(message: LocalizedKey.invalidCode.value) {
                        self.viewWillAppear(true)
                    }
                    return
            }
            
            callUserDetailsAPI(userId: userId)
        }
    }
    
    // MARK: - Instance properties
    
    let scanVM = ScanVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)

        if !scannerView.isRunning {
            scannerView.startScanning()
        }
        
         scannerView.startAnimation()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
         super.viewWillDisappear(animated)
        
         if !scannerView.isRunning {
             scannerView.stopScanning()
         }
     }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        self.showMyCodeButton.isHidden = Authorization.shared.userCredentials.userType == .secondaryUser
        callRecentUserAPI()
        scannerView.delegate = self
    }
    
    private func moveToPayMoney(userId: String) {
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: PayMoneyVC.self)
        viewController.payMoneyVM.user = scanVM.user
        pushVC(viewController)
    }
    
    private func moveToRequestMoney(userId: String) {
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: RequestMoneyVC.self)
        viewController.requestMoneyVM.user = scanVM.user
        pushVC(viewController)
    }
    
    func toggleTorch(isOn: Bool) {
        guard let device = AVCaptureDevice.default(for: .video) else { return }
        
        if device.hasTorch {
            do {
                try device.lockForConfiguration()
                
                if isOn == true {
                    device.torchMode = .on
                } else {
                    device.torchMode = .off
                }
                
                device.unlockForConfiguration()
            } catch {
            }
        } else {
        }
    }
    
    @IBAction func crossButtonAction(_ sender: Any) {
        dismiss()
    }
    
    @IBAction func showMyCodeButtonAction(_ sender: Any) {
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: QRCodeShareVC.self)
        viewController.modalPresentationStyle = .overFullScreen
        present(viewController)
    }
    
    @IBAction func torchButtonAction(_ sender: UIButton) {
        toggleTorch(isOn: !sender.isSelected)
        sender.isSelected = !sender.isSelected
    }
    
    @IBAction func nameMobileNumberButtonAction(_ sender: Any) {
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: MyContactVC.self)
        viewController.mycontactVM.paymentType = .send
        hideCircleView()
        pushVC(viewController)
    }
}

// MARK: - Collection view datasource methods

extension ScanVC: UICollectionViewDataSource {
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        let count = scanVM.recentUsers.count
        
        if count == 0 {
            collectionView.showPlaceholderLabelWith(message: LocalizedKey.messageNoDataAvailable.value)
        } else {
            collectionView.removePlaceholderLabel()
        }
        
        return count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
      guard let cell = collectionView.dequeueReusableCell(withReuseIdentifier: ContactRecentCell.identifier, for: indexPath) as? ContactRecentCell else {
            return UICollectionViewCell()
        }
        
         cell.configure(recentUser: scanVM.recentUsers[indexPath.row])
        return cell
    }
}

// MARK: - Collection view delegate methods

extension ScanVC: UICollectionViewDelegate {
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let user = scanVM.recentUsers[indexPath.row]
        
        switch scanVM.paymentType {
        case .send:
            let viewController = StoryboardScene.Main.instantiateViewController(withClass: PayMoneyVC.self)
            viewController.payMoneyVM.user = user
            pushVC(viewController)
        case .request:
            let viewController = StoryboardScene.Main.instantiateViewController(withClass: RequestMoneyVC.self)
            viewController.requestMoneyVM.user = user
            pushVC(viewController)
        }
    }
}

// MARK: - QRScannerViewDelegate

extension ScanVC: QRScannerViewDelegate {
    func qrScanningDidStop() {
    }
    
    func qrScanningDidFail() {
      showAlertWith(message: LocalizedKey.scanFailed.value)
    }
    
    func qrScanningSucceededWithCode(_ str: String?) {
        self.qrData = QRData(codeString: str)
    }
}

// MARK: - API Call

extension ScanVC {
    private func callRecentUserAPI() {
        
        scanVM.recentUsersAPI(completion: { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            self.scanCollectionView.reloadDataInMain()
            
            if !success {
                self.showAlertWith(message: message)
            }
        })
    }
    
    private func callUserDetailsAPI(userId: String) {
        
        scanVM.getUserDetails(userId: userId, completion: { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                if self.scanVM.paymentType == .request {
                    self.moveToRequestMoney(userId: userId)
                } else {
                    self.moveToPayMoney(userId: userId)
                }
            } else {
                self.showAlertWith(message: message) {
                    self.viewWillAppear(true)
                }
            }
        })
    }
}
