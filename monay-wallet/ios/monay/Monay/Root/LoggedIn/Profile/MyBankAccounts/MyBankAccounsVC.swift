//
//  MyBankAccounsVC.swift
//  Monay
//
//  Created by WFH on 21/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class MyBankAccounsVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var myBankAccountsTableView: TableView!
    
    // MARK: - Instance properties
    
    let myBankAccounsVM = MyBankAccountsVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
        callGetBanksAPI()
    }
    
    private func configuretableView() {
        myBankAccountsTableView.placeholderDelegate = self
    }

    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        myBankAccountsTableView.showLoading()

      case .defaultState:
        myBankAccountsTableView.showDefault()

      case .noConnection:
        myBankAccountsTableView.showNoConnection()

      case .error(let message, let actionType):
        myBankAccountsTableView.showError(message: message, actionType: actionType)

      case .noResult(let message):
        myBankAccountsTableView.showNoResults(title: message, message: PlaceholderStateData.noBankAccount.message, image: "")

      default:
        break
      }
    }

    // MARK: - IBAction methods
    
    @IBAction func addNewButtonAction(_ sender: Any) {
        
        definesPresentationContext = true
        providesPresentationContextTransitionStyle = true
        
        overlayBlurredBackgroundView()
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: AddNewBankVC.self)
        viewController.onCompleteAddBank = {
            self.removeBlurredBackgroundViewView()
            self.callGetBanksAPI()
        }
        
        viewController.onCrossClick = {
            self.removeBlurredBackgroundViewView()
        }
        
        viewController.modalPresentationStyle = .overFullScreen
        present(viewController)
    }
}

// MARK: - Table view datasource methods

extension MyBankAccounsVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return myBankAccounsVM.banks.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
      guard let cell = tableView.dequeueReusableCell(withIdentifier: MyBankAccountCell.identifier, for: indexPath) as? MyBankAccountCell else {
            return UITableViewCell()
        }
        
        cell.tag = indexPath.row
        cell.configure(bank: myBankAccounsVM.banks[indexPath.row])
        
        cell.callbackDelete = { [weak self] itemCell in
            
            guard let `self` = self else {
                return
            }
          
            if let index = self.myBankAccountsTableView.indexPath(for: itemCell) {
                let bankIdString = self.myBankAccounsVM.banks[index.row].id ?? "0"
                let bankId = Int(bankIdString)
                self.callDeleteCardAPI(bankId: bankId ?? 0)
            }

        }
        return cell
    }
}

// MARK: - API Calling

extension MyBankAccounsVC {
    private func callGetBanksAPI() {
        
        myBankAccounsVM.banks = []
        self.manageViewState(.defaultState)
      
        myBankAccounsVM.getBanksAPI({ (currentState) in
          self.manageViewState(currentState)
        }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
          self.myBankAccountsTableView.reloadDataInMain()
        }
    }
    
    private func callDeleteCardAPI(bankId: Int) {
        
        myBankAccounsVM.deleteBankAPI(bankId: bankId) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.callGetBanksAPI()
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - PlaceholderDelegate

extension MyBankAccounsVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callGetBanksAPI()
      
    default:
      break
    }
  }
}
