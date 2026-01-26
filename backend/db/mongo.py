import os
import logging
import certifi
from mongoengine import connect, ConnectionFailure, get_connection
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()


def start_mongodb():
    uri = os.getenv("MONGO_URI")
    ssl_enabled = "srv" in uri
    logger.info(f"Mongo URI: {uri}")
    if not uri:
        uri = "mongodb://localhost:27017"
        print("Mongo uri not found")

    try:
        connect(
            host=uri,
            alias="default",
            serverSelectionTimeoutMS=5000,
            tls=ssl_enabled,
            # tlsCAFile=certifi.where()
        )
        conn = get_connection()
        conn.admin.command("ping")
        print("Mongo connected successfully")
    except ConnectionFailure as e:
        print(f"Mongo connection error : {e}")
