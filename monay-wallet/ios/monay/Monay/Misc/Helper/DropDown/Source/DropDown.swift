//
//  DropDown.swift
//  DropDownList
//
//  Created by Arjun Hanswal on 14/02/20.
//  Copyright © 2020 Codiant technologies. All rights reserved.
//

import UIKit
//import CocoaLumberjackSwift

enum SizeOption {
    case auto
    case custome(value: CGFloat)
}
enum AnimationDirection {
    case up
    case down
    case left
    case right
}
struct DropDownAppearance {
    var selectedTextColor: UIColor?
    var textColor: UIColor?
    var shadowColor: UIColor?
    var borderColor: UIColor?
    var textFont: UIFont?
    var cornerRadius: CGFloat?
    var shadowRadius: CGFloat?
    var shadowOffset: Float?
    var shadowOpacity: Float?
    var borderWidth: CGFloat?
    var sperator: Bool?
    var animationsNotAllow: Bool?
    var showAnimationDirection: AnimationDirection?
    var hideAnimationDirection: AnimationDirection?
    var hideOnTapBackground: Bool?
    var showBlurBackground: Bool?
}

struct DropDownConfiguration {
    var items: [String]?
    var customeCellItems: [CellConfigurator]?
    var viewHeight: SizeOption?
    var viewWidth: SizeOption?
    var topOffset: CGFloat?
    var bottomOffset: CGFloat?
    var allowShadow: Bool?
    var allowMultipleSeletion: Bool?
    var cellHeight: SizeOption?
    var selectedIndex: Int?
    var dropDownAppearance: DropDownAppearance?
}

final class DropDown: UIView {
    
    private var dropDownConfiguration: DropDownConfiguration!
    private let nibName = "DropDown"
    private var tableViewContainer: UIView!
    private var fromView : UIView!
    private var blurEffectView: UIVisualEffectView?
    private var backgroundView: UIView?
    private var selectedRowIndexes = [Int]()
    
    var selectionClosure: ((Int) -> ())?
    var multipleSelectionClosure: (([Int]) -> ())?
    
    @IBOutlet weak var tableView: UITableView!
    
    init(dropDownConfiguration: DropDownConfiguration) {
        super.init(frame: .zero)
        tableViewContainer = UIApplication.topMostWindowController()?.view
        tableViewContainer.addSubview(self)
        self.dropDownConfiguration = dropDownConfiguration
        configureView()
    }
   
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    private func configureView() {
        
        guard let view = loadViewFromNib() else { return }
        view.frame = self.bounds
        self.addSubview(view)
        view.clipsToBounds = true
        configureTableView(view)
    }
    fileprivate func configureTableView(_ view: UIView) {
        
        tableView.frame = view.frame
        tableView.delegate = self
        tableView.dataSource = self
        tableView.reloadData()
        
        if let borderWidth = dropDownConfiguration.dropDownAppearance?.borderWidth {
            tableView.layer.borderWidth =  borderWidth
        } else {
            tableView.layer.borderWidth = 0.5
        }
        
        if let customeCellitems = dropDownConfiguration.customeCellItems {
            if customeCellitems.count > 0 {
                let item = customeCellitems[0]
                tableView.register(UINib(nibName: type(of: item).reuseId, bundle: nil), forCellReuseIdentifier: type(of: item).reuseId)
            } else {
                tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
            }
        }
        
        if let borderColor = dropDownConfiguration.dropDownAppearance?.borderColor {
            tableView.layer.borderColor = borderColor.cgColor
        } else {
            tableView.layer.borderColor = UIColor.black.cgColor
        }
        
        if let sperator = dropDownConfiguration.dropDownAppearance?.sperator, sperator {
            tableView.separatorStyle = .singleLine
        } else {
            tableView.separatorStyle = .none
        }
        if let radius = dropDownConfiguration.dropDownAppearance?.cornerRadius {
            tableView.layer.cornerRadius = radius
        }
        if let allowShadow = dropDownConfiguration.allowShadow , allowShadow {
            applyViewShadow()
        }
    }
    
