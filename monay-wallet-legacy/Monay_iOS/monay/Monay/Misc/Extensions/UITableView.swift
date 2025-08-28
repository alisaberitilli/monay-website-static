//
//  UITableView.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import UIKit

extension UITableView {
    func reloadDataInMain() {
        DispatchQueue.main.async {
            self.reloadData()
        }
    }
    
    func showLoaderAtBottom( _ show: Bool) {
        DispatchQueue.main.async {
            if show {
                let activityIndicator = UIActivityIndicatorView(frame: CGRect(x: 0, y: 0, width: self.bounds.width, height: 70))
                self.tableFooterView = activityIndicator
                activityIndicator.color = .gray
                activityIndicator.startAnimating()
            } else {
                self.tableFooterView?.removeFromSuperview()
                self.tableFooterView = nil
            }
        }
    }
    
    /// Returns true when table view content is about to end
    var isNearBottomEdge: Bool {
      (contentOffset.y + frame.size.height + 200.0) > contentSize.height
    }
}
