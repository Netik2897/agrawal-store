import cloudinary
import cloudinary.api
import os
from dotenv import load_dotenv

load_dotenv()

# THE ABSOLUTE SIMPLEST WAY
cloudinary.config(
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
  api_key = os.getenv('CLOUDINARY_API_KEY'),
  api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

try:
    # This call requires a valid API key and secret
    res = cloudinary.api.ping()
    print("SUCCESS: Cloudinary is connected!")
except Exception as e:
    print(f"FAILURE: {e}")
