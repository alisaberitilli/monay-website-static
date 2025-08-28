//
//  SuccessfullVC.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class SuccessfullVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var toUserLabel: UILabel!
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var transactionIdLabel: UILabel!
    @IBOutlet weak var transactionStatusImageView: UIImageView!
    
    // MARK: - Instance properties
    
    let successfullVM = SuccessfullVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    private func initialSetup() {
        setupUI()
    }
    
    private func setupUI() { 
        
      if successfullVM.transaction?.status == LocalizedKey.failed.value {
            
            transactionStatusImageView.image = #imageLiteral(resourceName: "ic_error_failed")
            
            switch successfullVM.redirectFrom {
            case .payMoney:
              titleLabel.text = LocalizedKey.sendMoneyFailed.value
            case .requestMoney:
              titleLabel.text = LocalizedKey.requestMoneyFailed.value
                 transactionIdLabel.isHidden = true
            case .addMoney:
                titleLabel.text = LocalizedKey.addMoneyFailed.value
                toUserLabel.isHidden = true
            case .withdrawalRequestMoney:
                titleLabel.text = LocalizedKey.withdrawMoneyFailed.value
                 toUserLabel.isHidden = true
            default:
                break
            }
            
        } else {
            
            switch successfullVM.redirectFrom {
            case .payMoney:
              titleLabel.text = LocalizedKey.moneySentSuccessfully.value
            case .requestMoney:
              titleLabel.text = LocalizedKey.requestForMoneySuccessfully.value
                transactionIdLabel.isHidden = true
            case .addMoney:
                titleLabel.text = LocalizedKey.moneyAddedSuccessfully.value
                toUserLabel.isHidden = true
            case .withdrawalRequestMoney:
                titleLabel.text = LocalizedKey.withdrawMoneySuccessfully.value
                toUserLabel.isHidden = true
            default:
                break
            }
        }
        
      toUserLabel.text = "\(LocalizedKey.to.value) \(successfullVM.user?.firstName ?? "")"
        
        let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
        amountLabel.text = "\(currencySymbol) \(successfullVM.amount)"
      transactionIdLabel.text = "\(LocalizedKey.transactionID.value) \(successfullVM.transaction?.transactionId ?? "-")"
    }
    
    // MARK: - IBAction methods
    
    @IBAction func goToHomeButtonAction(_ sender: Any) {
        
        if checkControllerInNavigationStack(ScanVC.self) {
            appDelegate.setDashboardRoot()
        } else {
            tabBarController?.selectedIndex = 0
            navigationController?.popToRootViewController(animated: true)
        }
    }
}