    private func loadViewFromNib() -> UIView? {
        let nib = UINib(nibName: nibName, bundle: nil)
        return nib.instantiate(withOwner: self, options: nil).first as? UIView
    }
    
    private func rowCount() -> CGFloat {
        let count = dropDownConfiguration.items?.count
        return CGFloat(count ?? 0)
    }
    
    func calculateRowHeight()-> CGFloat? {
        if let cellHeight = dropDownConfiguration.cellHeight {
            switch cellHeight {
            case .auto:
                return UITableView.automaticDimension
            case .custome(let height):
                return height
            }
        }
        return nil
    }
    private func calculateViewHeight() -> CGFloat {
        
        switch dropDownConfiguration.viewHeight {
        case .auto:
            var rowHeight = CGFloat(56.0)
            
            if let rowRowHeight = calculateRowHeight() {
                rowHeight = rowRowHeight
                rowHeight = rowHeight == -1 ? 56 :rowRowHeight
            }
            var count = rowCount()
            if let customeItems = dropDownConfiguration.customeCellItems {
                count = CGFloat(customeItems.count)
            }
            var calculatedHeight = (count * rowHeight)
            let viewAvaiableHeight: (CGFloat) = (tableViewContainer.frame.size.height - (fromView.frame.origin.y + fromView.frame.size.height))
            if calculatedHeight > viewAvaiableHeight {
                if let bottomPadding = dropDownConfiguration.bottomOffset {
                    calculatedHeight = viewAvaiableHeight - bottomPadding
                } else {
                    calculatedHeight = viewAvaiableHeight - 20
                }
            }
            return calculatedHeight
        case .custome(let height):
            return height
        case .none:
            return 300
        }
    }
    
    private func calculateWidth() -> CGFloat {
        if let viewWidth = dropDownConfiguration.viewWidth  {
            switch viewWidth {
            case .auto:
                return fromView.frame.size.width
            case .custome(let width):
                return width
            }
        }
        return fromView.frame.size.width
    }
    
    private func calculateViewFrame(_ fromView: UIView) {
        
        let tap = self.getConvertedPoint(fromView, baseView: tableViewContainer)
        
        var calculatedTop = tap.y + fromView.frame.size.height
        if let offsetFromView = dropDownConfiguration.topOffset {
            calculatedTop += offsetFromView
        }
        tableView.reloadData()
        self.frame = CGRect(x: tap.x, y: calculatedTop, width: calculateWidth(), height: calculateViewHeight())
    }
    
    private func cusotmeShowAnimation(_ animationDirection: AnimationDirection) {
        UIView.animate(
            withDuration:  0.8,
            delay: 0,
            usingSpringWithDamping: 0.7,
            initialSpringVelocity: 0.5,
            options: [],
            animations: {
                if animationDirection == .down || animationDirection == .up {
                    self.tableView.frame.origin.y = CGFloat(0)
                }else {
                    self.tableView.frame.origin.x = CGFloat(0)
                }
        },
            completion: nil
        )
    }
    
    private func defaultShowAnimation() {
        self.tableView.frame.origin.y = -rowCount() * 60 - 300
        UIView.animate(
            withDuration:  0.8,
            delay: 0,
            usingSpringWithDamping: 0.7,
            initialSpringVelocity: 0.5,
            options: [],
            animations: {
                self.tableView.frame.origin.y = CGFloat(0)},
            completion: nil
        )
    }
    
