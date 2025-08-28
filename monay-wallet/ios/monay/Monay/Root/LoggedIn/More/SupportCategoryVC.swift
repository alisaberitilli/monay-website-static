//
//  SupportCategoryVC.swift
//  Monay
//
//  Created by WFH on 26/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
// import ZendeskSDK // Temporarily disabled
// import ZendeskCoreSDK // Temporarily disabled

class SupportCategoryVC: UIViewController {
    
    // MARK: - Instance properties
    
    let supportCategoryVM = SupportCategoryVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.navigationController?.isNavigationBarHidden = true
    }
}

// MARK: - Table view datasource methods

extension SupportCategoryVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return supportCategoryVM.supportCategories.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
      guard let cell = tableView.dequeueReusableCell(withIdentifier: SupportCategoryCell.identifier, for: indexPath) as? SupportCategoryCell else {
            return UITableViewCell()
        }
        
        cell.tag = indexPath.row
        cell.selectionStyle = .none
        
        cell.configure(category: supportCategoryVM.supportCategories[indexPath.row])
        
        return cell
    }
}

// MARK: - Table view delegate methods

extension SupportCategoryVC: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        // Zendesk temporarily disabled
        /*
        let config = RequestUiConfiguration()
        let viewController = RequestUi.buildRequestList(with: [config])
        let firstName = Authorization.shared.userCredentials.firstName.value
        let phoneNumber = Authorization.shared.userCredentials.phoneNumber.value
        
        let identity = Identity.createAnonymous(name: firstName, email: phoneNumber)
        Zendesk.instance?.setIdentity(identity)
        */
        
        // Create a simple alert as temporary replacement
        let alert = UIAlertController(title: "Support", message: "Support feature temporarily unavailable", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
        
        navigationController?.navigationBar.barTintColor = #colorLiteral(red: 0.03137254902, green: 0.6666666667, blue: 1, alpha: 1)
        navigationController?.navigationBar.tintColor = .white
        if #available(iOS 13.0, *) {
            navigationController?.navigationBar.standardAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        } else {
            navigationController?.navigationBar.titleTextAttributes = [.foregroundColor: UIColor.white]
        }
        navigationController?.isNavigationBarHidden = false
        
        switch indexPath.row {
        case 0:
          config.tags = [SupportCategoryVM.addMoney]
            self.navigationController?.pushViewController(viewController, animated: true)
        case 1:
          config.tags = [SupportCategoryVM.sendMoney]
            self.navigationController?.pushViewController(viewController, animated: true)
        case 2:
          config.tags = [SupportCategoryVM.requestMoney]
            self.navigationController?.pushViewController(viewController, animated: true)
        case 3:
          config.tags = [SupportCategoryVM.failedTransactions]
            self.navigationController?.pushViewController(viewController, animated: true)
        case 4:
          config.tags = [SupportCategoryVM.accountSettings]
            self.navigationController?.pushViewController(viewController, animated: true)
        case 5:
          config.tags = [SupportCategoryVM.kycSupport]
            self.navigationController?.pushViewController(viewController, animated: true)
        case 6:
          config.tags = [SupportCategoryVM.reportFraudActivity]
            self.navigationController?.pushViewController(viewController, animated: true)
        case 7:
          config.tags = [SupportCategoryVM.others]
            self.navigationController?.pushViewController(viewController, animated: true)
        default:
            break
        }
    }
}
