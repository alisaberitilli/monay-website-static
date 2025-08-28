//
//  SecondaryAccountVC.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

protocol DeleteUserRefreshDelegate: AnyObject {
 func deleteUserDelegate(isDelete: Bool)
}

class SecondaryAccountVC: UIViewController, DeleteUserRefreshDelegate {
  
  // MARK: - IBOutlets

  @IBOutlet weak var tableView: TableView! {
    didSet {
      tableView.dataSource = self
      tableView.placeholderDelegate = self
      tableView.delegate = self
    }
  }

  // MARK: - Instance properties
  
  let secondaryAccountVM = SecondaryAccountVM()
  var selectedIndex = -1

  // MARK: - Life Cycle Methods

    override func viewDidLoad() {
        super.viewDidLoad()
      initialSetup()
    }
    
  // MARK: - Private helper methods
  
  private func initialSetup() {
    callSecondaryUserAPI()
  }
  
  func deleteUserDelegate(isDelete: Bool) {
    print("isDelete ==>> \(isDelete)")
    self.secondaryAccountVM.secondaryUsers = []
    callSecondaryUserAPI()
  }
  
  private func callSecondaryUserAPI() {
    secondaryAccountVM.secondaryUserAPI({ (currentState) in
      self.manageViewState(currentState)
    }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
      self.tableView.reloadDataInMain()
    }
  }

  private func manageViewState(_ currentState: PlaceholderState) {
    switch currentState {
    case .loading:
      tableView.showLoading()
      
    case .defaultState:
      tableView.showDefault()
      
    case .noConnection:
      tableView.showNoConnection()
      
    case .error(let message, let actionType):
      tableView.showError(message: message, actionType: actionType)
      
    case .noResult(let message):
      tableView.showNoResults(title: message, message: PlaceholderStateData.noDataFound.message, image: "")
      
    default:
      break
    }
  }

}

// MARK: - Table view datasource methods

extension SecondaryAccountVC: UITableViewDataSource, UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return secondaryAccountVM.secondaryUsers.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: SecondaryUserCell.reuseIdentifier, for: indexPath) as? SecondaryUserCell else { return UITableViewCell() }
      cell.transictionImage.image = UIImage(named: "ic_transactions")
      cell.transictionView.borderColor = Color.border

      if self.selectedIndex == indexPath.row {
        cell.transictionImage.image = UIImage(named: "ic_transactions_active")
        cell.transictionView.borderColor = Color.blue
      }
        cell.configure(self.secondaryAccountVM.secondaryUsers[indexPath.row])
        cell.callBack = {
          self.selectedIndex = indexPath.row
          self.tableView.reloadData()
          
          DispatchQueue.main.asyncAfter(deadline: .now()+0.5, execute: {
            
            let viewController = StoryboardScene.More.instantiateViewController(withClass: TransactionAccountVC.self)
            let getID = self.secondaryAccountVM.secondaryUsers[indexPath.row].user?.id ?? ""
            viewController.getID = getID
            self.pushVC(viewController)
          })
           
        }
        return cell
    }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    let getID = secondaryAccountVM.secondaryUsers[indexPath.row].user?.id ?? ""
    let viewController = StoryboardScene.More.instantiateViewController(withClass: SecondaryUserProfileVC.self)
    viewController.delegate = self
    viewController.getID = getID
    self.pushVC(viewController)
  }
  
}

// MARK: - API Calling

extension SecondaryAccountVC {
    private func callSecondaryUsersAPI() {
    }
}

// MARK: - PlaceholderDelegate

extension SecondaryAccountVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
      callSecondaryUsersAPI()
      
    default:
      break
    }
  }
}
