//
//  PickerView.swift
//

import UIKit

class PickerView: UIView, UIPickerViewDelegate, UIPickerViewDataSource {
    static let identifier = "PickerView"
    enum PickerType: Int {
        case datePicker, timePicker, textPicker
    }
    
    // MARK: - Instance properties
    
    var months: [String] = []
    var years: [String] = []
    var pickerType: PickerType = .datePicker
    var pickerHandler: ((PickerType, String, String) -> Void)?
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var viewContainerBottom: NSLayoutConstraint!
    @IBOutlet weak var pickerText: UIPickerView!
    @IBOutlet weak var pickerTime: UIDatePicker!
    
    // MARK: Class method to show picker
    
    class func showPicker(
        _ type: PickerType,
        months: [String],
        years: [String],
        minDate: Date? = nil,
        maxDate: Date? = nil,
        handler: @escaping (PickerType, String, String) -> Void) {
        
        let pickerView = UINib(
          nibName: PickerView.identifier,
            bundle: nil)
            .instantiate(
                withOwner: nil,
                options: nil)[0] as! PickerView // swiftlint:disable:this force_cast
        
        pickerView.frame = UIScreen.main.bounds
        UIApplication.shared.keyWindow?.endEditing(true)
        UIApplication.shared.keyWindow?.addSubview(pickerView)
        
        pickerView.pickerType = type
        pickerView.pickerHandler = handler
        pickerView.pickerTime.isHidden = true
        pickerView.pickerText.isHidden = true
        
        switch type {
        case .timePicker:
            pickerView.pickerTime.isHidden = false
            pickerView.pickerTime.datePickerMode = .time
            pickerView.pickerTime.minimumDate = minDate
            pickerView.pickerTime.maximumDate = maxDate
            
        case .datePicker:
            pickerView.pickerTime.isHidden = false
            pickerView.pickerTime.minimumDate = minDate
            pickerView.pickerTime.maximumDate = maxDate
            
        case .textPicker:
            pickerView.pickerText.isHidden = false
            pickerView.months = months
            pickerView.years = years
            pickerView.pickerText.reloadAllComponents()
        }
        pickerView.show()
    }
    
    func show() {
        self.layoutIfNeeded()
        viewContainerBottom.constant = 0
        self.backgroundColor = .clear
        UIView.animate(withDuration: 0.3) {
            self.layoutIfNeeded()
            self.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        }
    }
    
    func hide() {
        viewContainerBottom.constant = -250
        UIView.animate(withDuration: 0.3, animations: {
            self.layoutIfNeeded()
            self.backgroundColor = .clear
        }, completion: { _ in
            self.removeFromSuperview()
        })
    }
    
    func formatedStr(fromDate: Date) -> String {
        let format = DateFormatter()
      format.dateFormat = DateFormate.ddMMMyyyy.rawValue
        return format.string(from: fromDate)
    }
    
    // MARK: Text Picker Delegate methods
    
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 2
    }
    
    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        if component == 0 {
            return months.count
        } else {
            return years.count
        }
    }

    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        switch pickerType {
        case .datePicker:
            return ""
        case .textPicker:
            
            if component == 0 {
                return months[row]
            } else {
                return years[row]
            }
            
        default:
            return ""
        }
    }
    
    // MARK: Event Action Methods
    
    @IBAction func btnDone_Action(_ sender: UIButton) {
        
        if sender.tag == 1 {
            switch pickerType {
            case .textPicker :
                pickerHandler?(pickerType, months[pickerText.selectedRow(inComponent: 0)], years[pickerText.selectedRow(inComponent: 1)])
            case .timePicker:
                let formatter = DateFormatter()
              formatter.dateFormat = DateFormate.hhmma.rawValue
                let strTime = formatter.string(from: pickerTime.date)
                pickerHandler?(pickerType, strTime, "")
                
            case .datePicker:
                let formatter = DateFormatter()
              formatter.dateFormat = DateFormate.ddMMMyyyy.rawValue
                let strDate = formatter.string(from: pickerTime.date)
                pickerHandler?(pickerType, strDate, "")
            }
        }
        
        hide()
    }
    
}
