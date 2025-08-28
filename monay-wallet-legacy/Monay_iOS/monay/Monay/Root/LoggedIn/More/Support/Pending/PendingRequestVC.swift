//
//  PendingRequestVC.swift
//  Monay
//
//  Created by Aayushi on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PendingRequestVC: UIViewController {
    
    // MARK: - IBOutlets
    
    @IBOutlet weak var tableView: TableView!
    
    // MARK: - Instance properties
    
    let pendingRequestVM = PendingRequestVM()
    
    // MARK: - Life Cycle Methods
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        callSupportRequestAPI()
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !pendingRequestVM.isFetching && pendingRequestVM.pendingRequests.count < pendingRequestVM.total {
                pendingRequestVM.isFetching = true
                pendingRequestVM.isInitialFetchCompleted = true
                pendingRequestVM.offset =  pendingRequestVM.pendingRequests.count
                tableView.showLoaderAtBottom(true)
                callSupportRequestAPI()
            }
        }
    }
    
    // MARK: - IBAction
    
    @IBAction func addButton_Action(_ sender: UIButton) {
        let viewController = StoryboardScene.More.instantiateViewController(withClass: AddSupportVC.self)
        self.pushVC(viewController)
    }
    
}

extension PendingRequestVC: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        let count = pendingRequestVM.pendingRequests.count
        
        if count == 0 {
            tableView.showPlaceholderLabelWith(message: LocalizedKey.messageNoDataAvailable.value)
        } else {
            tableView.removePlaceholderLabel()
        }
        
        return count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: PendingRequestCell.reuseIdentifier, for: indexPath) as? PendingRequestCell else { return UITableViewCell() }
        
        cell.configure(self.pendingRequestVM.pendingRequests[indexPath.row])
        
        return cell
    }
}

extension PendingRequestVC: UITableViewDelegate { }

// MARK: - API Calling

extension PendingRequestVC {
    private func callSupportRequestAPI() {
        
        pendingRequestVM.supportRequestAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            self.tableView.showLoaderAtBottom(false)
            self.tableView.reloadDataInMain()
            
            if !success {
                self.showAlertWith(message: message)
            }
        }
    }
}
