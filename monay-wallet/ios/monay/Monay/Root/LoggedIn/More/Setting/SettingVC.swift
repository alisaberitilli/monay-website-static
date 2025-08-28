//
//  SettingVC.swift
//  Monay
//
//  Created by Aayushi on 30/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class SettingVC: UIViewController {
  
  // MARK: - IBOutlet properties
  
  @IBOutlet weak var settingTableView: UITableView!
  
  // MARK: - Instance properties
  
  let viewModel = SettingVM()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    initialSetup()
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    self.navigationController?.isNavigationBarHidden = true
  }
  
  // MARK: - Private Methods
  
  private func initialSetup() {
    configureTableView()
  }
  
  private func configureTableView() {
    settingTableView.sectionHeaderHeight = UITableView.automaticDimension
    settingTableView.estimatedSectionHeaderHeight = 50
    
    settingTableView.register(
      UINib(nibName: SettingHeaderCell.reuseIdentifier, bundle: nil),
      forCellReuseIdentifier: SettingHeaderCell.reuseIdentifier)
    
    settingTableView.rowHeight = 75
    settingTableView.contentInset.bottom = 10
    settingTableView.dataSource = self
    settingTableView.delegate = self
  }
  
  private func route(to option: SettingOption) {
    self.hideCircleView()
    
    switch option {
    case .security:
      let viewController = StoryboardScene.Profile.instantiateViewController(withClass: SecurityVC.self)
      pushVC(viewController)
      
    case .changePassword:
      let viewController = StoryboardScene.More.instantiateViewController(withClass: ChangePasswordVC.self)
      self.pushVC(viewController)
      
    case .notifications:
      let viewController = StoryboardScene.More.instantiateViewController(withClass: NotificationVC.self)
      self.pushVC(viewController)
      
    case .howItWorks:
      let viewController = StoryboardScene.More.instantiateViewController(withClass: CMSVC.self)
      viewController.cmsVM.selectedCMS = .howItWorks
      viewController.cmsVM.usertype = Authorization.shared.userCredentials.userType
      self.pushVC(viewController)
      
    case .faq:
      let viewController = StoryboardScene.More.instantiateViewController(withClass: FAQVC.self)
      self.pushVC(viewController)
      
    case .support:
        let viewController = StoryboardScene.More.instantiateViewController(withClass: SupportCategoryVC.self)
        self.pushVC(viewController)

    case .termsCondition:
      let viewController = StoryboardScene.More.instantiateViewController(withClass: CMSVC.self)
      viewController.cmsVM.selectedCMS = .terms
      viewController.cmsVM.usertype = Authorization.shared.userCredentials.userType
      self.pushVC(viewController)
      
    case .userPolicy:
      let viewController = StoryboardScene.More.instantiateViewController(withClass: CMSVC.self)
      viewController.cmsVM.selectedCMS = .userPolicy
      viewController.cmsVM.usertype = Authorization.shared.userCredentials.userType
      self.pushVC(viewController)
    }
  }
  
}

// MARK: - Table view datasource methods

extension SettingVC: UITableViewDataSource {
  func numberOfSections(in tableView: UITableView) -> Int {
    return viewModel.dataSource.count
  }
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    let options = viewModel.dataSource[section]
    return options.options.count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let data = viewModel.dataSource[indexPath.section]
    
    guard let cell = tableView.dequeueReusableCell(withIdentifier: SettingCell.reuseIdentifier) as? SettingCell else { return UITableViewCell() }
    cell.set(data.options[indexPath.row])
    return cell
  }
  
}

// MARK: - Table view delegate methods

extension SettingVC: UITableViewDelegate {
  func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
    guard let cell = tableView.dequeueReusableCell(withIdentifier: SettingHeaderCell.reuseIdentifier) as? SettingHeaderCell else { return UITableViewCell() }
    cell.configure(viewModel.dataSource[section])
    return cell
  }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    let option = viewModel.dataSource[indexPath.section].options[indexPath.row]
    self.route(to: option)
  }
}
