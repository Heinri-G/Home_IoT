# This file makes Python treat the `app` directory as a package.

# You can optionally initialize parts of your application here,
# or define what gets imported when `from app import *` is used.

# For example, to make the FastAPI app instance easily accessible:
# from .main import app

# To make models or crud functions accessible:
# from . import models, crud, schemas

# To initialize logging or other services:
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Plant Care Backend Application package initialized.")
