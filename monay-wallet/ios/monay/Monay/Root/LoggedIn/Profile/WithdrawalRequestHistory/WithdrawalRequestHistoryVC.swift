//
//  WithdrawalRequestHistoryVC.swift
//  Monay
//
//  Created by WFH on 27/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class WithdrawalRequestHistoryVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var withdrawalRequestHistoryTableView: TableView!
    
    // MARK: - Instance properties
    
    let withdrawalRequestHistoryVM = WithdrawalRequestHistoryVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
        callWithdrawalRequestHistoryAPI()
    }
    
    private func configuretableView() {
        withdrawalRequestHistoryTableView.placeholderDelegate = self
    }

    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !withdrawalRequestHistoryVM.isFetching && withdrawalRequestHistoryVM.transactions.count < withdrawalRequestHistoryVM.total {
                withdrawalRequestHistoryVM.isFetching = true
                withdrawalRequestHistoryVM.isInitialFetchCompleted = true
                withdrawalRequestHistoryVM.offset =  withdrawalRequestHistoryVM.transactions.count
                withdrawalRequestHistoryTableView.showLoaderAtBottom(true)
                callWithdrawalRequestHistoryAPI()
            }
        }
    }
    
    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        withdrawalRequestHistoryTableView.showLoading()
        
      case .defaultState:
        withdrawalRequestHistoryTableView.showDefault()
        
      case .noConnection:
        withdrawalRequestHistoryTableView.showNoConnection()
        
      case .error(let message, let actionType):
        withdrawalRequestHistoryTableView.showError(message: message, actionType: actionType)
        
      case .noResult(let message):
        withdrawalRequestHistoryTableView.showNoResults(title: message, message: PlaceholderStateData.noWithdrawHistory.message, image: "")
        
      default:
        break
      }
    }

}

// MARK: - Table view datasource methods

extension WithdrawalRequestHistoryVC: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return withdrawalRequestHistoryVM.transactions.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
      guard let cell = tableView.dequeueReusableCell(withIdentifier: WithdrawalRequestHistoryCell.identifier, for: indexPath) as? WithdrawalRequestHistoryCell else { return UITableViewCell() }
        
        cell.configure(transaction: self.withdrawalRequestHistoryVM.transactions[indexPath.row])
        
        return cell
    }
}

// MARK: - Table view delegate methods

extension WithdrawalRequestHistoryVC: UITableViewDelegate { }

// MARK: - API Calling

extension WithdrawalRequestHistoryVC {
    private func callWithdrawalRequestHistoryAPI() {
      
        withdrawalRequestHistoryVM.withdrawalRequestHistoryAPI({ (currentState) in
          self.manageViewState(currentState)
        }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
          self.withdrawalRequestHistoryTableView.showLoaderAtBottom(false)
          self.withdrawalRequestHistoryTableView.reloadDataInMain()
        }
    }
}

// MARK: - PlaceholderDelegate

extension WithdrawalRequestHistoryVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callWithdrawalRequestHistoryAPI()
      
    default:
      break
    }
  }
}
