//
//  ClosedRequestVC.swift
//  Monay
//
//  Created by Aayushi on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ClosedRequestVC: UIViewController {
    
    // MARK: - IBOutlets
    
    @IBOutlet weak var tableView: TableView!
    
    // MARK: - Instance properties
    
    let closedRequestVM = ClosedRequestVM()
    
    // MARK: - Life Cycle Methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
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
            if !closedRequestVM.isFetching && closedRequestVM.closedRequests.count < closedRequestVM.total {
                closedRequestVM.isFetching = true
                closedRequestVM.isInitialFetchCompleted = true
                closedRequestVM.offset =  closedRequestVM.closedRequests.count
                tableView.showLoaderAtBottom(true)
                callSupportRequestAPI()
            }
        }
    }
}

// MARK: - Table view datasource methods

extension ClosedRequestVC: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        let count = closedRequestVM.closedRequests.count
        
        if count == 0 {
            tableView.showPlaceholderLabelWith(message: LocalizedKey.messageNoDataAvailable.value)
        } else {
            tableView.removePlaceholderLabel()
        }
        
        return count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: ClosedRequestCell.reuseIdentifier, for: indexPath) as? ClosedRequestCell else { return UITableViewCell() }
        
        cell.configure(self.closedRequestVM.closedRequests[indexPath.row])
        
        cell.callback = ({ [weak self] (itemCell) in
            
            guard let `self` = self else {
                return
            }
            
            if let index = self.tableView.indexPath(for: itemCell) {
                var request = self.closedRequestVM.closedRequests[index.row]
                request.collapsed = !request.collapsed
                self.closedRequestVM.closedRequests[index.row] = request
                let indexPath = IndexPath(item: index.row, section: 0)
                tableView.reloadRows(at: [indexPath], with: .none)
            }
        })
        
        return cell
    }
}

extension ClosedRequestVC: UITableViewDelegate { }

// MARK: - API Calling

extension ClosedRequestVC {
    private func callSupportRequestAPI() {
        
        closedRequestVM.supportRequestAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            self.tableView.reloadDataInMain()
            
            if !success {
                self.showAlertWith(message: message)
            }
        }
    }
}
