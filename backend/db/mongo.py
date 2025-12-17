import os
from mongoengine import connect, ConnectionFailure, get_connection
from dotenv import load_dotenv

load_dotenv()

def start_mongodb():
    uri = os.getenv('MONGO_URI')
    if not uri:
        uri = 'mongodb://localhost:27017'
        print('Mongo uri not found')

    try:
        connect(host=uri, alias='default', serverSelectionTimeoutMS=5000)
        conn = get_connection()
        conn.admin.command('ping')
        print('Mongo connected successfully')
    except ConnectionFailure as e:
        print(f"Mongo connection error : {e}")




