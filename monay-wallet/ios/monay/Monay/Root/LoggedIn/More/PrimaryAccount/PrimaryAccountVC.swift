//
//  PrimaryAccountVC.swift
//  Monay
//
//  Created by Aayushi Bhagat on 09/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

class PrimaryAccountVC: UIViewController {
  
  // MARK: - IBOutlets

  @IBOutlet weak var tableView: TableView!

  // MARK: - Instance properties
  
  let primaryAccountVM = PrimaryAccountVM()

  // MARK: - Life Cycle Methods

    override func viewDidLoad() {
        super.viewDidLoad()
      initialSetup()
    }
    
  // MARK: - Private helper methods
  
  private func initialSetup() {
      configuretableView()
      callPrimaryUserAPI()

  }

  private func configuretableView() {
      tableView.dataSource = self
      tableView.placeholderDelegate = self
  }

    private func callPrimaryUserAPI() {
      primaryAccountVM.primaryUser({ (currentState) in
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
      tableView.showNoResults(title: message, message: PlaceholderStateData.noNotificationFound.message, image: "")
      
    default:
      break
    }
  }

}

// MARK: - Table view datasource methods

extension PrimaryAccountVC: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return primaryAccountVM.primaryUsers.count // secondaryAccountVM.secondaryUsers.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: SecondaryUserCell.reuseIdentifier, for: indexPath) as? SecondaryUserCell else { return UITableViewCell() }
        cell.configureParant(self.primaryAccountVM.primaryUsers[indexPath.row])
        return cell
    }
}

// MARK: - API Calling

extension PrimaryAccountVC {
    private func callSecondaryUsersAPI() {
    }
}

// MARK: - PlaceholderDelegate

extension PrimaryAccountVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
      callSecondaryUsersAPI()
      
    default:
      break
    }
  }
}
