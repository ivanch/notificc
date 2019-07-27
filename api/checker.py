from time import sleep, time
from selenium import webdriver
import sqlite3
import smtplib
from PIL import Image
import numpy as np
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

DELAY = 120 # 2 minutes by default

def message(title, link):
    if(EMAIL_USER == "example@example.com"):
        return

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
    with sqlite3.connect('data/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM urls")
        results = cursor.fetchall()
        
        for result in results:
            if(result[4] == 1): # if the url is enabled
                urls.append({'id': result[0], 'url': result[1], 'threshold': result[3]})
    return urls

# Check if 2 images are different
def compare(index, thresh):    
    if(not os.path.isfile('screenshots/old-ss-%d.png' % (index))): return False

    new = Image.open('screenshots/ss-%d.png' % (index))
    old = Image.open('screenshots/old-ss-%d.png' % (index))

    new = np.array(new)
    old = np.array(old)

    # Limit the height to 1080px
    if(len(new) > 1080):
        new = new[:1080]
        old = old[:1080]

    if(len(new) != len(old)): return True
    if(len(new[0]) != len(old[0])): return True

    count = 0
    for i in range(len(new)):
        for j in range(len(old[i])):
            if(all(new[i,j] != old[i,j])): count += 1
    diff_max = (len(new)*len(new[0]))*(thresh/100)

    print(thresh/100, count)
    if(count > diff_max): return True

    # It's not different (or not too different)
    return False

def loop(stop_checker):
    while True:
        try:
            start = time() # to "normalize" time
            if(not stop_checker()):
                urls = get_websites()
                
                driver = webdriver.PhantomJS()
                driver.set_window_size(1920, 1080)

                for url in urls:
                    id = url['id']
                    link = url['url']

                    driver.get(link)
                    sleep(1)
                    driver.save_screenshot('screenshots/ss-%d.png' % (id))

                    r = compare(id, url['threshold'])
                    if(r): # has changed
                        message(driver.title, link)

                    os.rename("screenshots/ss-%d.png" % (id), "screenshots/old-ss-%d.png" % (id))

                driver.quit()
            t = DELAY - (time() - start)
            if(t < 0): t = 0
            sleep(t)
        except KeyboardInterrupt:
            break

def run(stop_checker):
    global EMAIL_USER, EMAIL_PASS, SMTP_SERVER, SMTP_PORT, SMTP_TTLS, DELAY

    with sqlite3.connect('data/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()

    # Load email credentials
    EMAIL_USER = result[1]
    EMAIL_PASS = result[2]

    SMTP_SERVER = result[3]
    SMTP_PORT = result[4]
    SMTP_TTLS = True if result[5] == 1 else False

    DELAY = result[7]

    # Process files
    if(not os.path.isdir("screenshots")):
        os.mkdir("screenshots")
    for file in glob.iglob("screenshots/ss-*.png"):
        os.remove(file)

    # Start the main loop on a new thread
    loop(stop_checker)
