//
//  IntroductionVC.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class IntroductionVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var buildVersionLabel: UILabel!
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
         initialSetup()
    }
    
    private func initialSetup() {
        let dictionary = Bundle.main.infoDictionary
        if let version = dictionary?[bundleShortVersionString] as? String,
            let build = dictionary?[bundleVersion] as? String {
            buildVersionLabel.text = "\(version)(\(build))"
        }
    }
    
    // MARK: - IBAction
    
    @IBAction func nextButton_Action(_ sender: UIButton) {
        let viewController = StoryboardScene.Account.instantiateViewController(withClass: LoginVC.self)
        self.pushVC(viewController)
    }
    
}

extension IntroductionVC: DeepLinkHandler {
  func handle(_ info: [String: Any]) {
    
    guard let referralCode = info["referal_code"] as? String else {
      return
    }
    if !appDelegate.isLoggedIn {
      Authorization.shared.referralCode = referralCode
    }
  }
}
