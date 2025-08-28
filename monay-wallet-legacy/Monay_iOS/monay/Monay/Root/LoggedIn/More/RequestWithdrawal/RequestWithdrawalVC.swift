//
//  RequestWithdrawalVC.swift
//  Monay
//
//  Created by WFH on 21/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import ActionSheetPicker_3_0

class RequestWithdrawalVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var walletLabel: UILabel!
    @IBOutlet weak var amountTextField: UITextField!
    @IBOutlet weak var bankNameLabel: UILabel!
    @IBOutlet weak var sendRequestButton: UIButton!
    @IBOutlet weak var currencyLabel: UILabel!
    
    // MARK: - Instance properties
    
    let requestWithdrawalVM = RequestWithdrawalVM()
    var dropDown: DropDown!

    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        callWalletAPI()
        callGetBanksAPI()
        
        let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
        currencyLabel.text = currencySymbol
    }
    
    private func setupData(wallet: Wallet) {
        
        if let totalWalletAmount = wallet.totalWalletAmount {
            let currency = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            walletLabel.text = currency + " " + totalWalletAmount
        }
    }
    
  func showDropDown(sender: UIButton, bankNames: [Bank]) {
     var items: [CellConfigurator] =  [CellConfigurator]()
    
    for item in bankNames {
      items.append(TableCellConfigurator<DropDownTableViewCell, DropDownData>(item: DropDownData(title: item.bankName ?? "", subtitle: item.last4Digit ?? "")))
    }
    dropDown = DropDown.init(dropDownConfiguration: DropDownConfiguration(customeCellItems: items, viewHeight: .auto, allowShadow: true, dropDownAppearance: DropDownAppearance(shadowColor: #colorLiteral(red: 0.9607843137, green: 0.968627451, blue: 1, alpha: 1), borderColor: .clear, cornerRadius: 5, shadowRadius: 5, shadowOffset: 0.5))) // swiftlint:disable:this line_length
    
    dropDown.show(anchor: sender)
    
    dropDown.selectionClosure = { [weak self] selectedIndex in
        
        guard let self = self else {
            return
        }
        
        DispatchQueue.main.async {
            let bankName = bankNames[selectedIndex].bankName ?? ""
            let last4Digit = bankNames[selectedIndex].last4Digit ?? ""
          let last4DigitWithPlaceholder =  "\(LocalizedKey.accountNumber.value) \(LocalizedKey.secureText.value) \(last4Digit)"
            self.bankNameLabel.text = "\(bankName) \n \(last4DigitWithPlaceholder)"
            let bankIds = self.requestWithdrawalVM.banks.compactMap { $0.id }
            self.requestWithdrawalVM.bankId = bankIds[selectedIndex]
        }
    }

  }

    // MARK: - IBAction methods
    
    @IBAction func selectBankNameAction(_ sender: UIButton) {
        
        guard requestWithdrawalVM.banks.isEmpty else {
            
            return showDropDown(sender: sender, bankNames: requestWithdrawalVM.banks)
        }
        
      showAlert(message: LocalizedKey.messageAddBank.value, okTitle: LocalizedKey.ok.value, cancelTitle: LocalizedKey.cancel.value) { [weak self] (calbackType) in
            
            guard let `self` = self else {
                return
            }
            
            if calbackType == LocalizedKey.ok.value {
                
                self.definesPresentationContext = true
                self.providesPresentationContextTransitionStyle = true
                
                self.overlayBlurredBackgroundView()
                let viewController = StoryboardScene.Profile.instantiateViewController(withClass: AddNewBankVC.self)
                viewController.onCompleteAddBank = { [weak self] in
                    
                    guard let `self` = self else {
                        return
                    }
                    
                    self.removeBlurredBackgroundViewView()
                    self.callGetBanksAPI()
                }
                
                viewController.onCrossClick = {
                    self.removeBlurredBackgroundViewView()
                }
                
                viewController.modalPresentationStyle = .overFullScreen
                self.present(viewController)
            }
        }
    }
    
    @IBAction func sendRequestAction(_ sender: Any) {
        
      let bankName = ((bankNameLabel.text ?? "") == LocalizedKey.selectBank.value) ? "" : bankNameLabel.text!
        
        let data = [
            amountTextField.text ?? "",
            bankName
        ]
        
        let enteredAmount = Double(amountTextField.text ?? "0.0") ?? 0.0
        let totalWallet = Double(requestWithdrawalVM.wallet?.totalWalletAmount ?? "0.0") ?? 0.0
        let validationResponse = requestWithdrawalVM.isValidText(data, enteredAmount: enteredAmount, totalWallet: totalWallet)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: PinVC.self)
        let userDetail = UserDetail(
            requestId: "",
            toUserId: "",
            amount: amountTextField.text ?? "",
            refillAmount: "",
            message: "",
            paymentMethod: "",
            cardId: "",
            cardType: "",
            cardNumber: "",
            nameOnCard: "",
            month: "",
            year: "",
            cvv: "",
            saveCard: "",
            isUserRequestPayMoney: false,
            bankId: requestWithdrawalVM.bankId, parentId: "")
        viewController.pinVM.userDetail = userDetail
        viewController.pinVM.redirectFrom = RedirectFrom.withdrawalRequestMoney
        
        pushVC(viewController)
    }
}

// MARK: - API Call

extension RequestWithdrawalVC {
    private func callWalletAPI() {
        
        requestWithdrawalVM.walletAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                guard let wallet = self.requestWithdrawalVM.wallet else { return }
                
                self.setupData(wallet: wallet)
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callGetBanksAPI() {
        
        requestWithdrawalVM.getBanksAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if !success {
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - Text field delegate methods

extension RequestWithdrawalVC: UITextFieldDelegate {
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
        guard let oldText = textField.text, let rangeInOldText = Range(range, in: oldText) else {
            return true
        }
        
        let newText = oldText.replacingCharacters(in: rangeInOldText, with: string)
        let isNumeric = newText.isEmpty || (Double(newText) != nil)
        let numberOfDots = newText.components(separatedBy: ".").count - 1
        
        let numberOfDecimalDigits: Int
        if let dotIndex = newText.firstIndex(of: ".") {
            numberOfDecimalDigits = newText.distance(from: dotIndex, to: newText.endIndex) - 1
        } else {
            numberOfDecimalDigits = 0
        }
        
        var numberOfIntDigits = newText.count
        if let dotIndex2 = newText.lastIndex(of: ".") {
            numberOfIntDigits = newText.distance(from: newText.startIndex, to: dotIndex2)
        }
        
        return isNumeric && numberOfDots <= 1 && numberOfDecimalDigits <= 2 && numberOfIntDigits <= 6
    }
}
