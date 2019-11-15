import os
import sqlite3

# Setups the databse
def setup_db():

    # Starts a connection
    conn = sqlite3.connect('shared/data.db')
    cursor = conn.cursor()

    # Creates the 'urls' table
    # Stores the registered websites
    cursor.execute("CREATE TABLE IF NOT EXISTS urls (\
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,\
            name TEXT NOT NULL, \
            url TEXT NOT NULL, \
            threshold INTEGER NOT NULL, \
            enabled INTEGER NOT NULL);")

    # Creates the 'config' table
    # Stores the configuration
    cursor.execute("CREATE TABLE IF NOT EXISTS config (\
            id INTEGER PRIMARY KEY CHECK (id = 0),\
            auth_pass TEXT, \
            autostart INTEGER, \
            delay INTEGER);")

    # Creates the 'logs' table
    # Stores the logs of website changes
    cursor.execute("CREATE TABLE IF NOT EXISTS logs ( \
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
            name TEXT NOT NULL, \
            url TEXT NOT NULL, \
            title TEXT NOT NULL, \
            read INTEGER NOT NULL, \
            time timestamp);")

    # Creates the 'tokens' table
    # Stores the access tokens
    cursor.execute("CREATE TABLE IF NOT EXISTS tokens (\
            token TEXT NOT NULL PRIMARY KEY);")
    
    # Creates the 'pms' table
    # Stores the push managers subscriptions
    cursor.execute("CREATE TABLE IF NOT EXISTS pms (\
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
            endpoint TEXT NOT NULL, \
            base_endpoint TEXT NOT NULL, \
            p256dh TEXT NOT NULL, \
            auth TEXT NOT NULL);")

    # Setup database, if new
    if(not os.path.isfile("shared/data.db")):
        # Inserts the initial (default) configuration into 'config' table
        cursor.execute("INSERT INTO config  (id, auth_pass , autostart, delay) \
                        VALUES              (0 , 'password', 0        , 120);")
        
        conn.commit()
    else: # If database file already exists
        
        # Remove all access tokens
        with sqlite3.connect('shared/data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tokens;")
            conn.commit()