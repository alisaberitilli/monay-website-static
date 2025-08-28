//
//  UIViewController.swift
//  Monay
//
//  Created by Aayushi on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import MobileCoreServices

extension UIViewController {
    
    @IBAction func pop() {
        if Thread.isMainThread {
            self.navigationController?.popViewController(animated: true)
        } else {
            _ = DispatchQueue.main.sync {
                self.navigationController?.popViewController(animated: true)
            }
        }
    }
    
    @IBAction func dismiss() {
        if Thread.isMainThread {
            dismiss(animated: true, completion: nil)
        } else {
             DispatchQueue.main.sync {
                dismiss(animated: true, completion: nil)
            }
        }
    }
    
    @IBAction func popToRoot() {
        if Thread.isMainThread {
            self.navigationController?.popToRootViewController(animated: true)
        } else {
            _ = DispatchQueue.main.sync {
                self.navigationController?.popToRootViewController(animated: true)
            }
        }
    }
    
    @IBAction func popToSpecificController(_ viewController: Any) {
        // swiftlint:disable force_cast
        if Thread.isMainThread {
            for controller in self.navigationController!.viewControllers as Array {
                if controller.isKind(of: viewController as! AnyClass) {
                    _ =  self.navigationController!.popToViewController(controller, animated: true)
                    break
                }
            }
        } else {
            DispatchQueue.main.sync {
                for controller in self.navigationController!.viewControllers as Array {
                    if controller.isKind(of: viewController as! AnyClass) {
                        _ =  self.navigationController!.popToViewController(controller, animated: true)
                        break
                    }
                }
            }
        }
        // swiftlint:enable force_cast
    }
    
    func pushVC(_ viewController: UIViewController, animated: Bool = true) {
        if Thread.isMainThread {
            self.navigationController?.pushViewController(viewController, animated: animated)
        } else {
            DispatchQueue.main.sync {
                self.navigationController?.pushViewController(viewController, animated: animated)
            }
        }
    }
    
    func present(_ viewController: UIViewController, animated: Bool = true) {
        if Thread.isMainThread {
            present(viewController, animated: animated, completion: nil)
        } else {
            DispatchQueue.main.sync {
                present(viewController, animated: animated, completion: nil)
            }
        }
    }
    
    func checkControllerInNavigationStack(_ checkVC: AnyClass) -> Bool {
        if let viewControllers = self.navigationController?.viewControllers {
            for viewController in viewControllers {
                if viewController.isKind(of: checkVC) {
                    return true
                }
            }
        }
        return false
    }
    
    func addImagePickerOnController(_ isAllowEditing: Bool, isMediaTypeVideo: Bool = false) {
      let alertController = UIAlertController(title: nil, message: LocalizedKey.chooseMediaSource.value, preferredStyle: .actionSheet)
      let cancelAction = UIAlertAction(title: LocalizedKey.cancel.value, style: .cancel) { _ in
        }
        alertController.addAction(cancelAction)
        
      let cameraAction = UIAlertAction(title: LocalizedKey.camera.value, style: .default) { _ in
            if UIImagePickerController.isSourceTypeAvailable(UIImagePickerController.SourceType.camera) {
                let imagePicker = UIImagePickerController()
                imagePicker.delegate = self as? UIImagePickerControllerDelegate & UINavigationControllerDelegate
                imagePicker.sourceType = UIImagePickerController.SourceType.camera
                imagePicker.allowsEditing = isAllowEditing
                if isMediaTypeVideo {
                    imagePicker.mediaTypes = [kUTTypeMovie as String, kUTTypeVideo as String]
                    imagePicker.videoMaximumDuration = 29.0
                }
                self.present(imagePicker, animated: true, completion: nil)
            }
        }
        
      let galleryAction = UIAlertAction(title: LocalizedKey.gallery.value, style: .default) { _ in
            if UIImagePickerController.isSourceTypeAvailable(UIImagePickerController.SourceType.photoLibrary) {
                let image = UIImagePickerController()
                image.delegate = self as? UIImagePickerControllerDelegate & UINavigationControllerDelegate
                image.sourceType = UIImagePickerController.SourceType.photoLibrary
                image.allowsEditing = isAllowEditing
                if isMediaTypeVideo {
                    image.mediaTypes = [kUTTypeMovie as String, kUTTypeVideo as String]
                }
                self.present(image, animated: true, completion: nil)
            }
        }
        alertController.addAction(cameraAction)
        alertController.addAction(galleryAction)
        self.present(alertController, animated: true)
    }
    
    func hideCircleView() {
        if let tabBarController = self.tabBarController as? TabBarController {
            tabBarController.showHideCircleView(isHidden: true)
        }
    }
    
    func overlayBlurredBackgroundView() {
        let blurredBackgroundView = UIVisualEffectView()
        blurredBackgroundView.frame = view.frame
        blurredBackgroundView.effect = UIBlurEffect(style: .dark)
        view.addSubview(blurredBackgroundView)
    }
    
    func removeBlurredBackgroundViewView() {
        for subview in view.subviews {
            if subview.isKind(of: UIVisualEffectView.self) {
                subview.removeFromSuperview()
            }
        }
    }
    
    func showAlertWith(message: String, cancelButtonCallback: (() -> Void)? = nil) {
       let alertController = UIAlertController(title: kProductName, message: message, preferredStyle: .alert)
       alertController.addAction(UIAlertAction(title: LocalizedKey.ok.value, style: .cancel, handler: { (_) in
         cancelButtonCallback?()
       }))
       
       self.present(alertController, animated: true, completion: nil)
     }
    
    func showAlert(title: String? = nil, message: String, okTitle: String, cancelTitle: String? = nil, callback: ((String) -> Void)? = nil) {
        
        let alertTitle = title != nil ? title : kProductName

        let alertController = UIAlertController(title: alertTitle, message: message, preferredStyle: .alert)
        if cancelTitle != nil {
            alertController.addAction(UIAlertAction(title: cancelTitle, style: .default, handler: { (_) in
              callback?(LocalizedKey.cancel.value)
            }))
        }
        
        alertController.addAction(UIAlertAction(title: okTitle, style: .default, handler: { (_) in
          callback?(LocalizedKey.ok.value)
        }))
        
        self.present(alertController, animated: true, completion: nil)
    }
    
    @IBAction public func backtoPopViewController(_ sender: AnyObject) {
        guard self.navigationController != nil else { return }
        self.navigationController?.popViewController(animated: true)
    }
  
    class func topViewController(controller: UIViewController? = UIApplication.shared.keyWindow?.rootViewController) -> UIViewController? {
        if let navigationController = controller as? UINavigationController {
            return topViewController(controller: navigationController.visibleViewController)
        }
        if let tabController = controller as? UITabBarController {
            if let selected = tabController.selectedViewController {
                return topViewController(controller: selected)
            }
        }
        if let presented = controller?.presentedViewController {
            return topViewController(controller: presented)
        }
        return controller
    }

}
