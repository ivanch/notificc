import os
import time
from src.driver import get_driver

def test_selenium_get():
    ss_file = 'screenshots/ss-test.png'
    driver = get_driver()
    driver.get('https://google.com')
    time.sleep(1)
    driver.save_screenshot(ss_file)

    assert os.path.exists(ss_file)