    func show(anchor fromview: UIView) {
        self.fromView = fromview
        fromView.isUserInteractionEnabled = false
        
        applyBlurEffect()
        
        calculateViewFrame(fromView)
        
        if let animationsNotAllow = dropDownConfiguration.dropDownAppearance?.animationsNotAllow, animationsNotAllow {
            tableView.frame.origin.y = CGFloat(0)
        }else {
            if let animationDirection = dropDownConfiguration.dropDownAppearance?.showAnimationDirection {
                switch animationDirection {
                case .up:
                    self.tableView.frame.origin.y = -self.tableViewContainer.frame.height
                case .down:
                    self.tableView.frame.origin.y = self.tableViewContainer.frame.height
                case .left:
                    self.tableView.frame.origin.x = -self.tableViewContainer.frame.width
                case .right:
                    self.tableView.frame.origin.x = self.tableViewContainer.frame.width
                }
                cusotmeShowAnimation(animationDirection)
            } else {
                defaultShowAnimation()
            }
        }
    }
    private func DefaultDismissAnimation() {
        UIView.animate(
            withDuration:  0.8,
            delay: 0,
            usingSpringWithDamping: 0.7,
            initialSpringVelocity: 0.5,
            options: [.curveEaseInOut],
            animations: {
                self.tableView.frame.origin.y = CGFloat(-self.frame.height)
        }, completion: { _ in
            self.removeView()
        })
    }
    private func removeView() {
        self.removeFromSuperview()
        removeBlurView()
        removebackgroundView()
        fromView.isUserInteractionEnabled = true
    }
    
    private func customeDismissAnimation(_ animationDirection: AnimationDirection) {
        UIView.animate(
            withDuration:  1.0,
            delay: 0,
            usingSpringWithDamping: 0.7,
            initialSpringVelocity: 0.5,
            options: [.curveEaseInOut],
            animations: {
                switch animationDirection {
                case .up:
                    self.tableView.frame.origin.y = CGFloat(self.frame.height)
                case .down:
                    self.tableView.frame.origin.y = CGFloat(-self.frame.height)
                case .left:
                    self.tableView.frame.origin.x = CGFloat(-self.frame.width)
                case .right:
                    self.tableView.frame.origin.x = CGFloat(self.frame.width)
                }
        }, completion: { _ in
            self.removeView()
        })
    }
    
    private func hideWithAnimation() {
        
        if let animations = dropDownConfiguration.dropDownAppearance?.animationsNotAllow, animations {
            self.removeFromSuperview()
            removeBlurView()
            fromView.isUserInteractionEnabled = true
            removebackgroundView()
        } else {
            if let animationDirection = dropDownConfiguration.dropDownAppearance?.hideAnimationDirection {
                customeDismissAnimation(animationDirection)
            } else {
                DefaultDismissAnimation()
            }
        }
    }
    fileprivate func topViewControllr() -> UIView {
        UIApplication.topMostWindowController()?.view ?? UIView()
    }
    
    private func addBackgroundView() {
        backgroundView = UIView.init(frame: topViewControllr().frame)
        backgroundView?.backgroundColor = .clear
        tableViewContainer.addSubview(backgroundView!)
        tableViewContainer.bringSubviewToFront(self)
        addTapGesture(backgroundView!)
    }
    private func applyBlurEffect() {
        if let isblurBackground = dropDownConfiguration.dropDownAppearance?.showBlurBackground, isblurBackground {
            applyBlurBackground(view: tableViewContainer)
            tableViewContainer.bringSubviewToFront(self)
        }else {
             addBackgroundView()
        }
    }
    private func applyViewShadow() {
        
        if let shadowColor = dropDownConfiguration.dropDownAppearance?.shadowColor {
            self.layer.shadowColor = shadowColor.cgColor
        }else {
            self.layer.shadowColor = UIColor.black.cgColor
        }
        if let shadowOpacity = dropDownConfiguration.dropDownAppearance?.shadowOpacity {
            self.layer.shadowOpacity = shadowOpacity
        }else {
            self.layer.shadowOpacity = 1
        }
        if let shadowOffset = dropDownConfiguration.dropDownAppearance?.shadowOffset {
            self.layer.shadowOpacity = shadowOffset
        }else {
            self.layer.shadowOpacity = 1
        }
        if let shadowRadius = dropDownConfiguration.dropDownAppearance?.shadowRadius {
            self.layer.shadowRadius = shadowRadius
        }else {
            self.layer.shadowRadius = 10
        }
    }
    private func applyBlurBackground(view: UIView) {
        let blurEffect = UIBlurEffect(style: UIBlurEffect.Style.dark)
        blurEffectView = UIVisualEffectView(effect: blurEffect)
        blurEffectView?.frame = view.bounds
        blurEffectView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(blurEffectView!)
        
        if let hideOnTapBackGround = dropDownConfiguration.dropDownAppearance?.hideOnTapBackground, hideOnTapBackGround {
            addTapGesture(blurEffectView!)
        }
    }
    private func removeBlurView() {
        if blurEffectView == nil { return }
        blurEffectView?.removeFromSuperview()
    }
    private func removebackgroundView() {
        if backgroundView == nil { return }
        backgroundView?.removeFromSuperview()
    }
    
