//
//  AppDelegate.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import IQKeyboardManagerSwift
import Kingfisher
import CocoaLumberjack
import Firebase
import FirebaseMessaging
import ZendeskCoreSDK
import ZendeskSDK
import CommonUISDK

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    // MARK: - Private
    
    private let kIsUserLoggedIn = kIsLoggedIn
    var isContactSyncInProgress = false
    var updatedContacts: [PhoneContact] = []
    var deepLinkParams: [String: Any]?
    var deepLinkHandler: DeepLinkHandler?
  
    var window: UIWindow?
    
    var isLoggedIn: Bool {
        
        get { return UserDefaults.standard.bool(forKey: kIsUserLoggedIn) }
        set { UserDefaults.standard.set(newValue, forKey: kIsUserLoggedIn) }
        
    }
    
    var deviceToken: String {
        
        get { return UserDefaults.standard.string(forKey: kDeviceToken) ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: kDeviceToken) }
    }
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
         Thread.sleep(forTimeInterval: 3.0)
        isBiometricAuthenticated = false
        
        syncPhoneContactToLocalDataBase()
      self.configLibraries()
        
        if #available(iOS 13.0, *) {
            // UI created in scene delegate
        } else {
            let window = UIWindow(frame: UIScreen.main.bounds)
            self.window = window
            rootConfiguration()
        }
        
      // Handle universal links
          if let userActivityDictionary = launchOptions?[.userActivityDictionary] as? [UIApplication.LaunchOptionsKey: Any],
             let userActivity = userActivityDictionary[.userActivityType] as? NSUserActivity,
             let url = userActivity.webpageURL {
            FirebaseDeepLink.handleUniversalLink(url) { [weak self] (link, params, error) in
              guard error == nil else {
                return
              }
              
              if link != nil, !params.isEmpty {
                self?.deepLinkParams = params
              }
            }
          }

        return true
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        isBiometricAuthenticated = false
        sharedCoreDataManager.saveContext()
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
         NotificationCenter.default.post(
         name: NSNotification.Name(rawValue: kNotificationReadUnreadCountRefresh),
         object: nil,
         userInfo: nil)
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        getNotificationSettings()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.callUpdateFirebaseTokenAPI()
        }
    }
    
  func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
      let (link, params) = FirebaseDeepLink.handleCustomURIScheme(url)
      
      if link != nil, !params.isEmpty {
        self.deepLinkHandler?.handle(params)
        return true
      }
      
      return false
    }
    
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
      
      guard let url = userActivity.webpageURL else {
        return false
      }
      
      return FirebaseDeepLink.handleUniversalLink(url) { [weak self] (link, params, error) in
        guard error == nil else { return }
        
        if link != nil, !params.isEmpty {
          
          self?.deepLinkHandler?.handle(params)
          
          guard let referralCode = params["referal_code"] as? String else {
            return
          }
          if !appDelegate.isLoggedIn {
            Authorization.shared.referralCode = referralCode
          }
        }
      }
    }
  
    // MARK: UISceneSession Lifecycle
    
    @available(iOS 13.0, *)
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: kDefaultConfig, sessionRole: connectingSceneSession.role)
    }
    
    @available(iOS 13.0, *)
    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
    }
}

extension AppDelegate {
    
    private func configLibraries() {
        
        // API Request filtering for user authorization
        NetworkManager.shared.requestFilter = AuthorizationFilter()
        NetworkManager.shared.responseFilter = AuthorizationFilter()
        
        // IQKeyboardManager
        IQKeyboardManager.shared.enable = true
        IQKeyboardManager.shared.shouldShowToolbarPlaceholder = false
        IQKeyboardManager.shared.shouldPlayInputClicks = true
        
        self.configureKingfisher()
        
        self.configRestClient()
        
        self.configureFirebase()
        
        self.configureZendesk()
        
        // Push notifications
        self.registerForRemoteNotifications()
    }
    
