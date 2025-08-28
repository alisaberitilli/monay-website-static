//
//  TabBarController.swift
//  Monay
//
//  Created by Aayushi on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class TabBarController: UITabBarController {
  
     // MARK: - Public Properties
   
   var observation: NSKeyValueObservation?
    
  // MARK: Private Properties
  
  private var circleView: UIView?
  
  private var tabWidth: CGFloat {
    tabBar.frame.size.width / 5
  }
  
  // MARK: - LifeCycle
  
  override func viewDidLoad() {
    super.viewDidLoad()
    initialSetup()
  }
  
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        circleView?.frame.origin.y = tabBar.frame.origin.y - 17
        circleView?.center.x = Screen.width / 2
        
        if let circleView = circleView {
            view.bringSubviewToFront(circleView)
        }
    }
  
  // MARK: - Private Methods
  
  private func initialSetup() {
    configureTabBar()
    loadInitialControllers()
    addCircleView()
    
    observation = observe(\.tabBar.isHidden, options: [.new]) { [weak self] _, change in
      if let newValue = change.newValue, !newValue {
        self?.showHideCircleView(isHidden: newValue)
      }
    }
  }
    
    private func configureTabBar() {
        delegate = self
        
        tabBar.tintColor = #colorLiteral(red: 0.03137254902, green: 0.6666666667, blue: 1, alpha: 1)
        tabBar.barTintColor = .white
        tabBar.unselectedItemTintColor = #colorLiteral(red: 0.4862745098, green: 0.4862745098, blue: 0.4862745098, alpha: 1)
        
        let attribute = [NSAttributedString.Key.font: UIFont.customFont(style: .bold, size: .custom(12))]
        UITabBarItem.appearance().setTitleTextAttributes(attribute,
                                                         for: .normal)
    }
  
  private func loadInitialControllers() {
    addInitialControllers()
  }
  
  // Add pre define controllers
  private func addInitialControllers() {
    
    // Build home controller
    let homeVC = StoryboardScene.Main.instantiateViewController(withClass: HomeVC.self)
    let homeNav = UINavigationController.init(rootViewController: homeVC)
    homeNav.interactivePopGestureRecognizer!.isEnabled = false
    homeNav.navigationBar.isHidden = true

    // Build transaction controller
    let transactionVC = StoryboardScene.Transaction.instantiateViewController(withClass: TransactionVC.self)
    let transactionNav = UINavigationController.init(rootViewController: transactionVC)
    transactionNav.interactivePopGestureRecognizer!.isEnabled = false
    transactionNav.navigationBar.isHidden = true
    
    let createVC = UIViewController()
    
    // Build profile controller
    let profileVC = StoryboardScene.Profile.instantiateViewController(withClass: ProfileVC.self)
    let profileNav = UINavigationController.init(rootViewController: profileVC)
    profileNav.interactivePopGestureRecognizer!.isEnabled = false
    profileNav.navigationBar.isHidden = true

    // Build more controller
    let moreVC = StoryboardScene.More.instantiateViewController(withClass: MoreVC.self)
    let moreNav = UINavigationController.init(rootViewController: moreVC)
    moreNav.interactivePopGestureRecognizer!.isEnabled = false
    moreNav.navigationBar.isHidden = true

    // Initialize controllers
    viewControllers = [homeNav, transactionNav, createVC, profileNav, moreNav]
        
    homeNav.tabBarItem = UITabBarItem(title: "", image: #imageLiteral(resourceName: "ic_home_unselect"), selectedImage: #imageLiteral(resourceName: "ic_home_select"))
    transactionNav.tabBarItem = UITabBarItem(title: "", image: #imageLiteral(resourceName: "ic_transaction_unselect"), selectedImage: #imageLiteral(resourceName: "ic_transaction_select"))
    
    let createTabBarItem = UITabBarItem(title: "",
                                        image: UIImage(named: ""),
                                        selectedImage: nil)
    createTabBarItem.titlePositionAdjustment.vertical = 1
    
    createVC.tabBarItem = UITabBarItem(title: "",
                                       image: UIImage(named: ""),
                                       selectedImage: nil)
        
    profileNav.tabBarItem = UITabBarItem(title: "",
                                         image: #imageLiteral(resourceName: "ic_profile_unselect"),
                                         selectedImage: #imageLiteral(resourceName: "ic_profile_select"))
    moreNav.tabBarItem = UITabBarItem(title: "",
                                      image: #imageLiteral(resourceName: "ic_more_unselect"),
                                      selectedImage: #imageLiteral(resourceName: "ic_more_select"))
  }
  
}

// MARK: - UITabBarControllerDelegate

extension TabBarController: UITabBarControllerDelegate {
  
    func tabBarController(_ tabBarController: UITabBarController, shouldSelect viewController: UIViewController) -> Bool {
        return true
    }
  
    func tabBarController(_ tabBarController: UITabBarController, didSelect viewController: UIViewController) {
      UserDefaults.standard.set(LocalizedKey.myRequest.value, forKey: LocalizedKey.paymentRequestType.value)
    }
}

extension TabBarController {
  
    func showHideCircleView(isHidden: Bool) {
        if let circleView = circleView {
            circleView.isHidden = isHidden
        }
    }
    
    private func addCircleView() {
        ///
        circleView?.removeFromSuperview()
        
        circleView = UIView(frame: CGRect(x: Screen.width / 2,
                                          y: tabBar.frame.origin.y + 20,
                                          width: 65,
                                          height: 65))
        ///
        circleView!.layer.cornerRadius = 32.5
        circleView!.backgroundColor = .clear
        view.addSubview(circleView!)
        ///
        let circleImageView = UIImageView()
        circleImageView.frame.size = CGSize(width: 50, height: 50)
        let centerX = circleView!.bounds.width / 2
        let centerY = circleView!.bounds.height / 2 - 10
        circleImageView.center = CGPoint(x: centerX, y: centerY)
        circleImageView.image = #imageLiteral(resourceName: "ic_scan_circle")
        circleImageView.layer.cornerRadius = 25
        circleImageView.contentMode = .scaleAspectFit
        circleView!.addSubview(circleImageView)
        
        let button = UIButton.init(frame: circleView!.bounds)
        button.addTarget(self, action: #selector(presentScanVC), for: .touchUpInside)
        circleView!.addSubview(button)
    }
    
    @objc func presentScanVC(sender: UIButton) {
        let scanVC = StoryboardScene.Scan.instantiateViewController(withClass: ScanVC.self)
        let scanNav = UINavigationController(rootViewController: scanVC)
        scanNav.setNavigationBarHidden(true, animated: false)
        scanNav.modalPresentationStyle = .fullScreen
        self.present(scanNav)
    }
}
