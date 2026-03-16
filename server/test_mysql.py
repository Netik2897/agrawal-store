import pymysql
import sys

try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='', # Trying default empty password
        port=3306
    )
    print("Connection successful with empty password.")
    cursor = conn.cursor()
    cursor.execute("SHOW DATABASES")
    databases = [db[0] for db in cursor.fetchall()]
    print(f"Databases: {databases}")
    if 'agrawal_store' in databases:
        print("Database 'agrawal_store' already exists.")
    else:
        print("Database 'agrawal_store' does NOT exist.")
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
