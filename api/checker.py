from time import sleep, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import smtplib
import cv2
import glob
import sys
import os
import configparser

EMAIL_USER = ""
EMAIL_PASS = ""

IMAP_SERVER = ""
IMAP_PORT = -1

DELAY = -1 # 1 day by default if config doesn't load
THRESHOLD_PC = 0.05 # difference percentage on the images

def message(title, link):
    FROM = EMAIL_USER
    TO = [EMAIL_USER] # must be a list

    # Prepare actual message
    message = """From: %s\r\nTo: %s\r\nSubject: %s\r\n\

    URL aparenta ter mudado:
    %s

    Mensagem Automatica.
    """ % (FROM, ", ".join(TO), f"Alteracao em '{title}'", link)

    # Send the mail

    message = message.encode("ascii", errors="ignore")

    server = smtplib.SMTP(IMAP_SERVER, IMAP_PORT)
    server.starttls()
    server.ehlo()
    server.login(EMAIL_USER, EMAIL_PASS)
    server.sendmail(FROM, TO, message)
    server.close()

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

def loop():
    while True:
        try:
            start = time() # to "normalize" time
            with open("links","r") as file:
                lines = file.readlines()

                chrome_options = Options()
                chrome_options.add_argument("--headless")
                chrome_options.add_argument("--no-sandbox")
                chrome_options.add_argument("--window-size=1920x1080")
                driver = webdriver.Chrome(chrome_options=chrome_options)

                for i,link in enumerate(lines):
                    if(link.startswith("#")): continue

                    driver.get(link)
                    sleep(1)
                    driver.get_screenshot_as_file('screenshots/ss-%d.png' % (i))

                    r = compare(i)
                    if(r): # has changed
                        message(driver.title, link)

                    os.rename("screenshots/ss-%d.png" % (i), "screenshots/old-ss-%d.png" % (i))

                driver.close()
            t = DELAY - (time() - start)
            if(t < 0): t = 0
            sleep(t)
        except KeyboardInterrupt:
            break

def run():
    global EMAIL_USER, EMAIL_PASS, IMAP_SERVER, IMAP_PORT, DELAY, THRESHOLD_PC
    config = configparser.ConfigParser()
    config.read("config.ini")

    # Load email credentials
    EMAIL_USER = config['Credentials']['user']
    EMAIL_PASS = config['Credentials']['password']
    if(EMAIL_USER == "" or EMAIL_PASS == ""):
        print("Credentials not properly set.")
        sys.exit(1)

    # Load IMAP server configuration
    IMAP_SERVER = config['IMAP']['server']
    IMAP_PORT = int(config['IMAP']['port'])
    if(IMAP_SERVER == "" or IMAP_PORT == -1):
        print("IMAP server not properly set.")
        sys.exit(1)
    
    # Load checker configuration
    DELAY = float(config['Checker']['delay'])
    THRESHOLD_PC = float(config['Checker']['threshold'])

    # Process files
    if(not os.path.isdir("screenshots")):
        os.mkdir("screenshots")
    for file in glob.iglob("screenshots/ss-*.png"):
        os.remove(file)

    # Start the main loop on a new thread
    loop()