    private func configureKingfisher() {
        let imageCache = ImageCache.default
        
        // Limit memory cache size to 300 MB.
        imageCache.memoryStorage.config.totalCostLimit = 300 * 1024 * 1024
        
        // Memory image expires after 30 days.
        imageCache.memoryStorage.config.expiration = .seconds(60 * 60 * 24 * 30)
        
        // Remove only expired.
        imageCache.cleanExpiredMemoryCache()
    }
    
    private func configureFirebase() {
        guard let plistPath = Bundle.main.path(forResource: googleServiceInfo, ofType: plist), let options =  FirebaseOptions(contentsOfFile: plistPath)
            else {
                return
        }
        FirebaseApp.configure(options: options)
    }
    
    private func configureZendesk() {
        Zendesk.initialize(appId: zendeskAppID,
                           clientId: zendeskClientID,
                           zendeskUrl: zendeskURL)
        
        Support.initialize(withZendesk: Zendesk.instance)
        CommonTheme.currentTheme.primaryColor = Color.blue
    }
  
  private func configRestClient() {
    RestClient.shared.host = Configuration.apiURL
    
    // Assign Request/Response filters.
    RestClient.shared.requestFilter = AuthorizationFilter()
    RestClient.shared.responseFilter = AuthorizationFilter()
  }
}

// MARK: - Routing Methods

extension AppDelegate {
    
    func rootConfiguration() {
        
        guard self.isLoggedIn else {
            setOnBoardingRoot()
            return
        }
        self.checkUserAuthorization()
    }
    
    func setRoot(viewController: UIViewController) {
        window?.rootViewController = nil
        window?.rootViewController = viewController
        window?.makeKeyAndVisible()
        UIView.transition(with: appDelegate.window!, duration: 0.3, options: .transitionCrossDissolve, animations: nil, completion: nil)
    }
    
    func setOnBoardingRoot() {
        let viewController = StoryboardScene.Account.instantiateViewController(withClass: IntroductionVC.self)
        let navigationController = UINavigationController(rootViewController: viewController)
        navigationController.navigationBar.isHidden = true
      
        self.deepLinkHandler = viewController

        setRoot(viewController: navigationController)
    }
    
    func setLoginRoot() {
        let viewController = StoryboardScene.Account.instantiateViewController(withClass: LoginVC.self)
        let navigationController = UINavigationController(rootViewController: viewController)
        navigationController.navigationBar.isHidden = true
        
        setRoot(viewController: navigationController)
    }
    
    func setDashboardRoot() {
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: TabBarController.self)
        setRoot(viewController: viewController)
    }
    
    func logout() {
        setLoginRoot()
    }
    
    func checkUserAuthorization() {
        
        do {
            try Authorization.shared.restoreAuthorization()
            setRootViewConroller()
            
            return
        } catch is AuthorizationError {
            DDLogDebug("\(#function): Session doesn't exist")
            Authorization.shared.clearSession()
        } catch is JWTTokenExpirationError {
            DDLogDebug("\(#function): Token is expired")
            Authorization.shared.clearSession()
        } catch {
            DDLogDebug("\(#function): \(error.localizedDescription)")
        }
        
        setOnBoardingRoot()
    }
    
    func setRootViewConroller() {
        
        if !(Authorization.shared.userCredentials?.isMpinSet ?? false) {
            let viewController = StoryboardScene.Profile.instantiateViewController(withClass: SetPinVC.self)
            let navigationController = UINavigationController(rootViewController: viewController)
            navigationController.navigationBar.isHidden = true
            setRoot(viewController: navigationController)
            return
        }
        
      if Authorization.shared.userCredentials.userType == .secondaryUser {
        if Authorization.shared.userCredentials.parent?.count == 0 {
          if !Authorization.shared.isUserLinked {
            let viewController = StoryboardScene.Scan.instantiateViewController(withClass: ScannerVC.self)
            let navigationController = UINavigationController(rootViewController: viewController)
            navigationController.navigationBar.isHidden = true
            setRoot(viewController: navigationController)
            return
          }
        }
      }
      
        setDashboardRoot()
    }
    
}

