//
//  PaymentDeclineVC.swift
//  Monay
//
//  Created by WFH on 13/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentDeclineVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var declineTableView: TableView!
    
    // MARK: - Instance properties
    
    let paymentDeclineVM = PaymentDeclineVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
        callDeclinedPaymentRequestAPI()
    }
    
    private func configuretableView() {
        declineTableView.placeholderDelegate = self
        declineTableView.register(
          UINib(nibName: PaymentReceivedCell.identifier, bundle: nil),
          forCellReuseIdentifier: PaymentReceivedCell.identifier)
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !paymentDeclineVM.isFetching && paymentDeclineVM.declinedRequests.count < paymentDeclineVM.total {
                paymentDeclineVM.isFetching = true
                paymentDeclineVM.isInitialFetchCompleted = true
                paymentDeclineVM.offset = paymentDeclineVM.declinedRequests.count
                declineTableView.showLoaderAtBottom(true)
                callDeclinedPaymentRequestAPI()
            }
        }
    }
  
    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        declineTableView.showLoading()
        
      case .defaultState:
        declineTableView.showDefault()
        
      case .noConnection:
        declineTableView.showNoConnection()
        
      case .error(let message, let actionType):
        declineTableView.showError(message: message, actionType: actionType)
        
      case .noResult(let message):
        declineTableView.showNoResults(title: message, message: PlaceholderStateData.noRequest.message, image: "")
        
      default:
        break
      }
    }

}

// MARK: - Table view datasource methods

extension PaymentDeclineVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return paymentDeclineVM.declinedRequests.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
      guard let cell = tableView.dequeueReusableCell(withIdentifier: PaymentReceivedCell.identifier, for: indexPath) as? PaymentReceivedCell else {
            return UITableViewCell()
        }
        
        cell.configure(paymentRequest: paymentDeclineVM.declinedRequests[indexPath.row], isHidePayDecline: true)
        return cell
    }
}

// MARK: - Table view delegate methods

extension PaymentDeclineVC: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: DeclineDetailVC.self)
        let declinedRequest = paymentDeclineVM.declinedRequests[indexPath.row]
        viewController.declineDetailVM.request = declinedRequest
        hideCircleView()
        pushVC(viewController)
    }
}

// MARK: - API Calling

extension PaymentDeclineVC {
    private func callDeclinedPaymentRequestAPI() {
        
      paymentDeclineVM.declinedPaymentRequestAPI({ (currentState) in
        self.manageViewState(currentState)
      }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
        self.declineTableView.showLoaderAtBottom(false)
        self.declineTableView.reloadDataInMain()
      }
    }
}

// MARK: - PlaceholderDelegate

extension PaymentDeclineVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callDeclinedPaymentRequestAPI()
      
    default:
      break
    }
  }
}
