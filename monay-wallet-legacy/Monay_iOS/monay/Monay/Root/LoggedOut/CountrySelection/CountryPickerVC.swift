//
//  CountryPickerVC.swift
//  Monay
//
//  Created by Aayushi on 03/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class CountryPickerVC: UITableViewController {
  
  private let searchController = UISearchController(searchResultsController: nil)
  private var countries: [Country] = []
  private var filteredCountries: [Country] = []
  
  var didSelectCountry: ((Country) -> Void)?
  
  // MARK: - Lifecycle
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    self.title = LocalizedKey.pickCountry.value
    
    // Countries datasource
    self.countries.append(
      contentsOf: CountryPicker.countryNamesByCode
    )
    
    self.setupSearchController()
  }
  
  // MARK: - Private methods
  
  private func setupSearchController() {
    tableView.tableFooterView = UIView()
    searchController.searchResultsUpdater = self
    searchController.obscuresBackgroundDuringPresentation = false
    searchController.searchBar.placeholder = LocalizedKey.searchYourCountry.value
    searchController.searchBar.tintColor = .black
    navigationItem.searchController = searchController
    navigationItem.hidesSearchBarWhenScrolling = false
    navigationController?.navigationBar.tintColor = .black
    definesPresentationContext = true
  }
  
  private func searchBarEmpty() -> Bool {
    guard let text = searchController.searchBar.text else {
      return true
    }
    
    return text.trimmingCharacters(in: .whitespacesAndNewlines).count == 0
  }
  
  private func isFiltering() -> Bool {
    return searchController.isActive && !searchBarEmpty()
  }
  
  private func filterCountriesForSearchText(_ searchText: String) {
    filteredCountries = countries.filter({ (country) -> Bool in
      return country.name?.lowercased().contains(searchText.lowercased()) ?? false
    })
    
    tableView.reloadData()
  }
  
  // MARK: - Action methods
  
  @IBAction func didPressClose(_ sender: UIBarButtonItem) {
    self.dismiss(
      animated: true,
      completion: nil
    )
  }
}

// MARK: - Table view datasource

extension CountryPickerVC {
  
  override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return isFiltering() ? filteredCountries.count : countries.count
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    guard let cell = tableView.dequeueReusableCell(withIdentifier: CountryPickerCell.identifier, for: indexPath) as? CountryPickerCell else {
      return UITableViewCell()
    }
    
    let country = isFiltering() ? filteredCountries[indexPath.row] : countries[indexPath.row]
    
    cell.countryNameLabel.text = country.name
    cell.dialCodeLabel.text = country.phoneCode
    cell.flagImageView.image = country.flag
    
    return cell
  }
}

// MARK: - Table view delegate

extension CountryPickerVC {
  
  override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    let country = isFiltering() ? filteredCountries[indexPath.row] : countries[indexPath.row]
    didSelectCountry?(country)
    
    if searchController.isActive {
      searchController.isActive = false
    }
    
    self.dismiss(
      animated: true,
      completion: nil
    )
  }
}

// MARK: - UISearch result updating delegate

extension CountryPickerVC: UISearchResultsUpdating {
  
  func updateSearchResults(for searchController: UISearchController) {
    let searchText = searchController.searchBar.text ?? ""
    
    self.filterCountriesForSearchText(
      searchText.trimmingCharacters(in: .whitespacesAndNewlines)
    )
  }
}
