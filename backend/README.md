# Number Nest Backend

Backend API for Number Nest, a course management and learning platform built with Django and MongoDB.

## Tech Stack

- Django 6.0
- Django REST Framework
- MongoDB with MongoEngine
- Python 3.x

## Project Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Start the development server**
   ```bash
   python manage.py runserver
   ```

The backend API will be available at `http://localhost:8000`


## Shell Helper
Instead of default shell of python developer can use ipython. Just install it using pip install ipython and then run the following command
   ```bash
   ipython
   ```

