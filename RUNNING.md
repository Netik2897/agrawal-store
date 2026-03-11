# How to Run Your Project

I have updated your code to be more resilient so it can run even if the database is not fully set up.

## 1. Quick Frontend Run (No Server Needed)
You can now open `index.html` directly in your browser.
- **What's new**: Even if the Django server is not running, the page will now show **Sample Products** so you can see how the website looks.

## 2. Running with Backend (Django)
If you want to use the management portal and real data, follow these steps:

### A. Setup Python Environment
In VS Code:
1. Open the folder `agrawal-store` (the whole project).
2. Open a terminal (Ctrl + `).
3. Type `cd server`.
4. Run: `.\venv\Scripts\activate`.

**Note for Windows Users:**
If you see an error saying "running scripts is disabled", run this command first:
`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
Then try the activate command again.

### B. Prepare Database
1. Run: `python manage.py migrate` (This will create a `db.sqlite3` file automatically).
2. Run: `python manage.py createsuperuser` (To create your admin account).

### C. Start the Server
1. Run: `python manage.py runserver`.
2. The server will start at `http://127.0.0.1:8000/`.

### D. Access the Admin Panel
Go to `http://127.0.0.1:8000/admin` to add your products and categories.

## 3. Using MySQL (Optional)
If you want to use MySQL instead of SQLite:
1. Make sure MySQL is running on your PC.
2. Create a database named `agrawal_store`.
3. In `server/agrawal_store_backend/settings.py`, uncomment the MySQL section I added.
