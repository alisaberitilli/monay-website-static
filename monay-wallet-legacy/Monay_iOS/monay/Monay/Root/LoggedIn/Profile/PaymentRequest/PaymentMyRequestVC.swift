//
//  MyRequestVC.swift
//  Monay
//
//  Created by WFH on 24/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentMyRequestVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var requestTableView: TableView!
    
    // MARK: - Instance properties
    
    let paymentMyRequestVM = PaymentMyRequestVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
         initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
        callMyRequestAPI()
    }
      
    private func configuretableView() {
        requestTableView.placeholderDelegate = self
    }

    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !paymentMyRequestVM.isFetching && paymentMyRequestVM.myRequests.count < paymentMyRequestVM.total {
                paymentMyRequestVM.isFetching = true
                paymentMyRequestVM.isInitialFetchCompleted = true
                paymentMyRequestVM.offset = paymentMyRequestVM.myRequests.count
                requestTableView.showLoaderAtBottom(true)
                callMyRequestAPI()
            }
        }
    }
  
    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        requestTableView.showLoading()
        
      case .defaultState:
        requestTableView.showDefault()
        
      case .noConnection:
        requestTableView.showNoConnection()
        
      case .error(let message, let actionType):
        requestTableView.showError(message: message, actionType: actionType)
        
      case .noResult(let message):
        requestTableView.showNoResults(title: message, message: PlaceholderStateData.noRequest.message, image: "")
        
      default:
        break
      }
    }

}

// MARK: - Table view datasource methods

extension PaymentMyRequestVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return paymentMyRequestVM.myRequests.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
      guard let cell = tableView.dequeueReusableCell(withIdentifier: PaymentMyRequestCell.identifier, for: indexPath) as? PaymentMyRequestCell else {
            return UITableViewCell()
        }
        
        cell.configure(myRequest: paymentMyRequestVM.myRequests[indexPath.row])
        return cell
    }
}

// MARK: - Table view delegate methods

extension PaymentMyRequestVC: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let viewController = StoryboardScene.Transaction.instantiateViewController(withClass: TransactionDetailVC.self)
        let myRequest = paymentMyRequestVM.myRequests[indexPath.row]
        
        guard let transaction = myRequest.transaction,
            let transactionIdString = transaction.id,
            let transactionIdInt = Int(transactionIdString) else {
                
                let viewController = StoryboardScene.Profile.instantiateViewController(withClass: DeclineDetailVC.self)
                viewController.declineDetailVM.comeFromMyRequest = true
                let myRequest = paymentMyRequestVM.myRequests[indexPath.row]
                viewController.declineDetailVM.request = myRequest
                hideCircleView()
                pushVC(viewController)
                
                return
        }
        
        viewController.transactionDetailVM.transactionId = transactionIdInt
        hideCircleView()
        pushVC(viewController)
    }
}

// MARK: - API Calling

extension PaymentMyRequestVC {
    private func callMyRequestAPI() {
        
      paymentMyRequestVM.myRequestAPI({ (currentState) in
        self.manageViewState(currentState)
      }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
        self.requestTableView.showLoaderAtBottom(false)
        self.requestTableView.reloadDataInMain()
      }
    }
}

// MARK: - PlaceholderDelegate

extension PaymentMyRequestVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callMyRequestAPI()
      
    default:
      break
    }
  }
}
