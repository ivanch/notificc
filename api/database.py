import os
import sqlite3

def setup_db():
    # Setup databaset, if new
    if(not os.path.isfile("shared/data.db")):
        conn = sqlite3.connect('shared/data.db')
        cursor = conn.cursor()

        cursor.execute("CREATE TABLE IF NOT EXISTS urls (\
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,\
                name TEXT NOT NULL, \
                url TEXT NOT NULL, \
                threshold INTEGER NOT NULL, \
                enabled INTEGER NOT NULL);")

        cursor.execute("CREATE TABLE IF NOT EXISTS config (\
                id INTEGER PRIMARY KEY CHECK (id = 0),\
                auth_pass TEXT, \
                delay INTEGER);")

        cursor.execute("CREATE TABLE IF NOT EXISTS logs ( \
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
                name TEXT NOT NULL, \
                url TEXT NOT NULL, \
                title TEXT NOT NULL, \
                read INTEGER NOT NULL, \
                time timestamp);")
        
        cursor.execute("CREATE TABLE IF NOT EXISTS tokens (\
                token TEXT NOT NULL PRIMARY KEY);")
                
        cursor.execute("INSERT INTO config  (id, auth_pass , delay) \
                        VALUES              (0 , 'password', 120);")
        
        conn.commit()
    else:
        # Reset all access tokens
        with sqlite3.connect('shared/data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tokens;")
            conn.commit()