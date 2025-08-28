//
//  InviteVC.swift
//  Monay
//
//  Created by WFH on 22/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class InviteVC: UIViewController {

     // MARK: - IBOutlet properties
    
    @IBOutlet weak var userLabel: UILabel!
    @IBOutlet weak var inviteButton: UIButton!
    
    // MARK: - Instance properties
    
    let inviteVM = InviteVM()
    var onComplete: (() -> Void)?
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
     // MARK: - Private helper methods
    
    private func initialSetup() {
      userLabel.text = "\(inviteVM.userName) \(LocalizedKey.isNotOnMonay.value)"
    }
    
    // MARK: - IBAction methods
    
    @IBAction func crossButtonAction(_ sender: Any) {
        dismiss()
        onComplete?()
    }
    
    @IBAction func inviteButtonAction(_ sender: Any) {
        var inviteMessage = Authorization.shared.generalSetting.inviteMessage ?? ""
        let appStorePath = "\(appStoreBaseURL)\(appStoreId)"
        inviteMessage = inviteMessage.replacingOccurrences(of: appLinkReplace, with: appStorePath)
        
        let shareAll: [Any] = [inviteMessage]
        let activityViewController = UIActivityViewController(activityItems: shareAll, applicationActivities: nil)
        activityViewController.popoverPresentationController?.sourceView = self.view
        activityViewController.completionWithItemsHandler = { (_, success, _, _) in
            print(success ? APIKey.success : APIKey.failure)
        }
        
        present(activityViewController, animated: true, completion: nil)
        
    }
}
