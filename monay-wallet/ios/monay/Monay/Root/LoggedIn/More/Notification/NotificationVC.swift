//
//  NotificationVC.swift
//  Monay
//
//  Created by Aayushi on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class NotificationVC: UIViewController {
    
    // MARK: - IBOutlets
    
    @IBOutlet weak var tableView: TableView!
    
    // MARK: - Instance properties
    
    let notificationVM = NotificationVM()
    
    // MARK: - Life Cycle Methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
        callNotificationAPI()
        clearNotificationUnreadCount()
    }
    
    private func configuretableView() {
        tableView.placeholderDelegate = self
    }
    
    private func clearNotificationUnreadCount() {
        UIApplication.shared.applicationIconBadgeNumber = 0
    }

    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !notificationVM.isFetching && notificationVM.notifications.count < notificationVM.total {
                notificationVM.isFetching = true
                notificationVM.isInitialFetchCompleted = true
                notificationVM.offset =  notificationVM.notifications.count
                tableView.showLoaderAtBottom(true)
                callNotificationAPI()
            }
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
    
    // MARK: - IBAction methods
    
    @IBAction func backButton(_ sender: Any) {
        switch notificationVM.redirectFrom {
        case .home, .setting:
            pop()
        case .notificationTap:
          pop()
        }
    }
}

// MARK: - Table view datasource methods

extension NotificationVC: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return notificationVM.notifications.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: NotificationCell.reuseIdentifier, for: indexPath) as? NotificationCell else { return UITableViewCell() }
        
        cell.configure(self.notificationVM.notifications[indexPath.row])
        
        return cell
    }
}

// MARK: - Table view delegate methods

extension NotificationVC: UITableViewDelegate { }

// MARK: - API Calling

extension NotificationVC {
    private func callNotificationAPI() {
        
      notificationVM.notificationAPI({ (currentState) in
        self.manageViewState(currentState)
      }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
        self.tableView.showLoaderAtBottom(false)
        self.tableView.reloadDataInMain()
      }
    }
}

// MARK: - PlaceholderDelegate

extension NotificationVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callNotificationAPI()
      
    default:
      break
    }
  }
}