// MARK: - Push Notifications

extension AppDelegate: UNUserNotificationCenterDelegate {
    
    private func registerForRemoteNotifications() {
        
        UNUserNotificationCenter.current().delegate = self
        
        // Register only when device token not generated by app yet
        guard Validator.emptyString(self.deviceToken) else {
            DDLogDebug("Pre-generated Device Token: \(self.deviceToken)")
            return
        }
        
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { (granted, error) in
            guard error == nil, granted else {
                DDLogDebug("User Notifications: Permission not granted")
                return
            }
            
            self.getNotificationSettings()
        }
    }
    
    func getNotificationSettings() {
        
        UNUserNotificationCenter.current().getNotificationSettings { (settings) in
            guard settings.authorizationStatus == .authorized else { return }
            
            DispatchQueue.main.async {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
    }
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
      
      Messaging.messaging().apnsToken = deviceToken
          Messaging.messaging().token { (token, error) in
              if let error = error {
                  print("Error fetching remote instance ID: \(error.localizedDescription)")
              } else if let token = token {
                  print("Token is \(token)")
                self.deviceToken = token
              }
          }
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        DDLogError("User Notifications failed to register: \(error)")
        print(error)
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) { 
        completionHandler([.alert, .badge, .sound])
        NotificationCenter.default.post(
            name: NSNotification.Name(rawValue: kNotificationReadUnreadCountRefresh),
            object: nil,
            userInfo: nil)
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        handleNotification(userInfo: userInfo, eventSource: .tap)
        completionHandler()
    }
    
    func convertToDictionary(text: String) -> [String: Any]? {
        if let data = text.data(using: .utf8) {
            do {
                return try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
            } catch {
                DDLogDebug(error.localizedDescription)
            }
        }
        return nil
    }
    
    func handleNotification(userInfo: [AnyHashable: Any], eventSource: NotificationEventSource) {
        // Auth Check
        guard Authorization.shared.jwt != nil,
            Authorization.shared.userCredentials != nil else {
                return
        }
        
        // Controller check
        guard let topController = UIApplication.topViewController(),
            !(topController is UIAlertController) else {
                return
        }
        
        let notificationVC = StoryboardScene.More.instantiateViewController(withClass: NotificationVC.self)
        notificationVC.notificationVM.redirectFrom = .notificationTap
        topController.hideCircleView()
        
        if topController.navigationController != nil {
            topController.pushVC(notificationVC)
        } else {
            topController.present(notificationVC)
        }
    }
}

// MARK: - Sync phone contact to local data base

extension AppDelegate {
    private func syncPhoneContactToLocalDataBase() {
        ContactUtility.sharedInstance.syncPhoneBookContactsWithLocalDB { (isSuccess, updatedContacts)  in
            
            if isSuccess {
                appDelegate.isContactSyncInProgress = false
                appDelegate.updatedContacts = updatedContacts
            }
            
            NotificationCenter.default.post(
                name: NSNotification.Name(rawValue: kNotificationContactSync),
                object: nil,
                userInfo: nil)
        }
    }
}

// MARK: - Update Device Token

extension AppDelegate {
    func callUpdateFirebaseTokenAPI() {
        let isRegisteredForRemoteNotifications = UIApplication.shared.isRegisteredForRemoteNotifications
        
        guard isLoggedIn,
            isRegisteredForRemoteNotifications,
            !deviceToken.isEmpty else {
                return
        }
        
        let parameters: HTTPParameters = [
            kFirebaseToken: deviceToken
        ]
        
        APIComponent
            .Account
            .updateFirebaseToken(parameters: parameters) { (result) in
                
                switch result {
                case .success:
                    break
                case .failure:
                    break
                }
        }
    }
}
