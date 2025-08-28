//
//  SceneDelegate.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

@available(iOS 13.0, *)
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

  var window: UIWindow?

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    ///
    guard let scene = (scene as? UIWindowScene) else {
      return
    }
    ///
    let window = UIWindow(windowScene: scene)
    appDelegate.window = window
    appDelegate.rootConfiguration()
    
    // Handle universal links
        if let userActivity = connectionOptions.userActivities.first,
           let url = userActivity.webpageURL {
          FirebaseDeepLink.handleUniversalLink(url) { (link, params, error) in
            guard error == nil else { return }
            
            if link != nil, !params.isEmpty {
              appDelegate.deepLinkParams = params

            }
          }
        }
  }

  func sceneDidDisconnect(_ scene: UIScene) {
    isBiometricAuthenticated = false
  }

  func sceneDidBecomeActive(_ scene: UIScene) {
    appDelegate.getNotificationSettings()
    
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
        appDelegate.callUpdateFirebaseTokenAPI()
    }
  }

  func sceneWillEnterForeground(_ scene: UIScene) {

     NotificationCenter.default.post(
     name: NSNotification.Name(rawValue: kNotificationReadUnreadCountRefresh),
     object: nil,
     userInfo: nil)
  }

  func sceneDidEnterBackground(_ scene: UIScene) {

  }
  
  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
      // BranchScene.shared().scene(scene, continue: userActivity)
      guard let url = userActivity.webpageURL else { return }
      
      FirebaseDeepLink.handleUniversalLink(url) { (link, params, error) in
        guard error == nil else { return }
        
        if link != nil, !params.isEmpty {
          appDelegate.deepLinkHandler?.handle(params)
          
          guard let referralCode = params["referal_code"] as? String else {
            return
          }
          if !appDelegate.isLoggedIn {
            Authorization.shared.referralCode = referralCode
          }
        }
      }
    }
    
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
      guard let openURLContext = URLContexts.first else {
        return
      }
      
      let url = openURLContext.url
      
      let (link, params) = FirebaseDeepLink.handleCustomURIScheme(url)
      
      if link != nil, !params.isEmpty {
        appDelegate.deepLinkHandler?.handle(params)
        
        guard let referralCode = params["referal_code"] as? String else {
          return
        }
        if !appDelegate.isLoggedIn {
          Authorization.shared.referralCode = referralCode
        }
        return
      }
    }
}
