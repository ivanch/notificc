from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def get_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-features=VizDisplayCompositor')

    driver = webdriver.Chrome(options=options)

    driver.set_window_size(1920, 1080)

    return driver