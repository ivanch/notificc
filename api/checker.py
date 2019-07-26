from time import sleep, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import sqlite3
import cv2
import glob
import sys
import os
import configparser
import urllib.request, json

EMAIL_USER = ""
EMAIL_PASS = ""

SMTP_SERVER = ""
SMTP_PORT = -1
SMTP_TTLS = True

DELAY = 120 # 1 day by default if config doesn't load
THRESHOLD_PC = 0.05 # difference percentage on the images

def message(title, link):
    FROM = EMAIL_USER
    TO = [EMAIL_USER] # must be a list

    # Prepare actual message
    message = """From: %s\r\nTo: %s\r\nSubject: %s\r\n\

    URL seems to have changed:
    %s

    Automatic Message.
    """ % (FROM, ", ".join(TO), "Change in '%s'" % (title), link)

    # Send the mail

    message = message.encode("ascii", errors="ignore")

    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    if(SMTP_TTLS): server.starttls()
    server.ehlo()
    server.login(EMAIL_USER, EMAIL_PASS)
    server.sendmail(FROM, TO, message)
    server.close()

def get_websites():
    urls = []
    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM urls")
        results = cursor.fetchall()
        
        for result in results:
            urls.append({'id':result[0], 'url':result[1], 'enabled': True if result[4] == 1 else False})
    return urls

# Check if 2 images are different
def compare(index):
    new = cv2.imread('screenshots/ss-%d.png' % (index))
    old = cv2.imread('screenshots/old-ss-%d.png' % (index))

    if(not os.path.isfile('screenshots/old-ss-%d.png' % (index))): return False

    if(len(new) != len(old)): return True
    if(len(new[0]) != len(old[0])): return True

    # Limit the height to 1080px
    if(len(new) > 1080):
        new = new[:1080]
        old = old[:1080]

    count = 0
    for i in range(len(new)):
        for j in range(len(old[i])):
            if(all(new[i,j] != old[i,j])): count += 1
    diff_max = (len(new)*len(new[0]))*THRESHOLD_PC
    if(count > diff_max): return True

    # It's not different (or not too different)
    return False

def loop(stop_checker):
    while True:
        try:
            start = time() # to "normalize" time
            if(not stop_checker()):
                urls = get_websites()

                chrome_options = Options()
                chrome_options.add_argument("--headless")
                chrome_options.add_argument("--no-sandbox")
                chrome_options.add_argument("--window-size=1920x1080")
                driver = webdriver.Chrome(chrome_options=chrome_options)

                for url in urls:
                    id = url['id']
                    link = url['url']

                    driver.get(link)
                    sleep(1)
                    driver.get_screenshot_as_file('screenshots/ss-%d.png' % (id))

                    r = compare(id)
                    if(r): # has changed
                        message(driver.title, link)

                    os.rename("screenshots/ss-%d.png" % (id), "screenshots/old-ss-%d.png" % (id))

                driver.close()
            t = DELAY - (time() - start)
            if(t < 0): t = 0
            sleep(t)
        except KeyboardInterrupt:
            break

def run(_EMAIL_USER, _EMAIL_PASS, _SMTP_SERVER, _SMTP_PORT, _SMTP_TTLS, stop_checker):
    global EMAIL_USER, EMAIL_PASS, SMTP_SERVER, SMTP_PORT, SMTP_TTLS

    # Load email credentials
    EMAIL_USER = _EMAIL_USER
    EMAIL_PASS = _EMAIL_PASS
    if(EMAIL_USER == "example@example.com" and EMAIL_PASS == "password"):
        print("Credentials not properly set.")
        sys.exit(1)

    SMTP_SERVER = _SMTP_SERVER
    SMTP_PORT = _SMTP_PORT
    SMTP_TTLS = True if _SMTP_TTLS == 1 else False
    if(SMTP_SERVER == "SMTP.server.com" or SMTP_PORT == 80):
        print("SMTP server not properly set.")
        sys.exit(1)

    # Process files
    if(not os.path.isdir("screenshots")):
        os.mkdir("screenshots")
    for file in glob.iglob("screenshots/ss-*.png"):
        os.remove(file)

    # Start the main loop on a new thread
    loop(stop_checker)
