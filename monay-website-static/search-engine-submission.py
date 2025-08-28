#!/usr/bin/env python3
"""
Search Engine Submission Script for Monay Website
Automatically submits sitemap to major search engines
"""

import requests
import json
import time
from urllib.parse import quote
from datetime import datetime

class SearchEngineSubmitter:
    def __init__(self, website_url="https://monay.com"):
        self.website_url = website_url.rstrip('/')
        self.sitemap_url = f"{self.website_url}/sitemap.xml"
        self.results = []
        
    def submit_to_google(self):
        """Submit sitemap to Google"""
        try:
            print("📍 Submitting to Google...")
            ping_url = f"http://www.google.com/ping?sitemap={quote(self.sitemap_url)}"
            response = requests.get(ping_url, timeout=30)
            
            if response.status_code == 200:
                print("✅ Google: Sitemap submitted successfully")
                self.results.append(("Google", "Success", ping_url))
                return True
            else:
                print(f"⚠️  Google: Response code {response.status_code}")
                self.results.append(("Google", f"Code {response.status_code}", ping_url))
                return False
        except Exception as e:
            print(f"❌ Google: Error - {str(e)}")
            self.results.append(("Google", f"Error: {str(e)}", ""))
            return False
    
    def submit_to_bing(self):
        """Submit sitemap to Bing (also submits to Yahoo)"""
        try:
            print("📍 Submitting to Bing/Yahoo...")
            ping_url = f"http://www.bing.com/ping?sitemap={quote(self.sitemap_url)}"
            response = requests.get(ping_url, timeout=30)
            
            if response.status_code == 200:
                print("✅ Bing/Yahoo: Sitemap submitted successfully")
                self.results.append(("Bing/Yahoo", "Success", ping_url))
                return True
            else:
                print(f"⚠️  Bing/Yahoo: Response code {response.status_code}")
                self.results.append(("Bing/Yahoo", f"Code {response.status_code}", ping_url))
                return False
        except Exception as e:
            print(f"❌ Bing/Yahoo: Error - {str(e)}")
            self.results.append(("Bing/Yahoo", f"Error: {str(e)}", ""))
            return False
    
    def submit_to_yandex(self):
        """Submit sitemap to Yandex (Russian search engine)"""
        try:
            print("📍 Submitting to Yandex...")
            ping_url = f"http://blogs.yandex.ru/pings/?status=success&url={quote(self.sitemap_url)}"
            response = requests.get(ping_url, timeout=30)
            
            if response.status_code == 200:
                print("✅ Yandex: Sitemap submitted successfully")
                self.results.append(("Yandex", "Success", ping_url))
                return True
            else:
                print(f"⚠️  Yandex: Response code {response.status_code}")
                self.results.append(("Yandex", f"Code {response.status_code}", ping_url))
                return False
        except Exception as e:
            print(f"❌ Yandex: Error - {str(e)}")
            self.results.append(("Yandex", f"Error: {str(e)}", ""))
            return False
    
    def submit_to_indexnow(self):
        """Submit to IndexNow (Bing, Yandex, Seznam.cz, etc.)"""
        try:
            print("📍 Submitting to IndexNow (Multiple engines)...")
            
            # You'll need to generate a key and place it at /indexnow-key.txt
            key = "e4a8b9c7d6f5e3a2b1c9d8e7f6a5b4c3"  # Generate your own unique key
            
            data = {
                "host": "monay.com",
                "key": key,
                "keyLocation": f"{self.website_url}/indexnow-{key}.txt",
                "urlList": [
                    self.website_url,
                    f"{self.website_url}/products",
                    f"{self.website_url}/solutions",
                    f"{self.website_url}/about",
                    f"{self.website_url}/contact",
                    f"{self.website_url}/pilot-program"
                ]
            }
            
            # Submit to Bing's IndexNow endpoint
            response = requests.post(
                "https://api.indexnow.org/indexnow",
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code in [200, 202]:
                print("✅ IndexNow: URLs submitted successfully")
                self.results.append(("IndexNow", "Success", "https://api.indexnow.org"))
                return True
            else:
                print(f"⚠️  IndexNow: Response code {response.status_code}")
                self.results.append(("IndexNow", f"Code {response.status_code}", ""))
                return False
        except Exception as e:
            print(f"❌ IndexNow: Error - {str(e)}")
            self.results.append(("IndexNow", f"Error: {str(e)}", ""))
            return False
    
    def generate_submission_report(self):
        """Generate a submission report"""
        report = []
        report.append("\n" + "="*60)
        report.append("📊 SEARCH ENGINE SUBMISSION REPORT")
        report.append("="*60)
        report.append(f"Website: {self.website_url}")
        report.append(f"Sitemap: {self.sitemap_url}")
        report.append(f"Submission Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("-"*60)
        
        for engine, status, url in self.results:
            report.append(f"\n{engine}:")
            report.append(f"  Status: {status}")
            if url:
                report.append(f"  URL: {url}")
        
        report.append("\n" + "="*60)
        return "\n".join(report)
    
    def submit_all(self):
        """Submit to all search engines"""
        print("\n🚀 Starting Search Engine Submission")
        print("="*60)
        
        # Submit to each search engine
        self.submit_to_google()
        time.sleep(2)  # Be polite, wait between submissions
        
        self.submit_to_bing()
        time.sleep(2)
        
        self.submit_to_yandex()
        time.sleep(2)
        
        self.submit_to_indexnow()
        
        # Generate and save report
        report = self.generate_submission_report()
        print(report)
        
        # Save report to file
        report_file = "/Users/alisaberi/Downloads/monay/monay-website-static/search-submission-report.txt"
        with open(report_file, 'w') as f:
            f.write(report)
        print(f"\n📁 Report saved to: {report_file}")
        
        return self.results


def create_indexnow_key():
    """Create IndexNow key file"""
    key = "e4a8b9c7d6f5e3a2b1c9d8e7f6a5b4c3"  # Generate your own unique key
    key_file = f"/Users/alisaberi/Downloads/monay/monay-website-static/out/indexnow-{key}.txt"
    
    with open(key_file, 'w') as f:
        f.write(key)
    
    print(f"✅ IndexNow key file created: {key_file}")
    print(f"   Key: {key}")
    print("   Upload this file to your website root directory")
    return key


def validate_sitemap(sitemap_path):
    """Validate that sitemap exists and is readable"""
    import os
    
    if not os.path.exists(sitemap_path):
        print(f"❌ Sitemap not found at: {sitemap_path}")
        return False
    
    try:
        with open(sitemap_path, 'r') as f:
            content = f.read()
            if '<?xml' in content and '<urlset' in content:
                print(f"✅ Sitemap validated: {sitemap_path}")
                return True
            else:
                print(f"⚠️  File exists but doesn't appear to be a valid sitemap")
                return False
    except Exception as e:
        print(f"❌ Error reading sitemap: {str(e)}")
        return False


if __name__ == "__main__":
    print("\n🔍 Monay Website Search Engine Submission Tool")
    print("="*60)
    
    # Validate sitemap exists
    sitemap_path = "/Users/alisaberi/Downloads/monay/monay-website-static/sitemap.xml"
    if not validate_sitemap(sitemap_path):
        print("\n⚠️  Please ensure sitemap.xml exists before submitting")
        exit(1)
    
    print("\nThis tool will submit your website to:")
    print("✓ Google")
    print("✓ Bing (includes Yahoo)")
    print("✓ Yandex")
    print("✓ IndexNow (multiple engines)")
    print("\n" + "="*60)
    
    # Get website URL
    website_url = input("\nEnter your website URL (default: https://monay.com): ").strip()
    if not website_url:
        website_url = "https://monay.com"
    
    # Create IndexNow key file
    print("\n📝 Creating IndexNow key file...")
    create_indexnow_key()
    
    # Confirm submission
    confirm = input("\nProceed with submission? (yes/no): ").strip().lower()
    
    if confirm == 'yes':
        submitter = SearchEngineSubmitter(website_url)
        submitter.submit_all()
        
        print("\n✅ Submission process complete!")
        print("\n📋 Next Steps:")
        print("1. Sign up for Google Search Console: https://search.google.com/search-console")
        print("2. Sign up for Bing Webmaster Tools: https://www.bing.com/webmasters")
        print("3. Verify your website ownership in both consoles")
        print("4. Monitor indexing progress in the consoles")
        print("5. Submit additional URLs as needed")
    else:
        print("\n❌ Submission cancelled")