    private func addTapGesture(_ view: UIView) {
        let tap = UITapGestureRecognizer(target: self, action: #selector(handleSingleTap(_:)))
        tap.numberOfTouchesRequired = 1
        view.isUserInteractionEnabled = true
        view.addGestureRecognizer(tap)
    }
    @objc func handleSingleTap(_ sender: UITapGestureRecognizer){
        hideWithAnimation()
        multipleSelectionClosure?(selectedRowIndexes)
    }
}

extension DropDown: UITableViewDelegate, UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if let customeCellitems = dropDownConfiguration.customeCellItems {
            return customeCellitems.count
        }
        return Int(rowCount())
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        if let cellHeight = dropDownConfiguration.cellHeight {
            switch cellHeight {
            case .auto:
                return UITableView.automaticDimension
            case .custome(let height):
                return height
            }
        }
        return 56
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        //cusotme cell
        if let customeCellitems = dropDownConfiguration.customeCellItems {
            let item = customeCellitems[indexPath.row]
            let cell = tableView.dequeueReusableCell(withIdentifier: type(of: item).reuseId, for: indexPath)
            item.configure(cell: cell)
            return cell
        }
        // default cell
        let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
        cell.selectionStyle = .none
        let title = dropDownConfiguration.items?[indexPath.row]
        cell.textLabel?.text = title
        cell.textLabel?.numberOfLines = 0
        if let titleColor = dropDownConfiguration.dropDownAppearance?.textColor {
            cell.textLabel?.textColor = titleColor
        }
        if let titleFonts = dropDownConfiguration.dropDownAppearance?.textFont {
            cell.textLabel?.font = titleFonts
        }
        
        if let selection = dropDownConfiguration.allowMultipleSeletion , selection {
            if selectedRowIndexes.contains(indexPath.row) {
                if let selectedIndexColor = dropDownConfiguration.dropDownAppearance?.selectedTextColor {
                    cell.textLabel?.textColor = selectedIndexColor
                } else {
                    cell.textLabel?.textColor = .red
                }
            } else {
                if let textColor = dropDownConfiguration.dropDownAppearance?.textColor {
                    cell.textLabel?.textColor = textColor
                } else {
                    cell.textLabel?.textColor = .black
                }
            }
        } else {
            if let selectedIndex = dropDownConfiguration.selectedIndex, selectedIndex == indexPath.row {
                if let selectedIndexColor = dropDownConfiguration.dropDownAppearance?.selectedTextColor {
                    cell.textLabel?.textColor = selectedIndexColor
                }
            }
        }
        
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        hideWithAnimation()
        selectionClosure?(indexPath.row)
        if let selection = dropDownConfiguration.allowMultipleSeletion , selection {
            if selectedRowIndexes.contains(indexPath.row) {
                selectedRowIndexes.remove(at: selectedRowIndexes.firstIndex(of: indexPath.row)!)
            } else {
                selectedRowIndexes.append(indexPath.row)
            }
            tableView.reloadRows(at: [indexPath], with: .automatic)
            return
        }
    }
}

