from time import sleep, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from PIL import Image
from PIL import ImageChops
import sqlite3
import glob
import os
import datetime

from .functions.config import get_delay
from .functions.push import send_notification

def logWebsite(name, url, title):
    now = datetime.datetime.now()

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO logs (name, url , title , read , time) \
                        VALUES           (?   , ?   , ?     , 0    , ?);", (name, url, title, now))
        conn.commit()


def get_websites():
    urls = []
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM urls")
        results = cursor.fetchall()
        
        for result in results:
            if(result[4] == 1): # if the url is enabled
                urls.append({'id': result[0], 'name': result[1], 'url': result[2], 'threshold': result[3]})
    return urls

# Check if 2 images are different
def compare(index, thresh):
    if(not os.path.isfile('screenshots/old-ss-%d.png' % (index))):
        return False

    new = Image.open('screenshots/ss-%d.png' % (index))
    old = Image.open('screenshots/old-ss-%d.png' % (index))
    
    diff = ImageChops.difference(old, new)
    if diff.getbbox():
        bbox = diff.getbbox()

        total_size = new.size[0] * new.size[1]
        total_diff = ( (bbox[2]*bbox[3])/total_size ) * 100

        return total_diff > thresh
    
    return False

def loop(stop_checker):
    while True:
        try:
            start = time() # to "normalize" time
            DELAY = get_delay()

            if(not stop_checker()):
                urls = get_websites()

                options = Options()
                options.add_argument('--headless')
                options.add_argument('--no-sandbox')
                options.add_argument('--disable-dev-shm-usage')
                options.add_argument('--disable-features=VizDisplayCompositor')
 
                driver = webdriver.Chrome(chrome_options=options)

                driver.set_window_size(1920, 1080)
                for url in urls:

                    uid = url['id']
                    name = url['name']
                    link = url['url']

                    driver.get(link)
                    sleep(1)
                    driver.save_screenshot('screenshots/ss-%d.png' % (uid))

                    r = compare(uid, url['threshold'])
                    if(r): # has changed
                        logWebsite(name, link, driver.title)
                        send_notification(name, uid)
                    
                    os.rename("screenshots/ss-%d.png" % (uid), "screenshots/old-ss-%d.png" % (uid))

                driver.quit()
            t = DELAY - (time() - start)
            if t < 0:
                t = 0
            t = int(t)
            sleep(t)
        except KeyboardInterrupt:
            break

def run(stop_checker):
    # Process files
    if(not os.path.isdir("screenshots")):
        os.mkdir("screenshots")
    for l_file in glob.iglob("screenshots/ss-*.png"):
        os.remove(l_file)

    # Start the main loop on a new thread
    loop(stop_checker)
