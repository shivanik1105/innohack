import requests
import json
import hashlib
import base64
from io import BytesIO
from PIL import Image
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class IPFSService:
    """Service for uploading files to IPFS and managing hashes"""
    
    def __init__(self):
        # Use Pinata as IPFS provider (free tier available)
        self.pinata_api_url = "https://api.pinata.cloud"
        self.pinata_api_key = getattr(settings, 'PINATA_API_KEY', 'your_pinata_api_key')
        self.pinata_secret_key = getattr(settings, 'PINATA_SECRET_KEY', 'your_pinata_secret_key')
        
        # Alternative: Use local IPFS node
        self.local_ipfs_url = getattr(settings, 'IPFS_NODE_URL', 'http://localhost:5001')
        self.use_pinata = getattr(settings, 'USE_PINATA_IPFS', True)
    
    def upload_file_to_ipfs(self, file_data, filename, metadata=None):
        """
        Upload file to IPFS and return hash
        
        Args:
            file_data: File content (bytes or base64 string)
            filename: Original filename
            metadata: Optional metadata dict
            
        Returns:
            dict: {'success': bool, 'ipfs_hash': str, 'error': str}
        """
        try:
            # Convert base64 to bytes if needed
            if isinstance(file_data, str):
                if file_data.startswith('data:'):
                    # Remove data URL prefix
                    file_data = file_data.split(',')[1]
                file_bytes = base64.b64decode(file_data)
            else:
                file_bytes = file_data
            
            # Optimize image if it's an image file
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                file_bytes = self._optimize_image(file_bytes)
            
            if self.use_pinata:
                return self._upload_to_pinata(file_bytes, filename, metadata)
            else:
                return self._upload_to_local_ipfs(file_bytes, filename, metadata)
                
        except Exception as e:
            logger.error(f"IPFS upload failed: {str(e)}")
            return {
                'success': False,
                'ipfs_hash': None,
                'error': str(e)
            }
    
    def _upload_to_pinata(self, file_bytes, filename, metadata):
        """Upload to Pinata IPFS service"""
        try:
            headers = {
                'pinata_api_key': self.pinata_api_key,
                'pinata_secret_api_key': self.pinata_secret_key
            }
            
            files = {
                'file': (filename, BytesIO(file_bytes))
            }
            
            # Add metadata if provided
            pinata_metadata = {
                'name': filename,
                'keyvalues': metadata or {}
            }
            
            data = {
                'pinataMetadata': json.dumps(pinata_metadata),
                'pinataOptions': json.dumps({
                    'cidVersion': 1
                })
            }
            
            response = requests.post(
                f"{self.pinata_api_url}/pinning/pinFileToIPFS",
                headers=headers,
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'ipfs_hash': result['IpfsHash'],
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'ipfs_hash': None,
                    'error': f"Pinata API error: {response.status_code}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'ipfs_hash': None,
                'error': f"Pinata upload failed: {str(e)}"
            }
    
    def _upload_to_local_ipfs(self, file_bytes, filename, metadata):
        """Upload to local IPFS node"""
        try:
            files = {
                'file': (filename, BytesIO(file_bytes))
            }
            
            response = requests.post(
                f"{self.local_ipfs_url}/api/v0/add",
                files=files,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'ipfs_hash': result['Hash'],
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'ipfs_hash': None,
                    'error': f"Local IPFS error: {response.status_code}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'ipfs_hash': None,
                'error': f"Local IPFS upload failed: {str(e)}"
            }
    
    def _optimize_image(self, image_bytes, max_size=(1024, 1024), quality=85):
        """Optimize image for IPFS storage"""
        try:
            image = Image.open(BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Resize if too large
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            output = BytesIO()
            image.save(output, format='JPEG', quality=quality, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            logger.warning(f"Image optimization failed: {str(e)}")
            return image_bytes
    
    def get_ipfs_url(self, ipfs_hash):
        """Get public URL for IPFS hash"""
        if not ipfs_hash:
            return None
        
        # Use public IPFS gateway
        return f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
    
    def verify_ipfs_hash(self, ipfs_hash):
        """Verify that IPFS hash exists and is accessible"""
        try:
            url = self.get_ipfs_url(ipfs_hash)
            response = requests.head(url, timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def generate_file_hash(self, file_data):
        """Generate SHA-256 hash of file for verification"""
        if isinstance(file_data, str):
            if file_data.startswith('data:'):
                file_data = file_data.split(',')[1]
            file_bytes = base64.b64decode(file_data)
        else:
            file_bytes = file_data
        
        return hashlib.sha256(file_bytes).hexdigest()
