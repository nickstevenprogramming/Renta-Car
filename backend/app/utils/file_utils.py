import os
from werkzeug.utils import secure_filename
import uuid

def allowed_file(filename, allowed_ext):
    if not filename:
        return False
    ext = filename.rsplit('.', 1)[-1].lower()
    return ext in allowed_ext

def unique_filename(filename):
    safe = secure_filename(filename)
    if '.' in safe:
        base, ext = safe.rsplit('.', 1)
        return f"{base}_{uuid.uuid4().hex}.{ext}"
    return f"{safe}_{uuid.uuid4().hex}"
