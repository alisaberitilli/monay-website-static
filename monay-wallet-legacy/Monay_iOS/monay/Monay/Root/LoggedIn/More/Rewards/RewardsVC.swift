//
//  RewardsVC.swift
//  Monay
//
//  Created by Aayushi on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class RewardsVC: UIViewController {
  
  // MARK: - IBOutlets
  
  @IBOutlet weak var tableView: TableView!
  
  // MARK: - Instance properties
  
  let rewardsVM = RewardsVM()
  
  // MARK: - Life Cycle Methods
  
  override func viewDidLoad() {
    super.viewDidLoad()
    initialSetup()
  }
  
  // MARK: - Private helper methods
  
  private func initialSetup() {
    registerTableCell()
  }
  
  private func registerTableCell() {
    tableView.register(
      UINib(nibName: TransactionCell.reuseIdentifier, bundle: nil),
      forCellReuseIdentifier: TransactionCell.reuseIdentifier)
  }
  
}

extension RewardsVC: UITableViewDataSource, UITableViewDelegate {
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return self.rewardsVM.dataSource.count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    guard let cell = tableView.dequeueReusableCell(withIdentifier: TransactionCell.reuseIdentifier, for: indexPath) as? TransactionCell else { return UITableViewCell() }
    return cell
  }
}
